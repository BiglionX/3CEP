// 说明书上传服?
import { supabase } from '@/lib/supabase';
// HTML清理函数将在下方实现

export interface ManualUploadDTO {
  productId: string;
  title: Record<string, string>; // { zh: "标题", en: "Title" }
  content: Record<string, string>; // { zh: "<html>内容</html>", en: "<html>Content</html>" }
  languageCodes: string[];
  versionNotes?: string;
  createdBy: string;
}

export interface Manual {
  id: string;
  productId: string;
  title: Record<string, string>;
  content: Record<string, string>;
  languageCodes: string[];
  version: number;
  status: 'draft' | 'pending_review' | 'published' | 'rejected';
  createdBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export class ManualUploadService {
  private supabase = supabase;

  /**
   * 上传新的说明?   */
  async uploadManual(dto: ManualUploadDTO): Promise<Manual> {
    // 验证输入数据
    this.validateUploadDTO(dto);

    // 验证HTML内容安全?    for (const [lang, htmlContent] of Object.entries(dto.content)) {
      if (!(await this.validateHtmlContent(htmlContent))) {
        throw new Error(`语言 ${lang} 的HTML内容包含不安全元素`);
      }
    }

    // 优化HTML内容
    const optimizedContent: Record<string, string> = {};
    for (const [lang, htmlContent] of Object.entries(dto.content)) {
      optimizedContent[lang] = await this.optimizeHtml(htmlContent);
    }

    // 插入说明书记?    const { data, error } = await this.supabase
      .from('product_manuals')
      .insert([
        {
          product_id: dto.productId,
          title: dto.title,
          content: optimizedContent,
          language_codes: dto.languageCodes,
          version: 1,
          status: 'draft',
          created_by: dto.createdBy,
          view_count: 0,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`上传说明书失? ${error.message}`);

    return data as Manual;
  }

  /**
   * 更新现有说明?   */
  async updateManual(
    manualId: string,
    dto: Partial<ManualUploadDTO>
  ): Promise<Manual> {
    // 获取现有说明?    const existingManual = await this.getManualById(manualId);
    if (!existingManual) {
      throw new Error('说明书不存在');
    }

    // 准备更新数据
    const updateData: any = {};

    if (dto.title) {
      updateData.title = dto.title;
    }

    if (dto.content) {
      // 验证并优化HTML内容
      const optimizedContent: Record<string, string> = {};
      for (const [lang, htmlContent] of Object.entries(dto.content)) {
        if (!(await this.validateHtmlContent(htmlContent))) {
          throw new Error(`语言 ${lang} 的HTML内容包含不安全元素`);
        }
        optimizedContent[lang] = await this.optimizeHtml(htmlContent);
      }
      updateData.content = optimizedContent;
    }

    if (dto.languageCodes) {
      updateData.language_codes = dto.languageCodes;
    }

    // 如果内容有实质性变更，创建新版?    if (dto.content || dto.title) {
      await this.createVersion(manualId, existingManual);
      updateData.version = existingManual.version + 1;
      updateData.status = 'draft'; // 更新后重置为草稿状?    }

    // 更新说明?    const { data, error } = await this.supabase
      .from('product_manuals')
      .update(updateData)
      .eq('id', manualId)
      .select()
      .single();

    if (error) throw new Error(`更新说明书失? ${error.message}`);

    return data as Manual;
  }

  /**
   * 获取说明书详?   */
  async getManualById(id: string): Promise<Manual | null> {
    const { data, error } = await this.supabase
      .from('product_manuals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // 记录不存?      throw new Error(`获取说明书失? ${error.message}`);
    }

    return data as Manual;
  }

  /**
   * 获取产品的说明书列表
   */
  async getProductManuals(
    productId: string,
    status?: string[]
  ): Promise<Manual[]> {
    let query = this.supabase
      .from('product_manuals')
      .select('*')
      .eq('product_id', productId)
      .order('version', { ascending: false });

    if (status && status.length > 0) {
      query = query.in('status', status);
    }

    const { data, error } = await query;

    if (error) throw new Error(`获取产品说明书列表失? ${error.message}`);

    return data as Manual[];
  }

  /**
   * 获取用户创建的说明书
   */
  async getUserManuals(userId: string, status?: string[]): Promise<Manual[]> {
    let query = this.supabase
      .from('product_manuals')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (status && status.length > 0) {
      query = query.in('status', status);
    }

    const { data, error } = await query;

    if (error) throw new Error(`获取用户说明书列表失? ${error.message}`);

    return data as Manual[];
  }

  /**
   * 提交审核
   */
  async submitForReview(manualId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('product_manuals')
      .update({ status: 'pending_review' } as any)
      .eq('id', manualId);

    if (error) {
      console.error('提交审核失败:', error);
      return false;
    }

    return true;
  }

  /**
   * 审核说明?   */
  async reviewManual(
    manualId: string,
    action: 'approve' | 'reject',
    reviewerId: string,
    comments?: string,
    rejectionReason?: string
  ): Promise<boolean> {
    const status = action === 'approve' ? 'published' : 'rejected';

    const { error } = await this.supabase
      .from('product_manuals')
      .update({
        status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: action === 'reject' ? rejectionReason : null,
      } as any)
      .eq('id', manualId);

    if (error) {
      console.error('审核操作失败:', error);
      return false;
    }

    // 记录审核历史
    await this.recordReview(
      manualId,
      action,
      reviewerId,
      comments,
      rejectionReason
    );

    return true;
  }

  /**
   * 增加查看次数
   */
  async incrementViewCount(manualId: string): Promise<void> {
    // 先获取当前查看次?    const { data: manual } = await this.supabase
      .from('product_manuals')
      .select('view_count')
      .eq('id', manualId)
      .single();

    if (manual) {
      await this.supabase
        .from('product_manuals')
        .update({ view_count: manual.view_count + 1 } as any)
        .eq('id', manualId);
    }
  }

  /**
   * 验证上传数据
   */
  private validateUploadDTO(dto: ManualUploadDTO): void {
    if (!dto.productId) {
      throw new Error('产品ID不能为空');
    }

    if (!dto.title || Object.keys(dto.title).length === 0) {
      throw new Error('说明书标题不能为?);
    }

    if (!dto.content || Object.keys(dto.content).length === 0) {
      throw new Error('说明书内容不能为?);
    }

    if (!dto.languageCodes || dto.languageCodes.length === 0) {
      throw new Error('语言代码不能为空');
    }

    if (!dto.createdBy) {
      throw new Error('创建者ID不能为空');
    }

    // 验证语言代码一致?    const titleLanguages = Object.keys(dto.title);
    const contentLanguages = Object.keys(dto.content);

    if (titleLanguages.length !== contentLanguages.length) {
      throw new Error('标题和内容的语言数量不一?);
    }

    for (const lang of titleLanguages) {
      if (!contentLanguages.includes(lang)) {
        throw new Error(`语言 ${lang} 在内容中缺失`);
      }
      if (!dto.languageCodes.includes(lang)) {
        throw new Error(`语言 ${lang} 不在指定的语言代码列表中`);
      }
    }
  }

  /**
   * 验证HTML内容安全?   */
  async validateHtmlContent(html: string): Promise<boolean> {
    // 检查是否包含危险标?    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form'];
    const dangerousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /on\w+\s*=/gi, // onclick, onload等事件处理器
      /javascript:/gi,
      /data:/gi,
    ];

    // 检查危险标?    for (const tag of dangerousTags) {
      if (html.toLowerCase().includes(`<${tag}`)) {
        return false;
      }
    }

    // 检查危险模?    for (const pattern of dangerousPatterns) {
      if (pattern.test(html)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 简单的HTML清理函数
   */
  private sanitizeHtml(html: string): string {
    // 移除script标签
    let cleaned = html.replace(/<script[^>]*>.*?<\/script>/gi, '');
    // 移除iframe标签
    cleaned = cleaned.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
    // 移除object和embed标签
    cleaned = cleaned.replace(/<(object|embed)[^>]*>.*?<\/\1>/gi, '');
    // 移除事件处理?    cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    // 移除javascript:链接
    cleaned = cleaned.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
    return cleaned;
  }

  /**
   * 优化HTML内容
   */
  async optimizeHtml(html: string): Promise<string> {
    // 使用sanitizeHtml函数清理HTML
    let cleanedHtml = this.sanitizeHtml(html);

    // 进一步优化：移除多余的空白字?    cleanedHtml = cleanedHtml.replace(/\s+/g, ' ').trim();

    // 优化图片标签
    cleanedHtml = cleanedHtml.replace(
      /<img([^>]*)>/gi,
      '<img$1 loading="lazy" decoding="async">'
    );

    return cleanedHtml;
  }

  /**
   * 创建版本记录
   */
  private async createVersion(manualId: string, manual: Manual): Promise<void> {
    const { error } = await this.supabase.from('manual_versions').insert([
      {
        manual_id: manualId,
        version: manual.version,
        title: manual.title,
        content: manual.content,
        changes: `版本 ${manual.version} 快照`,
      },
    ]);

    if (error) {
      console.error('创建版本记录失败:', error);
    }
  }

  /**
   * 记录审核历史
   */
  private async recordReview(
    manualId: string,
    action: string,
    reviewerId: string,
    comments?: string,
    rejectionReason?: string
  ): Promise<void> {
    const { error } = await this.supabase.from('manual_reviews').insert([
      {
        manual_id: manualId,
        reviewer_id: reviewerId,
        action,
        comments: comments || null,
        rejection_reason: rejectionReason || null,
      },
    ]);

    if (error) {
      console.error('记录审核历史失败:', error);
    }
  }
}
