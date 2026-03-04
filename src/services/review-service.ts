'use server';

import { supabaseAdmin as supabase } from '@/lib/supabase';

export interface Review {
  id: string;
  document_id: string;
  reviewer_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  comments: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  document?: {
    title: string;
    language: string;
    category: string;
    content: string;
    author?: {
      name: string;
    };
  };
  reviewer?: {
    email: string;
    user_metadata: {
      name?: string;
    };
  };
}

export interface Reviewer {
  id: string;
  user_id: string;
  department: string;
  permissions: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    user_metadata: {
      name?: string;
    };
  };
}

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  today_reviews: number;
}

export async function getPendingReviews(): Promise<{
  data: Review[];
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('document_reviews')
      .select(
        `
        *,
        document:product_documents(title, language, category, content),
        reviewer:reviewer_id(email, user_metadata)
      `
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('获取待审核文档失?', error);
    return { data: [], error: '获取待审核文档失? };
  }
}

export async function getReviewById(
  id: string
): Promise<{ data: Review | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('document_reviews')
      .select(
        `
        *,
        document:product_documents(title, language, category, content, author:user_id(name)),
        reviewer:reviewer_id(email, user_metadata)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('获取审核详情失败:', error);
    return { data: null, error: '获取审核详情失败' };
  }
}

export async function updateReviewStatus(
  reviewId: string,
  status: 'approved' | 'rejected',
  comments?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: '用户未登? };
    }

    // 更新审核状?    const { error: updateError } = await supabase
      .from('document_reviews')
      .update({
        status,
        comments,
        reviewed_at: new Date().toISOString(),
        reviewer_id: user.id,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', reviewId);

    if (updateError) throw updateError;

    // 如果审核通过，同时更新文档状?    if (status === 'approved') {
      const { error: docError } = await supabase
        .from('product_documents')
        .update({
          status: 'published',
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', reviewId);

      if (docError) throw docError;
    }

    // 记录审核日志
    await logReviewAction(reviewId, status, { comments, reviewer_id: user.id });

    return { success: true, error: null };
  } catch (error) {
    console.error('更新审核状态失?', error);
    return { success: false, error: '更新审核状态失? };
  }
}

export async function assignReviewer(
  documentId: string,
  reviewerId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: '用户未登? };
    }

    // 检查是否已有审核记?    const { data: existingReview } = await supabase
      .from('document_reviews')
      .select('id')
      .eq('document_id', documentId)
      .single();

    if (existingReview) {
      // 更新现有审核记录
      const { error } = await supabase
        .from('document_reviews')
        .update({
          reviewer_id: reviewerId,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', existingReview.id);

      if (error) throw error;
    } else {
      // 创建新的审核记录
      const { error } = await supabase.from('document_reviews').insert({
        document_id: documentId,
        reviewer_id: reviewerId,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);

      if (error) throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('分配审核员失?', error);
    return { success: false, error: '分配审核员失? };
  }
}

export async function getReviewStats(): Promise<{
  data: ReviewStats | null;
  error: string | null;
}> {
  try {
    // 获取总体统计
    const { count: total, error: totalError } = (await supabase
      .from('document_reviews')
      .select('*', { count: 'exact', head: true })) as any;

    if (totalError) throw totalError;

    // 获取各状态统?    const { count: pending } = await supabase
      .from('document_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: approved } = await supabase
      .from('document_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    const { count: rejected } = await supabase
      .from('document_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected');

    // 获取今日审核?    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayReviews } = await supabase
      .from('document_reviews')
      .select('*', { count: 'exact', head: true })
      .gte('reviewed_at', today.toISOString());

    return {
      data: {
        total: total || 0,
        pending: pending || 0,
        approved: approved || 0,
        rejected: rejected || 0,
        today_reviews: todayReviews || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error('获取审核统计失败:', error);
    return { data: null, error: '获取审核统计失败' };
  }
}

export async function getReviewers(): Promise<{
  data: Reviewer[];
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('reviewers')
      .select(
        `
        *,
        user:user_id(email, user_metadata)
      `
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('获取审核员列表失?', error);
    return { data: [], error: '获取审核员列表失? };
  }
}

async function logReviewAction(
  reviewId: string,
  action: string,
  details: Record<string, any>
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from('review_logs').insert({
      review_id: reviewId,
      action,
      details,
      created_by: user?.id,
      created_at: new Date().toISOString(),
    } as any);
  } catch (error) {
    console.error('记录审核日志失败:', error);
  }
}
