/**
 * 数据审核服务
 *
 * 负责处理外部数据的批量审核、状态更新和日志记录
 */

import { createClient } from '@supabase/supabase-js';

// 审核操作类型
export type AuditAction = 'approve' | 'reject' | 'modify' | 'skip';

// 批量审核参数
export interface BatchAuditParams {
  stagingIds: string[];
  action: AuditAction;
  reviewerId: string;
  notes?: string;
  reason?: string; // 拒绝原因
}

// 审核结果
export interface AuditResult {
  success: boolean;
  processed: number;
  failed: number;
  error?: string;
}

// 单个审核记录
export interface AuditRecord {
  id: string;
  part_number: string;
  part_name: string;
  sync_mode: string;
  old_data?: any;
  new_data?: any;
}

/**
 * 数据审核服务类
 */
export class DataAuditService {
  private supabase: ReturnType<typeof createClient>;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * 批量审核数据
   */
  async batchAudit(params: BatchAuditParams): Promise<AuditResult> {
    const { stagingIds, action, reviewerId, notes, reason } = params;

    let processed = 0;
    let failed = 0;

    try {
      // 1. 获取待审核的记录
      const records = await this.getStagingRecords(stagingIds);

      if (records.length === 0) {
        return {
          success: true,
          processed: 0,
          failed: 0,
        };
      }

      // 2. 根据操作类型处理
      if (action === 'approve') {
        const result = await this.processApproval(records, reviewerId, notes);
        processed = result.processed;
        failed = result.failed;
      } else if (action === 'reject') {
        const result = await this.processRejection(records, reviewerId, reason);
        processed = result.processed;
        failed = result.failed;
      } else if (action === 'modify') {
        // TODO: 修改后重新提交审核
        throw new Error('修改功能暂未实现');
      } else if (action === 'skip') {
        const result = await this.processSkip(records, reviewerId, notes);
        processed = result.processed;
        failed = result.failed;
      }

      // 3. 记录审核日志
      await this.logAuditAction(records, action, reviewerId, notes, reason);

      return {
        success: true,
        processed,
        failed,
      };
    } catch (error: any) {
      console.error('批量审核失败:', error);
      return {
        success: false,
        processed: 0,
        failed: stagingIds.length,
        error: error.message,
      };
    }
  }

  /**
   * 获取临时表记录
   */
  private async getStagingRecords(ids: string[]): Promise<AuditRecord[]> {
    const { data, error } = await this.supabase
      .from('parts_staging')
      .select('*')
      .in('id', ids);

    if (error) {
      throw new Error(`获取记录失败：${error.message}`);
    }

    return data || [];
  }

  /**
   * 处理审批通过
   */
  private async processApproval(
    records: AuditRecord[],
    reviewerId: string,
    notes?: string
  ): Promise<{ processed: number; failed: number }> {
    let processed = 0;
    let failed = 0;

    for (const record of records) {
      try {
        // 开启事务处理
        await this.processSingleApproval(record, reviewerId, notes);
        processed++;
      } catch (error: any) {
        console.error(`审批记录 ${record.id} 失败:`, error);
        failed++;
      }
    }

    return { processed, failed };
  }

  /**
   * 处理单条记录的审批
   */
  private async processSingleApproval(
    record: AuditRecord,
    reviewerId: string,
    notes?: string
  ): Promise<void> {
    // 使用 Supabase 的 RPC 调用存储过程（或手动实现事务）
    const { error } = await this.supabase.rpc('approve_staging_record', {
      p_staging_id: record.id,
      p_reviewer_id: reviewerId,
      p_notes: notes,
    });

    if (error) {
      throw new Error(`审批失败：${error.message}`);
    }
  }

  /**
   * 处理拒绝
   */
  private async processRejection(
    records: AuditRecord[],
    reviewerId: string,
    reason?: string
  ): Promise<{ processed: number; failed: number }> {
    let processed = 0;
    let failed = 0;

    for (const record of records) {
      try {
        // 更新临时表状态为拒绝
        const { error } = await this.supabase
          .from('parts_staging')
          .update({
            sync_status: 'rejected',
            reviewed_by: reviewerId,
            reviewed_at: new Date().toISOString(),
            rejection_reason: reason,
          })
          .eq('id', record.id);

        if (error) {
          throw new Error(`拒绝失败：${error.message}`);
        }

        processed++;
      } catch (error: any) {
        console.error(`拒绝记录 ${record.id} 失败:`, error);
        failed++;
      }
    }

    return { processed, failed };
  }

  /**
   * 处理跳过
   */
  private async processSkip(
    records: AuditRecord[],
    reviewerId: string,
    notes?: string
  ): Promise<{ processed: number; failed: number }> {
    let processed = 0;
    let failed = 0;

    for (const record of records) {
      try {
        // 更新状态为跳过
        const { error } = await this.supabase
          .from('parts_staging')
          .update({
            sync_status: 'skipped',
            reviewed_by: reviewerId,
            reviewed_at: new Date().toISOString(),
            review_notes: notes,
          })
          .eq('id', record.id);

        if (error) {
          throw new Error(`跳过失败：${error.message}`);
        }

        processed++;
      } catch (error: any) {
        console.error(`跳过记录 ${record.id} 失败:`, error);
        failed++;
      }
    }

    return { processed, failed };
  }

  /**
   * 记录审核操作日志
   */
  private async logAuditAction(
    records: AuditRecord[],
    action: AuditAction,
    actorId: string,
    notes?: string,
    reason?: string
  ): Promise<void> {
    const logs = records.map(record => ({
      staging_id: record.id,
      action,
      actor_id: actorId,
      old_data: record.old_data ? JSON.stringify(record.old_data) : null,
      new_data: record.new_data ? JSON.stringify(record.new_data) : null,
      notes: notes || null,
      reason: reason || null,
    }));

    const { error } = await this.supabase.from('data_audit_logs').insert(logs);

    if (error) {
      console.error('记录审核日志失败:', error);
    }
  }

  /**
   * 获取待审核数据列表
   */
  async getPendingData(params: {
    sourceId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    data: any[];
    total: number;
  }> {
    const { sourceId, limit = 50, offset = 0 } = params;

    let query = this.supabase
      .from('v_pending_data_audit')
      .select('*', { count: 'exact' })
      .order('synced_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (sourceId) {
      query = query.eq('source_id', sourceId);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`获取待审核数据失败：${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0,
    };
  }

  /**
   * 获取审核历史
   */
  async getAuditHistory(params: {
    stagingId?: string;
    actorId?: string;
    action?: AuditAction;
    limit?: number;
  }): Promise<any[]> {
    const { stagingId, actorId, action, limit = 50 } = params;

    let query = this.supabase
      .from('data_audit_logs')
      .select(
        `
        *,
        parts_staging (
          part_number,
          part_name
        )
      `
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (stagingId) {
      query = query.eq('staging_id', stagingId);
    }

    if (actorId) {
      query = query.eq('actor_id', actorId);
    }

    if (action) {
      query = query.eq('action', action);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`获取审核历史失败：${error.message}`);
    }

    return data || [];
  }

  /**
   * 获取审核统计信息
   */
  async getAuditStatistics(sourceId?: string): Promise<any> {
    let query = this.supabase.from('parts_staging').select(`
      sync_status,
      count: id
    `);

    if (sourceId) {
      query = query.eq('source_id', sourceId);
    }

    const { data, error } = await query.group('sync_status');

    if (error) {
      throw new Error(`获取审核统计失败：${error.message}`);
    }

    // 转换为更易读的格式
    const stats: Record<string, number> = {};
    data.forEach((item: any) => {
      stats[item.sync_status] = item.count;
    });

    return {
      pending: stats.pending || 0,
      approved: stats.approved || 0,
      rejected: stats.rejected || 0,
      skipped: stats.skipped || 0,
      total: Object.values(stats).reduce((sum, val) => sum + val, 0),
    };
  }
}

/**
 * 审批存储过程的替代实现（如果数据库中没有存储过程）
 */
async function approveStagingRecordManual(
  supabase: ReturnType<typeof createClient>,
  stagingId: string,
  reviewerId: string,
  notes?: string
): Promise<void> {
  // 1. 获取临时表记录
  const { data: stagingRecord, error: fetchError } = await supabase
    .from('parts_staging')
    .select('*')
    .eq('id', stagingId)
    .single();

  if (fetchError || !stagingRecord) {
    throw new Error('记录不存在');
  }

  // 2. 根据 sync_mode 执行相应操作
  if (stagingRecord.sync_mode === 'insert') {
    // 插入到正式表
    const { error: insertError } = await supabase.from('parts').insert({
      part_number: stagingRecord.part_number,
      part_name: stagingRecord.part_name,
      category: stagingRecord.category,
      brand: stagingRecord.brand,
      model: stagingRecord.model,
      specifications: stagingRecord.specifications,
      price: stagingRecord.price,
      currency: stagingRecord.currency,
      stock_quantity: stagingRecord.stock_quantity,
      min_order_qty: stagingRecord.min_order_qty,
      supplier_info: stagingRecord.supplier_info,
      images: stagingRecord.images,
      documents: stagingRecord.documents,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      throw new Error(`插入正式表失败：${insertError.message}`);
    }
  } else if (stagingRecord.sync_mode === 'update') {
    // 更新正式表
    const { error: updateError } = await supabase
      .from('parts')
      .update({
        part_name: stagingRecord.part_name,
        category: stagingRecord.category,
        brand: stagingRecord.brand,
        model: stagingRecord.model,
        specifications: stagingRecord.specifications,
        price: stagingRecord.price,
        currency: stagingRecord.currency,
        stock_quantity: stagingRecord.stock_quantity,
        min_order_qty: stagingRecord.min_order_qty,
        supplier_info: stagingRecord.supplier_info,
        images: stagingRecord.images,
        documents: stagingRecord.documents,
        updated_at: new Date().toISOString(),
      })
      .eq('part_number', stagingRecord.part_number);

    if (updateError) {
      throw new Error(`更新正式表失败：${updateError.message}`);
    }
  } else if (stagingRecord.sync_mode === 'delete') {
    // 从正式表删除
    const { error: deleteError } = await supabase
      .from('parts')
      .delete()
      .eq('part_number', stagingRecord.part_number);

    if (deleteError) {
      throw new Error(`删除正式表记录失败：${deleteError.message}`);
    }
  }

  // 3. 更新临时表状态
  const { error: updateStatusError } = await supabase
    .from('parts_staging')
    .update({
      sync_status: 'approved',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_notes: notes,
    })
    .eq('id', stagingId);

  if (updateStatusError) {
    throw new Error(`更新临时表状态失败：${updateStatusError.message}`);
  }
}
