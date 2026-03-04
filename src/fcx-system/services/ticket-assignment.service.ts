/**
 * 工单分配算法服务
 */
import {
  Engineer,
  ExtendedRepairOrder,
  AssignmentResult,
  AssignmentAlgorithmParams,
  AssignmentStrategy,
  EngineerSkill,
  EngineerStatus,
  TicketPriority,
} from '../models/ticket.model';

export class TicketAssignmentService {
  private engineers: Engineer[] = [];
  private tickets: ExtendedRepairOrder[] = [];

  constructor() {}

  /**
   * 加载工程师数?   */
  async loadEngineers(): Promise<void> {
    try {
      // 模拟从数据库加载工程师数?      this.engineers = await this.fetchActiveEngineers();
    } catch (error) {
      console.error('加载工程师数据失?', error);
      throw error;
    }
  }

  /**
   * 加载工单数据
   */
  async loadTickets(): Promise<void> {
    try {
      // 模拟从数据库加载工单数据
      this.tickets = await this.fetchUnassignedTickets();
    } catch (error) {
      console.error('加载工单数据失败:', error);
      throw error;
    }
  }

  /**
   * 智能分配工单到工程师
   */
  async assignTicket(
    ticket: ExtendedRepairOrder,
    params: AssignmentAlgorithmParams
  ): Promise<AssignmentResult> {
    try {
      // 1. 数据预处?      const availableEngineers = this.filterAvailableEngineers(params);

      if (availableEngineers.length === 0) {
        throw new Error('没有可用的工程师');
      }

      // 2. 根据策略选择算法
      let assignments: AssignmentResult[];

      switch (params.strategy) {
        case AssignmentStrategy.SKILL_MATCH:
          assignments = this.skillBasedAssignment(
            ticket,
            availableEngineers,
            params
          );
          break;
        case AssignmentStrategy.LOCATION_BASED:
          assignments = this.locationBasedAssignment(
            ticket,
            availableEngineers,
            params
          );
          break;
        case AssignmentStrategy.LOAD_BALANCED:
          assignments = this.loadBalancedAssignment(
            ticket,
            availableEngineers,
            params
          );
          break;
        case AssignmentStrategy.EXPERIENCE_BASED:
          assignments = this.experienceBasedAssignment(
            ticket,
            availableEngineers,
            params
          );
          break;
        default:
          assignments = this.hybridAssignment(
            ticket,
            availableEngineers,
            params
          );
      }

      // 3. 返回最佳匹配结?      const bestAssignment = assignments[0];

      // 4. 更新工程师负?      await this.updateEngineerLoad(bestAssignment.assignedEngineerId);

      return bestAssignment;
    } catch (error) {
      console.error('工单分配失败:', error);
      throw error;
    }
  }

  /**
   * 批量分配工单
   */
  async batchAssignTickets(
    tickets: ExtendedRepairOrder[],
    params: AssignmentAlgorithmParams
  ): Promise<AssignmentResult[]> {
    const results: AssignmentResult[] = [];

    for (const ticket of tickets) {
      try {
        const result = await this.assignTicket(ticket, params);
        results.push(result);
      } catch (error) {
        console.error('工单分配失败:', error);
      }
    }

    return results;
  }

  /**
   * 基于技能的分配算法
   */
  private skillBasedAssignment(
    ticket: ExtendedRepairOrder,
    engineers: Engineer[],
    params: AssignmentAlgorithmParams
  ): AssignmentResult[] {
    return engineers
      .map(engineer => {
        const skillScore = this.calculateSkillMatchScore(
          ticket.requiredSkills,
          engineer.skills
        );
        const experienceScore = engineer.experienceYears / 20;
        const ratingScore = engineer.rating / 5;

        const totalScore =
          skillScore * params.skillWeight +
          experienceScore * params.experienceWeight +
          ratingScore * params.ratingWeight;

        return {
          ticketId: ticket.id,
          assignedEngineerId: engineer.id,
          confidenceScore: totalScore,
          estimatedTravelTime: this.calculateTravelTime(
            ticket.location,
            engineer.location
          ),
          estimatedWorkTime: this.estimateWorkTime(ticket, engineer),
          totalEstimatedTime: 0,
          reasons: this.generateAssignmentReasons(
            skillScore,
            experienceScore,
            ratingScore
          ),
          alternativeEngineers: [],
        };
      })
      .map(result => ({
        ...result,
        totalEstimatedTime:
          result.estimatedTravelTime + result.estimatedWorkTime,
      }))
      .sort((a, b) => b.confidenceScore - a.confidenceScore);
  }

  /**
   * 基于位置的分配算?   */
  private locationBasedAssignment(
    ticket: ExtendedRepairOrder,
    engineers: Engineer[],
    params: AssignmentAlgorithmParams
  ): AssignmentResult[] {
    return engineers
      .map(engineer => {
        const distance = this.calculateDistance(
          ticket.location,
          engineer.location
        );
        const travelTime = this.calculateTravelTime(
          ticket.location,
          engineer.location
        );
        const locationScore = Math.max(0, 1 - distance / params.maxDistanceKm);

        const skillScore = this.calculateSkillMatchScore(
          ticket.requiredSkills,
          engineer.skills
        );
        const loadScore = 1 - engineer.currentLoad / engineer.maxCapacity;

        const totalScore =
          locationScore * params.locationWeight +
          skillScore * params.skillWeight +
          loadScore * 0.3;

        return {
          ticketId: ticket.id,
          assignedEngineerId: engineer.id,
          confidenceScore: totalScore,
          estimatedTravelTime: travelTime,
          estimatedWorkTime: this.estimateWorkTime(ticket, engineer),
          totalEstimatedTime: 0,
          reasons: [
            `距离最?(${distance.toFixed(1)}km)`,
            `路程时间 ${travelTime}分钟`,
          ],
          alternativeEngineers: [],
        };
      })
      .map(result => ({
        ...result,
        totalEstimatedTime:
          result.estimatedTravelTime + result.estimatedWorkTime,
      }))
      .sort((a, b) => {
        if (b.confidenceScore !== a.confidenceScore) {
          return b.confidenceScore - a.confidenceScore;
        }
        return a.totalEstimatedTime - b.totalEstimatedTime;
      });
  }

  /**
   * 负载均衡分配算法
   */
  private loadBalancedAssignment(
    ticket: ExtendedRepairOrder,
    engineers: Engineer[],
    params: AssignmentAlgorithmParams
  ): AssignmentResult[] {
    return engineers
      .map(engineer => {
        const loadFactor = engineer.currentLoad / engineer.maxCapacity;
        const loadScore = Math.max(0, 1 - loadFactor);

        const skillScore = this.calculateSkillMatchScore(
          ticket.requiredSkills,
          engineer.skills
        );
        const experienceScore = engineer.experienceYears / 20;
        const ratingScore = engineer.rating / 5;

        const totalScore =
          loadScore * params.skillWeight +
          skillScore * 0.3 +
          experienceScore * 0.2 +
          ratingScore * 0.2;

        return {
          ticketId: ticket.id,
          assignedEngineerId: engineer.id,
          confidenceScore: totalScore,
          estimatedTravelTime: this.calculateTravelTime(
            ticket.location,
            engineer.location
          ),
          estimatedWorkTime: this.estimateWorkTime(ticket, engineer),
          totalEstimatedTime: 0,
          reasons: [
            `当前负载 ${engineer.currentLoad}/${engineer.maxCapacity}`,
            `负载因子 ${(loadFactor * 100).toFixed(1)}%`,
          ],
          alternativeEngineers: [],
        };
      })
      .map(result => ({
        ...result,
        totalEstimatedTime:
          result.estimatedTravelTime + result.estimatedWorkTime,
      }))
      .sort((a, b) => b.confidenceScore - a.confidenceScore);
  }

  /**
   * 基于经验的分配算?   */
  private experienceBasedAssignment(
    ticket: ExtendedRepairOrder,
    engineers: Engineer[],
    params: AssignmentAlgorithmParams
  ): AssignmentResult[] {
    return engineers
      .map(engineer => {
        const experienceScore = engineer.experienceYears / 20;
        const ratingScore = engineer.rating / 5;
        const successRateScore = engineer.successRate / 100;
        const completedTicketsScore = Math.min(
          1,
          engineer.completedTickets / 1000
        );

        const totalScore =
          experienceScore * params.experienceWeight +
          ratingScore * params.ratingWeight +
          successRateScore * 0.2 +
          completedTicketsScore * 0.1;

        return {
          ticketId: ticket.id,
          assignedEngineerId: engineer.id,
          confidenceScore: totalScore,
          estimatedTravelTime: this.calculateTravelTime(
            ticket.location,
            engineer.location
          ),
          estimatedWorkTime: this.estimateWorkTime(ticket, engineer),
          totalEstimatedTime: 0,
          reasons: [
            `${engineer.experienceYears}年经验`,
            `成功?${engineer.successRate.toFixed(1)}%`,
            `完成${engineer.completedTickets}个工单`,
          ],
          alternativeEngineers: [],
        };
      })
      .map(result => ({
        ...result,
        totalEstimatedTime:
          result.estimatedTravelTime + result.estimatedWorkTime,
      }))
      .sort((a, b) => b.confidenceScore - a.confidenceScore);
  }

  /**
   * 混合分配算法
   */
  private hybridAssignment(
    ticket: ExtendedRepairOrder,
    engineers: Engineer[],
    params: AssignmentAlgorithmParams
  ): AssignmentResult[] {
    return engineers
      .map(engineer => {
        const skillScore = this.calculateSkillMatchScore(
          ticket.requiredSkills,
          engineer.skills
        );
        const locationScore = Math.max(
          0,
          1 -
            this.calculateDistance(ticket.location, engineer.location) /
              params.maxDistanceKm
        );
        const loadScore = 1 - engineer.currentLoad / engineer.maxCapacity;
        const experienceScore = engineer.experienceYears / 20;
        const ratingScore = engineer.rating / 5;

        const totalScore =
          skillScore * params.skillWeight +
          locationScore * params.locationWeight +
          loadScore * 0.2 +
          experienceScore * params.experienceWeight +
          ratingScore * params.ratingWeight;

        return {
          ticketId: ticket.id,
          assignedEngineerId: engineer.id,
          confidenceScore: totalScore,
          estimatedTravelTime: this.calculateTravelTime(
            ticket.location,
            engineer.location
          ),
          estimatedWorkTime: this.estimateWorkTime(ticket, engineer),
          totalEstimatedTime: 0,
          reasons: this.generateHybridReasons(
            skillScore,
            locationScore,
            loadScore,
            experienceScore,
            ratingScore
          ),
          alternativeEngineers: [],
        };
      })
      .map(result => ({
        ...result,
        totalEstimatedTime:
          result.estimatedTravelTime + result.estimatedWorkTime,
      }))
      .sort((a, b) => b.confidenceScore - a.confidenceScore);
  }

  /**
   * 筛选可用工程师
   */
  private filterAvailableEngineers(
    params: AssignmentAlgorithmParams
  ): Engineer[] {
    return this.engineers.filter(engineer => {
      if (
        params.excludeOffline &&
        engineer.availability.status !== EngineerStatus.AVAILABLE
      ) {
        return false;
      }

      if (
        params.excludeOverloaded &&
        engineer.currentLoad >= engineer.maxCapacity * params.maxLoadFactor
      ) {
        return false;
      }

      const hasRequiredSkills = this.hasRequiredSkills(engineer.skills, []);
      if (!hasRequiredSkills) {
        return false;
      }

      return true;
    });
  }

  /**
   * 计算技能匹配分?   */
  private calculateSkillMatchScore(
    requiredSkills: EngineerSkill[],
    engineerSkills: EngineerSkill[]
  ): number {
    if (requiredSkills.length === 0) return 1;

    const matchedSkills = requiredSkills.filter(skill =>
      engineerSkills.includes(skill)
    );
    return matchedSkills.length / requiredSkills.length;
  }

  /**
   * 检查是否具备所需技?   */
  private hasRequiredSkills(
    engineerSkills: EngineerSkill[],
    requiredSkills: EngineerSkill[]
  ): boolean {
    if (requiredSkills.length === 0) return true;
    return requiredSkills.every(skill => engineerSkills.includes(skill));
  }

  /**
   * 计算两点间距?公里)
   */
  private calculateDistance(location1: any, location2: any): number {
    const R = 6371;
    const dLat = this.deg2rad(location2.latitude - location1.latitude);
    const dLon = this.deg2rad(location2.longitude - location1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(location1.latitude)) *
        Math.cos(this.deg2rad(location2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * 计算路程时间(分钟)
   */
  private calculateTravelTime(location1: any, location2: any): number {
    const distance = this.calculateDistance(location1, location2);
    return Math.round((distance / 30) * 60);
  }

  /**
   * 估算工作时间(分钟)
   */
  private estimateWorkTime(
    ticket: ExtendedRepairOrder,
    engineer: Engineer
  ): number {
    let baseTime = 60;
    baseTime *= (ticket.complexity || 5) / 5;
    const experienceFactor = Math.max(0.7, 1 - engineer.experienceYears / 30);
    baseTime *= experienceFactor;
    return Math.round(baseTime);
  }

  /**
   * 角度转弧?   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * 生成分配理由
   */
  private generateAssignmentReasons(
    skillScore: number,
    experienceScore: number,
    ratingScore: number
  ): string[] {
    const reasons: string[] = [];

    if (skillScore > 0.8) reasons.push('技能高度匹?);
    else if (skillScore > 0.5) reasons.push('技能基本匹?);
    else reasons.push('技能部分匹?);

    if (experienceScore > 0.8) reasons.push('经验丰富');
    if (ratingScore > 0.8) reasons.push('高评分工程师');

    return reasons;
  }

  /**
   * 生成混合分配理由
   */
  private generateHybridReasons(
    skillScore: number,
    locationScore: number,
    loadScore: number,
    experienceScore: number,
    ratingScore: number
  ): string[] {
    const reasons: string[] = [];

    reasons.push(
      `综合匹配? ${(
        skillScore * 0.4 +
        locationScore * 0.3 +
        loadScore * 0.1 +
        experienceScore * 0.1 +
        ratingScore * 0.1
      ).toFixed(2)}`
    );

    return reasons;
  }

  /**
   * 更新工程师负?   */
  private async updateEngineerLoad(engineerId: string): Promise<void> {
    const engineer = this.engineers.find(e => e.id === engineerId);
    if (engineer) {
      engineer.currentLoad += 1;
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`更新工程?${engineer.name} 负载?${engineer.currentLoad}`)}
  }

  /**
   * 获取活跃工程?模拟)
   */
  private async fetchActiveEngineers(): Promise<Engineer[]> {
    return [
      {
        id: 'eng-001',
        userId: 'user-001',
        name: '张师?,
        phone: '13800138001',
        email: 'zhang@example.com',
        skills: [EngineerSkill.MOBILE_REPAIR, EngineerSkill.SCREEN_REPLACEMENT],
        specialization: ['手机维修', '屏幕更换'],
        experienceYears: 8,
        rating: 4.8,
        completedTickets: 342,
        successRate: 96.5,
        currentLoad: 2,
        maxCapacity: 5,
        location: {
          latitude: 39.9042,
          longitude: 116.4074,
          address: '北京市朝阳区',
          city: '北京',
          region: '华北',
        },
        availability: {
          status: EngineerStatus.AVAILABLE,
          lastOnline: new Date(),
          workingHours: '09:00-18:00',
          holidays: [],
        },
        certifications: ['手机维修技?, '苹果认证工程?],
        hourlyRate: 150,
        slaLevels: ['standard' as any, 'priority' as any],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  /**
   * 获取未分配工?模拟)
   */
  private async fetchUnassignedTickets(): Promise<ExtendedRepairOrder[]> {
    return [];
  }
}
