// 增强版说明书管理服务
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// 说明书数据传输对象
export interface ManualDTO {
  productId: string;
  title: Record<string, string>; // { zh: "标题", en: "Title" }
  content: Record<string, string>; // { zh: "<html>内容</html>", en: "<html>Content</html>" }
  languageCodes: string[];
  coverImageUrl?: string;
  videoUrl?: string;
  versionNotes?: string;
  createdBy: string;
}

// 章节数据传输对象
export interface SectionDTO {
  manualId: string;
  sectionOrder: number;
  sectionTitle: Record<string, string>;
  sectionContent: Record<string, string>;
  mediaUrls?: {
    images?: string[];
    videos?: string[];
  };
}

// 说明书实体接口
export interface Manual {
  id: string;
  productId: string;
  title: Record<string, string>;
  content: Record<string, string>;
  languageCodes: string[];
  version: number;
  status: 'draft' | 'pending_review' | 'published' | 'rejected';
  coverImageUrl?: string;
  videoUrl?: string;
  createdBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  sections?: ManualSection[];
  comments?: ManualComment[];
}

// 章节实体接口
export interface ManualSection {
  id: string;
  manualId: string;
  sectionOrder: number;
  sectionTitle: Record<string, string>;
  sectionContent: Record<string, string>;
  mediaUrls?: {
    images?: string[];
    videos?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// 评论实体接口
export interface ManualComment {
  id: string;
  manualId: string;
  userId: string;
  content: string;
  rating?: number;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  userEmail?: string;
}

export class EnhancedManualsService {
  private static instance: EnhancedManualsService;
  
  private constructor() {}

  public static getInstance(): EnhancedManualsService {
    if (!EnhancedManualsService.instance) {
      EnhancedManualsService.instance = new EnhancedManualsService();
    }
    return EnhancedManualsService.instance;
  }

  /**
   * 创建新的说明书
   */
  async createManual(dto: ManualDTO): Promise<Manual> {
    try {
      // 验证输入数据
      this.validateManualDTO(dto);

      // 清理和验证HTML内容
      const cleanedContent = await this.cleanAndValidateContent(dto.content);

      // 插入说明书记录
      const { data: manual, error } = await supabase
        .from('product_manuals')
        .insert({
          product_id: dto.productId,
          title: dto.title,
          content: cleanedContent,
          language_codes: dto.languageCodes,
          cover_image_url: dto.coverImageUrl,
          video_url: dto.videoUrl,
          version: 1,
          status: 'draft',
          created_by: dto.createdBy,
          view_count: 0,
          download_count: 0
        } as any)
        .select()
        .single();

      if (error) {
        throw new Error(`创建说明书失败: ${error.message}`);
      }

      return manual as Manual;
    } catch (error) {
      console.error('创建说明书错误:', error);
      throw error;
    }
  }

  /**
   * 更新说明书
   */
  async updateManual(manualId: string, dto: Partial<ManualDTO>): Promise<Manual> {
    try {
      // 获取现有说明书
      const existingManual = await this.getManualById(manualId);
      if (!existingManual) {
        throw new Error('说明书不存在');
      }

      // 准备更新数据
      const updateData: any = {};

      if (dto.title) {
        updateData.title = dto.title;
      }

      if (dto.content) {
        const cleanedContent = await this.cleanAndValidateContent(dto.content);
        updateData.content = cleanedContent;
      }

      if (dto.languageCodes) {
        updateData.language_codes = dto.languageCodes;
      }

      if (dto.coverImageUrl !== undefined) {
        updateData.cover_image_url = dto.coverImageUrl;
      }

      if (dto.videoUrl !== undefined) {
        updateData.video_url = dto.videoUrl;
      }

      // 如果内容有实质性变更，创建新版本
      if (dto.content || dto.title) {
        await this.createVersionSnapshot(manualId, existingManual);
        updateData.version = existingManual.version + 1;
        updateData.status = 'draft'; // 更新后重置为草稿状态
      }

      // 更新说明书
      const { data: manual, error } = await supabase
        .from('product_manuals')
        .update(updateData)
        .eq('id', manualId)
        .select()
        .single();

      if (error) {
        throw new Error(`更新说明书失败: ${error.message}`);
      }

      return manual as Manual;
    } catch (error) {
      console.error('更新说明书错误:', error);
      throw error;
    }
  }

  /**
   * 获取说明书详情
   */
  async getManualById(id: string): Promise<Manual | null> {
    try {
      const { data: manual, error } = await supabase
        .from('product_manuals')
        .select(`
          *,
          sections:manual_sections(*),
          comments:manual_comments(*, user:auth_users(email))
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`获取说明书失败: ${error.message}`);
      }

      return manual as Manual;
    } catch (error) {
      console.error('获取说明书错误:', error);
      throw error;
    }
  }

  /**
   * 获取产品说明书列表
   */
  async getProductManuals(productId: string, status?: string[]): Promise<Manual[]> {
    try {
      let query = supabase
        .from('product_manuals')
        .select(`
          *,
          sections:manual_sections(*),
          comments:manual_comments(*)
        `)
        .eq('product_id', productId)
        .order('version', { ascending: false });

      if (status && status.length > 0) {
        query = query.in('status', status);
      }

      const { data: manuals, error } = await query;

      if (error) {
        throw new Error(`获取产品说明书列表失败: ${error.message}`);
      }

      return manuals as Manual[];
    } catch (error) {
      console.error('获取产品说明书列表错误:', error);
      throw error;
    }
  }

  /**
   * 获取用户创建的说明书
   */
  async getUserManuals(userId: string, status?: string[]): Promise<Manual[]> {
    try {
      let query = supabase
        .from('product_manuals')
        .select(`
          *,
          sections:manual_sections(*),
          comments:manual_comments(*)
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (status && status.length > 0) {
        query = query.in('status', status);
      }

      const { data: manuals, error } = await query;

      if (error) {
        throw new Error(`获取用户说明书列表失败: ${error.message}`);
      }

      return manuals as Manual[];
    } catch (error) {
      console.error('获取用户说明书列表错误:', error);
      throw error;
    }
  }

  /**
   * 提交审核
   */
  async submitForReview(manualId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('product_manuals')
        .update({ status: 'pending_review' } as any)
        .eq('id', manualId);

      if (error) {
        console.error('提交审核失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('提交审核错误:', error);
      return false;
    }
  }

  /**
   * 审核说明书
   */
  async reviewManual(
    manualId: string, 
    action: 'approve' | 'reject', 
    reviewerId: string, 
    comments?: string, 
    rejectionReason?: string
  ): Promise<boolean> {
    try {
      const status = action === 'approve' ? 'published' : 'rejected';
      
      const { error } = await supabase
        .from('product_manuals')
        .update({
          status,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          rejection_reason: action === 'reject' ? rejectionReason : null
        } as any)
        .eq('id', manualId);

      if (error) {
        console.error('审核操作失败:', error);
        return false;
      }

      // 记录审核历史
      await this.recordReview(manualId, action, reviewerId, comments, rejectionReason);
      
      return true;
    } catch (error) {
      console.error('审核操作错误:', error);
      return false;
    }
  }

  /**
   * 增加查看次数
   */
  async incrementViewCount(manualId: string): Promise<void> {
    try {
      await supabase.rpc('increment_manual_view_count', {
        manual_id: manualId
      });
    } catch (error) {
      console.error('增加查看次数错误:', error);
    }
  }

  /**
   * 增加下载次数
   */
  async incrementDownloadCount(manualId: string): Promise<void> {
    try {
      await supabase.rpc('increment_manual_download_count', {
        manual_id: manualId
      });
    } catch (error) {
      console.error('增加下载次数错误:', error);
    }
  }

  /**
   * 添加评论
   */
  async addComment(manualId: string, userId: string, content: string, rating?: number): Promise<ManualComment> {
    try {
      const { data: comment, error } = await supabase
        .from('manual_comments')
        .insert({
          manual_id: manualId,
          user_id: userId,
          content,
          rating,
          is_resolved: false
        } as any)
        .select()
        .single();

      if (error) {
        throw new Error(`添加评论失败: ${error.message}`);
      }

      return comment as ManualComment;
    } catch (error) {
      console.error('添加评论错误:', error);
      throw error;
    }
  }

  /**
   * 获取说明书统计信息
   */
  async getManualStatistics(manualId: string): Promise<any> {
    try {
      const { data: stats, error } = await supabase
        .from('manual_statistics')
        .select('*')
        .eq('id', manualId)
        .single();

      if (error) {
        throw new Error(`获取统计信息失败: ${error.message}`);
      }

      return stats;
    } catch (error) {
      console.error('获取统计信息错误:', error);
      throw error;
    }
  }

  // 私有辅助方法

  private validateManualDTO(dto: ManualDTO): void {
    if (!dto.productId) {
      throw new Error('产品ID不能为空');
    }

    if (!dto.title || Object.keys(dto.title).length === 0) {
      throw new Error('说明书标题不能为空');
    }

    if (!dto.content || Object.keys(dto.content).length === 0) {
      throw new Error('说明书内容不能为空');
    }

    if (!dto.languageCodes || dto.languageCodes.length === 0) {
      throw new Error('语言代码不能为空');
    }

    if (!dto.createdBy) {
      throw new Error('创建者ID不能为空');
    }

    // 验证语言代码一致性
    const titleLanguages = Object.keys(dto.title);
    const contentLanguages = Object.keys(dto.content);
    
    if (titleLanguages.length !== contentLanguages.length) {
      throw new Error('标题和内容的语言数量不一致');
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

  private async cleanAndValidateContent(content: Record<string, string>): Promise<Record<string, string>> {
    const cleanedContent: Record<string, string> = {};
    
    for (const [lang, htmlContent] of Object.entries(content)) {
      // 验证HTML安全性
      if (!await this.validateHtmlContent(htmlContent)) {
        throw new Error(`语言 ${lang} 的HTML内容包含不安全元素`);
      }
      
      // 清理和优化HTML
      cleanedContent[lang] = await this.optimizeHtml(htmlContent);
    }
    
    return cleanedContent;
  }

  private async validateHtmlContent(html: string): Promise<boolean> {
    // 检查危险标签和属性
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form'];
    const dangerousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /on\w+\s*=/gi,
      /javascript:/gi,
      /data:/gi
    ];

    // 检查危险标签
    for (const tag of dangerousTags) {
      if (html.toLowerCase().includes(`<${tag}`)) {
        return false;
      }
    }

    // 检查危险模式
    for (const pattern of dangerousPatterns) {
      if (pattern.test(html)) {
        return false;
      }
    }

    return true;
  }

  private async optimizeHtml(html: string): Promise<string> {
    // 移除危险元素
    let cleaned = html.replace(/<script[^>]*>.*?<\/script>/gi, '');
    cleaned = cleaned.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
    cleaned = cleaned.replace(/<(object|embed)[^>]*>.*?<\/\1>/gi, '');
    cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    cleaned = cleaned.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
    
    // 优化图片标签
    cleaned = cleaned.replace(/<img([^>]*)>/gi, '<img$1 loading="lazy" decoding="async">');
    
    // 清理多余空白
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }

  private async createVersionSnapshot(manualId: string, manual: Manual): Promise<void> {
    try {
      const { error } = await supabase
        .from('manual_versions')
        .insert({
          manual_id: manualId,
          version: manual.version,
          title: manual.title,
          content: manual.content,
          changes: `版本 ${manual.version} as any 快照`
        });

      if (error) {
        console.error('创建版本快照失败:', error);
      }
    } catch (error) {
      console.error('创建版本快照错误:', error);
    }
  }

  private async recordReview(
    manualId: string, 
    action: string, 
    reviewerId: string, 
    comments?: string, 
    rejectionReason?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('manual_reviews')
        .insert({
          manual_id: manualId,
          reviewer_id: reviewerId,
          action,
          comments: comments || null,
          rejection_reason: rejectionReason || null
        } as any);

      if (error) {
        console.error('记录审核历史失败:', error);
      }
    } catch (error) {
      console.error('记录审核历史错误:', error);
    }
  }
}

// 导出单例实例
export const enhancedManualsService = EnhancedManualsService.getInstance();