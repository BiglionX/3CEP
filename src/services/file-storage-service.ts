import { createClient } from '@supabase/supabase-js';

// 初始?Supabase 客户?const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface FileUploadResult {
  success: boolean;
  fileUrl?: string;
  error?: string;
  fileId?: string;
}

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

/**
 * 文件上传服务? */
export class FileStorageService {
  private static readonly BUCKET_NAME = 'enterprise-files';
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * 验证文件
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // 检查文件大?    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `文件大小超过限制 (${this.formatFileSize(this.MAX_FILE_SIZE)})`,
      };
    }

    // 检查文件类?    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: '不支持的文件类型',
      };
    }

    return { valid: true };
  }

  /**
   * 上传文件?Supabase Storage
   */
  static async uploadFile(
    file: File,
    folderPath: string = 'uploads',
    userId?: string
  ): Promise<FileUploadResult> {
    try {
      // 验证文件
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // 生成唯一文件?      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      const filePath = `${folderPath}/${fileName}`;

      // 上传文件
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('文件上传失败:', error);
        return { success: false, error: `上传失败: ${error.message}` };
      }

      // 获取公共URL
      const { data: publicUrlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        success: true,
        fileUrl: publicUrlData.publicUrl,
        fileId: data.path,
      };
    } catch (error) {
      console.error('文件上传异常:', error);
      return {
        success: false,
        error: '上传过程中发生错?,
      };
    }
  }

  /**
   * 删除文件
   */
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('文件删除失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('文件删除异常:', error);
      return false;
    }
  }

  /**
   * 获取文件信息
   */
  static async getFileInfo(filePath: string): Promise<FileInfo | null> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(filePath);

      if (error) {
        console.error('获取文件信息失败:', error);
        return null;
      }

      return {
        id: filePath,
        name: filePath.split('/').pop() || '',
        size: data.size,
        type: data.type,
        url: URL.createObjectURL(data),
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'current_user', // 实际应用中应从认证获?      };
    } catch (error) {
      console.error('获取文件信息异常:', error);
      return null;
    }
  }

  /**
   * 列出文件夹中的文?   */
  static async listFiles(folderPath: string = ''): Promise<FileInfo[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(folderPath);

      if (error) {
        console.error('列出文件失败:', error);
        return [];
      }

      return data.map(file => ({
        id: file.name,
        name: file.name,
        size: file?.size || 0,
        type: this.getFileTypeFromName(file.name),
        url: '',
        uploadedAt: file.updated_at,
        uploadedBy: 'system',
      }));
    } catch (error) {
      console.error('列出文件异常:', error);
      return [];
    }
  }

  /**
   * 根据文件名推断文件类?   */
  private static getFileTypeFromName(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      txt: 'text/plain',
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  /**
   * 格式化文件大?   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 创建文件?   */
  static async createFolder(folderPath: string): Promise<boolean> {
    try {
      // Supabase Storage 不直接支持创建空文件?      // 我们可以通过上传一个占位文件来创建文件夹结?      const placeholderPath = `${folderPath}/.gitkeep`;

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(placeholderPath, new Blob(['']), {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('创建文件夹失?', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('创建文件夹异?', error);
      return false;
    }
  }

  /**
   * 获取存储桶信?   */
  static async getBucketInfo() {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list();

      if (error) {
        console.error('获取存储桶信息失?', error);
        return null;
      }

      return {
        bucket: this.BUCKET_NAME,
        fileCount: (data as any)?.data.length,
        maxSize: this.MAX_FILE_SIZE,
      };
    } catch (error) {
      console.error('获取存储桶信息异?', error);
      return null;
    }
  }
}

/**
 * 企业文档管理服务
 */
export class EnterpriseDocumentService {
  private static readonly DOCUMENTS_TABLE = 'enterprise_documents';

  /**
   * 保存文档记录到数据库
   */
  static async saveDocumentRecord(documentData: {
    enterprise_id: string;
    title: string;
    description: string;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    file_extension: string;
    category: string;
    version: string;
    tags: string[];
    access_level: string;
    uploaded_by: string;
  }) {
    try {
      const { data, error } = await supabase
        .from(this.DOCUMENTS_TABLE)
        .insert(documentData)
        .select()
        .single();

      if (error) {
        console.error('保存文档记录失败:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('保存文档记录异常:', error);
      return { success: false, error: '保存记录时发生错? };
    }
  }

  /**
   * 获取企业文档列表
   */
  static async getEnterpriseDocuments(enterpriseId: string) {
    try {
      const { data, error } = await supabase
        .from(this.DOCUMENTS_TABLE)
        .select('*')
        .eq('enterprise_id', enterpriseId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('获取文档列表失败:', error);
        return { success: false, error: error.message, data: [] };
      }

      return { success: true, data };
    } catch (error) {
      console.error('获取文档列表异常:', error);
      return { success: false, error: '获取文档时发生错?, data: [] };
    }
  }

  /**
   * 更新文档状?   */
  static async updateDocumentStatus(
    documentId: string,
    status: string,
    reviewerId?: string,
    rejectionReason?: string
  ) {
    try {
      const updateData: any = { status };

      if (reviewerId) {
        updateData.reviewed_by = reviewerId;
        updateData.reviewed_at = new Date().toISOString();
      }

      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const { data, error } = await supabase
        .from(this.DOCUMENTS_TABLE)
        .update(updateData)
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        console.error('更新文档状态失?', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('更新文档状态异?', error);
      return { success: false, error: '更新状态时发生错误' };
    }
  }

  /**
   * 删除文档记录和文?   */
  static async deleteDocument(documentId: string, filePath: string) {
    try {
      // 先删除存储中的文?      const fileDeleted = await FileStorageService.deleteFile(filePath);

      if (!fileDeleted) {
        return { success: false, error: '文件删除失败' };
      }

      // 再删除数据库记录
      const { error } = await supabase
        .from(this.DOCUMENTS_TABLE)
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('删除文档记录失败:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('删除文档异常:', error);
      return { success: false, error: '删除文档时发生错? };
    }
  }
}
