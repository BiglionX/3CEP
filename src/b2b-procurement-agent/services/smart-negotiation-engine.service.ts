import { generateUUID } from "@/fcx-system/utils/helpers";
import { createClient } from "@supabase/supabase-js";
import {
  NegotiationHistory,
  NegotiationResult,
  NegotiationRoundDTO,
  NegotiationSession,
  NegotiationStatus,
  SessionStatus,
  StartNegotiationDTO,
} from "../models/negotiation.model";
import { NegotiationStrategyService } from "./negotiation-strategy.service";
import { SupplierRecommendationService } from "./supplier-recommendation.service";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class SmartNegotiationEngine {
  private strategyService: NegotiationStrategyService;
  private recommendationService: SupplierRecommendationService;

  constructor() {
    this.strategyService = new NegotiationStrategyService();
    this.recommendationService = new SupplierRecommendationService();
  }

  /**
   * 启动议价会话
   */
  async startNegotiation(dto: StartNegotiationDTO): Promise<{
    success: boolean;
    sessionId?: string;
    session?: NegotiationSession;
    advice?: any;
    errorMessage?: string;
  }> {
    try {
      // 1. 验证输入参数
      const validation = this.validateStartNegotiation(dto);
      if (!validation.isValid) {
        return {
          success: false,
          errorMessage: validation.errors.join("; "),
        };
      }

      // 2. 获取供应商信息和评分
      const supplier = await this.recommendationService.getSupplierWithRating(
        dto.supplierId
      );
      if (!supplier) {
        return {
          success: false,
          errorMessage: "供应商信息不存在",
        };
      }

      // 3. 生成议价建议
      const advice = await this.strategyService.generateNegotiationAdvice(
        supplier,
        dto.targetPrice,
        dto.initialQuote
      );

      // 4. 创建议价会话
      const sessionId = `NEG-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 6)}`;
      const session = await this.createNegotiationSession({
        ...dto,
        sessionId,
        createdBy: "system", // TODO: 从认证中获取实际用户ID
      });

      // 5. 记录初始议价历史
      await this.recordNegotiationRound({
        sessionId: session.sessionId,
        roundNumber: 0,
        ourInitialOffer: dto.initialQuote,
        supplierQuote: dto.initialQuote,
        ourCounterOffer: advice.recommendedPrice,
        strategyUsed: advice.strategyToUse,
        confidenceLevel: advice.confidence,
        remarks: "初始议价回合",
      });

      return {
        success: true,
        sessionId: session.sessionId,
        session,
        advice,
      };
    } catch (error) {
      console.error("启动议价会话错误:", error);
      return {
        success: false,
        errorMessage: `启动议价会话失败: ${(error as Error).message}`,
      };
    }
  }

  /**
   * 执行议价回合
   */
  async executeNegotiationRound(dto: NegotiationRoundDTO): Promise<{
    success: boolean;
    result?: NegotiationResult;
    nextOffer?: number;
    strategyUsed?: string;
    errorMessage?: string;
  }> {
    try {
      // 1. 获取会话信息
      const session = await this.getNegotiationSession(dto.sessionId);
      if (!session) {
        return {
          success: false,
          errorMessage: "议价会话不存在",
        };
      }

      if (session.status !== SessionStatus.NEGOTIATING) {
        return {
          success: false,
          errorMessage: "议价会话不在进行中状态",
        };
      }

      // 2. 获取历史记录
      const history = await this.getNegotiationHistory(dto.sessionId);
      const currentRound = history.length;

      // 3. 检查是否达到最大轮次
      if (currentRound >= session.maxRounds) {
        const result = await this.endNegotiation(
          dto.sessionId,
          NegotiationStatus.FAILED
        );
        return {
          success: true,
          result: {
            sessionId: dto.sessionId,
            status: NegotiationStatus.FAILED,
            totalRounds: currentRound,
            success: false,
            message: "已达最大议价轮次限制",
          },
        };
      }

      // 4. 获取供应商信息
      const supplier = await this.recommendationService.getSupplierWithRating(
        session.supplierId
      );
      if (!supplier) {
        return {
          success: false,
          errorMessage: "供应商信息不存在",
        };
      }

      // 5. 生成新的议价建议
      const lastRound = history[history.length - 1];
      const advice = await this.strategyService.generateNegotiationAdvice(
        supplier,
        session.targetPrice,
        dto.supplierQuote
      );

      // 6. 记录本次议价回合
      await this.recordNegotiationRound({
        sessionId: dto.sessionId,
        roundNumber: currentRound,
        ourInitialOffer: lastRound?.ourCounterOffer || session.initialQuote,
        supplierQuote: dto.supplierQuote,
        ourCounterOffer: advice.recommendedPrice,
        strategyUsed: advice.strategyToUse,
        confidenceLevel: advice.confidence,
        remarks: dto.roundRemarks,
      });

      // 7. 检查是否达成协议
      const priceGap =
        Math.abs(dto.supplierQuote - advice.recommendedPrice) /
        advice.recommendedPrice;
      let negotiationStatus: NegotiationStatus;

      if (priceGap <= 0.02) {
        // 价格差距在2%以内视为达成协议
        negotiationStatus = NegotiationStatus.SUCCESS;
        await this.endNegotiation(
          dto.sessionId,
          NegotiationStatus.SUCCESS,
          advice.recommendedPrice
        );
      } else if (currentRound >= session.maxRounds - 1) {
        negotiationStatus = NegotiationStatus.FAILED;
        await this.endNegotiation(dto.sessionId, NegotiationStatus.FAILED);
      } else {
        negotiationStatus = NegotiationStatus.ONGOING;
        // 更新会话状态为进行中
        await this.updateSessionStatus(
          dto.sessionId,
          SessionStatus.NEGOTIATING
        );
      }

      return {
        success: true,
        nextOffer: advice.recommendedPrice,
        strategyUsed: advice.strategyToUse,
        result: {
          sessionId: dto.sessionId,
          status: negotiationStatus,
          finalPrice:
            negotiationStatus === NegotiationStatus.SUCCESS
              ? advice.recommendedPrice
              : undefined,
          discountRate:
            negotiationStatus === NegotiationStatus.SUCCESS
              ? ((session.initialQuote - advice.recommendedPrice) /
                  session.initialQuote) *
                100
              : undefined,
          totalRounds: currentRound + 1,
          totalTimeMinutes: Math.floor(
            (Date.now() - session.startTime.getTime()) / 60000
          ),
          strategyUsed: advice.strategyToUse,
          success: negotiationStatus === NegotiationStatus.SUCCESS,
          message: this.getResultMessage(
            negotiationStatus,
            advice.expectedDiscount
          ),
        },
      };
    } catch (error) {
      console.error("执行议价回合错误:", error);
      return {
        success: false,
        errorMessage: `执行议价回合失败: ${(error as Error).message}`,
      };
    }
  }

  /**
   * 获取议价会话状态
   */
  async getNegotiationStatus(sessionId: string): Promise<{
    session?: NegotiationSession;
    history: NegotiationHistory[];
    currentRound: number;
    statistics?: any;
  }> {
    try {
      const session = await this.getNegotiationSession(sessionId);
      if (!session) {
        throw new Error("议价会话不存在");
      }

      const history = await this.getNegotiationHistory(sessionId);
      const currentRound = history.length;

      // 计算统计信息
      const statistics = this.calculateStatistics(history, session);

      return {
        session,
        history,
        currentRound,
        statistics,
      };
    } catch (error) {
      console.error("获取议价状态错误:", error);
      throw error;
    }
  }

  /**
   * 接受最终报价
   */
  async acceptFinalOffer(sessionId: string): Promise<{
    success: boolean;
    result?: NegotiationResult;
    errorMessage?: string;
  }> {
    try {
      const session = await this.getNegotiationSession(sessionId);
      if (!session) {
        return {
          success: false,
          errorMessage: "议价会话不存在",
        };
      }

      const history = await this.getNegotiationHistory(sessionId);
      const lastRound = history[history.length - 1];

      if (!lastRound || !lastRound.ourCounterOffer) {
        return {
          success: false,
          errorMessage: "没有有效的报价可供接受",
        };
      }

      // 结束议价并记录成功
      const result = await this.endNegotiation(
        sessionId,
        NegotiationStatus.SUCCESS,
        lastRound.ourCounterOffer
      );

      return {
        success: true,
        result: {
          sessionId,
          status: NegotiationStatus.SUCCESS,
          finalPrice: lastRound.ourCounterOffer,
          discountRate:
            ((session.initialQuote - lastRound.ourCounterOffer) /
              session.initialQuote) *
            100,
          totalRounds: history.length,
          totalTimeMinutes: Math.floor(
            (Date.now() - session.startTime.getTime()) / 60000
          ),
          strategyUsed: lastRound.strategyUsed || "",
          success: true,
          message: "成功接受最终报价",
        },
      };
    } catch (error) {
      console.error("接受最终报价错误:", error);
      return {
        success: false,
        errorMessage: `接受最终报价失败: ${(error as Error).message}`,
      };
    }
  }

  /**
   * 取消议价会话
   */
  async cancelNegotiation(
    sessionId: string,
    reason?: string
  ): Promise<boolean> {
    try {
      await this.endNegotiation(sessionId, NegotiationStatus.CANCELLED);

      // 记录取消原因
      if (reason) {
        const session = await this.getNegotiationSession(sessionId);
        if (session) {
          await supabase.from("negotiation_history").insert({
            id: generateUUID(),
            procurement_request_id: session.procurementRequestId,
            supplier_id: session.supplierId,
            quotation_request_id: session.quotationRequestId,
            session_id: sessionId,
            round_number: 0,
            negotiation_status: "cancelled",
            remarks: `议价取消: ${reason}`,
            created_at: new Date(),
          });
        }
      }

      return true;
    } catch (error) {
      console.error("取消议价会话错误:", error);
      return false;
    }
  }

  // 私有辅助方法

  /**
   * 验证启动议价参数
   */
  private validateStartNegotiation(dto: StartNegotiationDTO): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!dto.procurementRequestId) {
      errors.push("采购需求ID不能为空");
    }

    if (!dto.supplierId) {
      errors.push("供应商ID不能为空");
    }

    if (!dto.targetPrice || dto.targetPrice <= 0) {
      errors.push("目标价格必须大于0");
    }

    if (!dto.initialQuote || dto.initialQuote <= 0) {
      errors.push("初始报价必须大于0");
    }

    if (dto.maxRounds && dto.maxRounds < 1) {
      errors.push("最大议价轮次必须至少为1");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建议价会话
   */
  private async createNegotiationSession(
    dto: any
  ): Promise<NegotiationSession> {
    const sessionId = generateUUID();
    const now = new Date();

    const { data, error } = await supabase
      .from("negotiation_sessions")
      .insert({
        id: sessionId,
        session_id: dto.sessionId,
        procurement_request_id: dto.procurementRequestId,
        supplier_id: dto.supplierId,
        quotation_request_id: dto.quotationRequestId,
        target_price: dto.targetPrice,
        initial_quote: dto.initialQuote,
        current_round: 1,
        max_rounds: dto.maxRounds || 5,
        status: SessionStatus.NEGOTIATING,
        start_time: now,
        created_by: dto.createdBy,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) throw new Error(`创建议价会话失败: ${error.message}`);

    return this.mapToSession(data);
  }

  /**
   * 记录议价回合
   */
  private async recordNegotiationRound(round: any): Promise<void> {
    const { error } = await supabase.from("negotiation_history").insert({
      id: generateUUID(),
      procurement_request_id: null, // 可以从会话中获取
      supplier_id: null, // 可以从会话中获取
      quotation_request_id: null, // 可以从会话中获取
      session_id: round.sessionId,
      round_number: round.roundNumber,
      our_initial_offer: round.ourInitialOffer,
      supplier_quote: round.supplierQuote,
      our_counter_offer: round.ourCounterOffer,
      negotiation_status: "ongoing",
      discount_rate:
        round.ourCounterOffer && round.supplierQuote
          ? ((round.supplierQuote - round.ourCounterOffer) /
              round.supplierQuote) *
            100
          : null,
      strategy_used: round.strategyUsed,
      confidence_level: round.confidenceLevel,
      remarks: round.remarks,
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (error) throw new Error(`记录议价回合失败: ${error.message}`);
  }

  /**
   * 结束议价会话
   */
  private async endNegotiation(
    sessionId: string,
    status: NegotiationStatus,
    finalPrice?: number
  ): Promise<NegotiationResult> {
    const session = await this.getNegotiationSession(sessionId);
    if (!session) throw new Error("议价会话不存在");

    const history = await this.getNegotiationHistory(sessionId);
    const duration = Math.floor(
      (Date.now() - session.startTime.getTime()) / 60000
    );

    // 更新会话状态
    const { error: sessionError } = await supabase
      .from("negotiation_sessions")
      .update({
        status:
          status === NegotiationStatus.SUCCESS
            ? SessionStatus.SUCCESS
            : SessionStatus.FAILED,
        end_time: new Date(),
        total_duration: duration,
        final_discount_rate: finalPrice
          ? ((session.initialQuote - finalPrice) / session.initialQuote) * 100
          : null,
        updated_at: new Date(),
      })
      .eq("session_id", sessionId);

    if (sessionError)
      throw new Error(`更新会话状态失败: ${sessionError.message}`);

    // 更新最后一条历史记录的状态
    if (history.length > 0) {
      const lastHistory = history[history.length - 1];
      const { error: historyError } = await supabase
        .from("negotiation_history")
        .update({
          negotiation_status: status,
          final_price: finalPrice,
          updated_at: new Date(),
        })
        .eq("id", lastHistory.id);

      if (historyError)
        throw new Error(`更新历史记录失败: ${historyError.message}`);
    }

    return {
      sessionId,
      status,
      finalPrice,
      discountRate: finalPrice
        ? ((session.initialQuote - finalPrice) / session.initialQuote) * 100
        : undefined,
      totalRounds: history.length,
      totalTimeMinutes: duration,
      success: status === NegotiationStatus.SUCCESS,
      message: this.getResultMessage(
        status,
        finalPrice
          ? ((session.initialQuote - finalPrice) / session.initialQuote) * 100
          : 0
      ),
    };
  }

  /**
   * 更新会话状态
   */
  private async updateSessionStatus(
    sessionId: string,
    status: SessionStatus
  ): Promise<void> {
    const { error } = await supabase
      .from("negotiation_sessions")
      .update({
        status,
        current_round: supabase.rpc("current_round + 1"),
        updated_at: new Date(),
      })
      .eq("session_id", sessionId);

    if (error) throw new Error(`更新会话状态失败: ${error.message}`);
  }

  /**
   * 获取议价会话
   */
  private async getNegotiationSession(
    sessionId: string
  ): Promise<NegotiationSession | null> {
    const { data, error } = await supabase
      .from("negotiation_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`获取议价会话失败: ${error.message}`);
    }

    return this.mapToSession(data);
  }

  /**
   * 获取议价历史
   */
  private async getNegotiationHistory(
    sessionId: string
  ): Promise<NegotiationHistory[]> {
    const { data, error } = await supabase
      .from("negotiation_history")
      .select("*")
      .eq("session_id", sessionId)
      .order("round_number", { ascending: true });

    if (error) throw new Error(`获取议价历史失败: ${error.message}`);

    return data?.map(this.mapToHistory) || [];
  }

  /**
   * 计算议价统计信息
   */
  private calculateStatistics(
    history: NegotiationHistory[],
    session: NegotiationSession
  ): any {
    const totalRounds = history.length;
    const successfulRounds = history.filter(
      (h) => h.negotiationStatus === NegotiationStatus.SUCCESS
    ).length;
    const avgDiscount =
      history.reduce((sum, h) => sum + (h.discountRate || 0), 0) /
      Math.max(totalRounds, 1);

    return {
      totalRounds,
      successfulRounds,
      successRate: totalRounds > 0 ? (successfulRounds / totalRounds) * 100 : 0,
      averageDiscountRate: avgDiscount,
      totalTimeMinutes: Math.floor(
        (Date.now() - session.startTime.getTime()) / 60000
      ),
      strategiesUsed: [
        ...new Set(history.map((h) => h.strategyUsed).filter(Boolean)),
      ],
    };
  }

  /**
   * 生成结果消息
   */
  private getResultMessage(
    status: NegotiationStatus,
    discountRate: number
  ): string {
    switch (status) {
      case NegotiationStatus.SUCCESS:
        return `议价成功，获得${discountRate.toFixed(2)}%折扣`;
      case NegotiationStatus.FAILED:
        return "议价失败，未能达成协议";
      case NegotiationStatus.CANCELLED:
        return "议价已取消";
      default:
        return "议价进行中";
    }
  }

  /**
   * 映射数据库记录到会话对象
   */
  private mapToSession(data: any): NegotiationSession {
    return {
      id: data.id,
      sessionId: data.session_id,
      procurementRequestId: data.procurement_request_id,
      supplierId: data.supplier_id,
      quotationRequestId: data.quotation_request_id,
      targetPrice: data.target_price,
      initialQuote: data.initial_quote,
      currentRound: data.current_round,
      maxRounds: data.max_rounds,
      status: data.status as SessionStatus,
      startTime: new Date(data.start_time),
      endTime: data.end_time ? new Date(data.end_time) : undefined,
      totalDuration: data.total_duration,
      finalDiscountRate: data.final_discount_rate,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * 映射数据库记录到历史对象
   */
  private mapToHistory(data: any): NegotiationHistory {
    return {
      id: data.id,
      procurementRequestId: data.procurement_request_id,
      supplierId: data.supplier_id,
      quotationRequestId: data.quotation_request_id,
      sessionId: data.session_id,
      roundNumber: data.round_number,
      ourInitialOffer: data.our_initial_offer,
      supplierQuote: data.supplier_quote,
      ourCounterOffer: data.our_counter_offer,
      finalPrice: data.final_price,
      negotiationStatus: data.negotiation_status as NegotiationStatus,
      discountRate: data.discount_rate,
      negotiationDuration: data.negotiation_duration,
      strategyUsed: data.strategy_used,
      confidenceLevel: data.confidence_level,
      remarks: data.remarks,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
