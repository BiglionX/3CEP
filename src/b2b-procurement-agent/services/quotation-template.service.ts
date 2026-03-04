/**
 * 询价模板管理系统
 * 负责询价邮件模板的创建、管理、渲染等功能
 */

import { createClient } from '@supabase/supabase-js';
import {
  CreateQuotationTemplateDTO,
  QuotationTemplate,
  TemplateVariables,
  UpdateQuotationTemplateDTO,
} from '../models/quotation.model';

export class QuotationTemplateService {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
  }

  /**
   * 创建询价模板
   */
  async createTemplate(
    dto: CreateQuotationTemplateDTO,
    userId: string
  ): Promise<QuotationTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('quotation_templates')
        .insert([
          {
            name: dto.name,
            subject: dto.subject,
            content: dto.content,
            content_type: dto.contentType,
            language: dto.language,
            variables: dto.variables,
            is_active: true,
            created_by: userId,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(`创建模板失败: ${error.message}`);

      return this.mapToQuotationTemplate(data);
    } catch (error) {
      console.error('创建询价模板错误:', error);
      throw error;
    }
  }

  /**
   * 获取模板列表
   */
  async getTemplates(
    userId: string,
    activeOnly: boolean = true
  ): Promise<QuotationTemplate[]> {
    try {
      let query = this.supabase
        .from('quotation_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw new Error(`获取模板列表失败: ${error.message}`);

      return data.map((item: any) => this.mapToQuotationTemplate(item));
    } catch (error) {
      console.error('获取模板列表错误:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取模板
   */
  async getTemplateById(id: string): Promise<QuotationTemplate | null> {
    try {
      const { data, error } = await this.supabase
        .from('quotation_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // 未找到记?        throw new Error(`获取模板失败: ${error.message}`);
      }

      return this.mapToQuotationTemplate(data);
    } catch (error) {
      console.error('获取模板错误:', error);
      throw error;
    }
  }

  /**
   * 更新模板
   */
  async updateTemplate(
    id: string,
    dto: UpdateQuotationTemplateDTO,
    userId: string
  ): Promise<QuotationTemplate> {
    try {
      const updateData: any = {};

      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.subject !== undefined) updateData.subject = dto.subject;
      if (dto.content !== undefined) updateData.content = dto.content;
      if (dto.contentType !== undefined)
        updateData.content_type = dto.contentType;
      if (dto.language !== undefined) updateData.language = dto.language;
      if (dto.variables !== undefined) updateData.variables = dto.variables;
      if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

      updateData.updated_at = new Date();

      const { data, error } = await this.supabase
        .from('quotation_templates')
        .update(updateData)
        .eq('id', id)
        .eq('created_by', userId)
        .select()
        .single();

      if (error) throw new Error(`更新模板失败: ${error.message}`);

      return this.mapToQuotationTemplate(data);
    } catch (error) {
      console.error('更新模板错误:', error);
      throw error;
    }
  }

  /**
   * 删除模板
   */
  async deleteTemplate(id: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('quotation_templates')
        .delete()
        .eq('id', id)
        .eq('created_by', userId);

      if (error) throw new Error(`删除模板失败: ${error.message}`);
    } catch (error) {
      console.error('删除模板错误:', error);
      throw error;
    }
  }

  /**
   * 渲染模板（简单字符串替换?   */
  renderTemplate(
    template: QuotationTemplate,
    variables: TemplateVariables
  ): { subject: string; content: string } {
    try {
      // 简单的变量替换
      let renderedSubject = template.subject;
      let renderedContent = template.content;

      // 替换变量
      Object.keys(variables).forEach(key => {
        const value = (variables as any)[key];
        const placeholder = `{{${key}}}`;
        renderedSubject = renderedSubject.replace(
          new RegExp(placeholder, 'g'),
          String(value)
        );
        renderedContent = renderedContent.replace(
          new RegExp(placeholder, 'g'),
          String(value)
        );
      });

      return {
        subject: renderedSubject,
        content: renderedContent,
      };
    } catch (error) {
      console.error('模板渲染错误:', error);
      throw new Error(`模板渲染失败: ${(error as Error).message}`);
    }
  }

  /**
   * 验证模板变量
   */
  validateTemplateVariables(
    template: QuotationTemplate,
    variables: TemplateVariables
  ): { isValid: boolean; missingVars: string[] } {
    try {
      const missingVars: string[] = [];
      const templateText = `${template.subject} ${template.content}`;

      // 检查必需的变量是否存?      const requiredVars = [
        'quotationNumber',
        'sendDate',
        'supplierName',
        'companyName',
        'contactPerson',
        'contactPhone',
        'contactEmail',
        'deliveryDeadline',
        'responseDeadline',
        'validityDays',
        'items',
      ];

      for (const varName of requiredVars) {
        if (!variables[varName as keyof TemplateVariables]) {
          missingVars.push(varName);
        }
      }

      // 检查模板中使用的变量是否都提供?      const templateVars = templateText.match(/{{\s*[a-zA-Z0-9_]+\s*}}/g);
      if (templateVars) {
        const usedVars = templateVars.map(v => v.replace(/[{}]/g, '').trim());
        const uniqueVars = [...new Set(usedVars)];

        for (const varName of uniqueVars) {
          if (!(varName in variables) && !missingVars.includes(varName)) {
            missingVars.push(varName);
          }
        }
      }

      return {
        isValid: missingVars.length === 0,
        missingVars,
      };
    } catch (error) {
      console.error('模板变量验证错误:', error);
      return { isValid: false, missingVars: ['验证过程出错'] };
    }
  }

  /**
   * 预览模板
   */
  async previewTemplate(
    templateId: string,
    variables: TemplateVariables
  ): Promise<{ subject: string; content: string }> {
    const template = await this.getTemplateById(templateId);
    if (!template) {
      throw new Error('模板不存?);
    }

    const validation = this.validateTemplateVariables(template, variables);
    if (!validation.isValid) {
      throw new Error(
        `缺少必要的模板变? ${validation.missingVars.join(', ')}`
      );
    }

    return this.renderTemplate(template, variables);
  }

  /**
   * 获取系统默认模板
   */
  async getSystemTemplates(): Promise<QuotationTemplate[]> {
    try {
      const { data, error } = await this.supabase
        .from('quotation_templates')
        .select('*')
        .eq('created_by', '00000000-0000-0000-0000-000000000000') // 系统用户ID
        .eq('is_active', true)
        .order('name');

      if (error) throw new Error(`获取系统模板失败: ${error.message}`);

      return data.map((item: any) => this.mapToQuotationTemplate(item));
    } catch (error) {
      console.error('获取系统模板错误:', error);
      throw error;
    }
  }

  /**
   * 复制模板
   */
  async copyTemplate(
    templateId: string,
    newName: string,
    userId: string
  ): Promise<QuotationTemplate> {
    try {
      const originalTemplate = await this.getTemplateById(templateId);
      if (!originalTemplate) {
        throw new Error('原模板不存在');
      }

      const newTemplate = await this.createTemplate(
        {
          name: newName,
          subject: originalTemplate.subject,
          content: originalTemplate.content,
          contentType: originalTemplate.contentType,
          language: originalTemplate.language,
          variables: originalTemplate.variables,
        },
        userId
      );

      return newTemplate;
    } catch (error) {
      console.error('复制模板错误:', error);
      throw error;
    }
  }

  /**
   * 将数据库记录映射为QuotationTemplate对象
   */
  private mapToQuotationTemplate(data: any): QuotationTemplate {
    return {
      id: data.id,
      name: data.name,
      subject: data.subject,
      content: data.content,
      contentType: data.content_type,
      language: data.language,
      variables: data.variables || {},
      isActive: data.is_active,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

// 导出默认实例
export const quotationTemplateService = new QuotationTemplateService();
