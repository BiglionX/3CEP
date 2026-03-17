import { supabase } from '@/lib/supabase';

// 问答活动接口定义
export interface RewardActivity {
  id: string;
  enterprise_id: string;
  title: string;
  description: string;
  reward_type: 'fcx' | 'physical' | 'both';
  reward_amount: number;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  status: 'draft' | 'active' | 'ended' | 'closed';
  created_at: string;
  updated_at: string;
}

// 问答题目接口定义
export interface RewardQuestion {
  id: string;
  activity_id: string;
  question_text: string;
  question_type: 'single' | 'multiple' | 'text';
  options: { label: string; value: string; isCorrect: boolean }[];
  correct_answer: string;
  explanation: string;
  points: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// 用户答题记录接口定义
export interface UserRewardAnswer {
  id: string;
  activity_id: string;
  question_id: string;
  user_id: string;
  user_answer: string;
  is_correct: boolean;
  points_earned: number;
  reward_claimed: boolean;
  claimed_at: string | null;
  answered_at: string;
}

// 创建活动数据
export interface ActivityCreateData {
  title: string;
  description?: string;
  reward_type?: 'fcx' | 'physical' | 'both';
  reward_amount?: number;
  start_time?: string;
  end_time?: string;
  max_participants?: number;
}

// 更新活动数据
export interface ActivityUpdateData {
  title?: string;
  description?: string;
  reward_type?: 'fcx' | 'physical' | 'both';
  reward_amount?: number;
  start_time?: string;
  end_time?: string;
  max_participants?: number;
  status?: 'draft' | 'active' | 'ended' | 'closed';
}

// 创建题目数据
export interface QuestionCreateData {
  activity_id: string;
  question_text: string;
  question_type?: 'single' | 'multiple' | 'text';
  options?: { label: string; value: string; isCorrect: boolean }[];
  correct_answer: string;
  explanation?: string;
  points?: number;
  sort_order?: number;
}

// 更新题目数据
export interface QuestionUpdateData {
  question_text?: string;
  question_type?: 'single' | 'multiple' | 'text';
  options?: { label: string; value: string; isCorrect: boolean }[];
  correct_answer?: string;
  explanation?: string;
  points?: number;
  sort_order?: number;
}

// 提交答案数据
export interface SubmitAnswerData {
  activity_id: string;
  question_id: string;
  user_answer: string;
}

export class RewardQAService {
  // ========== 活动管理 ==========

  // 获取企业的所有问答活动
  static async getActivities(
    enterpriseId: string,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('reward_activities')
        .select('*', { count: 'exact' })
        .eq('enterprise_id', enterpriseId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        activities: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error('获取问答活动列表失败:', error);
      throw error;
    }
  }

  // 获取单个活动详情
  static async getActivityById(id: string) {
    try {
      const { data, error } = await supabase
        .from('reward_activities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('获取活动详情失败:', error);
      throw error;
    }
  }

  // 创建问答活动
  static async createActivity(
    activityData: ActivityCreateData,
    enterpriseId: string
  ) {
    try {
      const { data, error } = await supabase
        .from('reward_activities')
        .insert({
          enterprise_id: enterpriseId,
          title: activityData.title,
          description: activityData.description || '',
          reward_type: activityData.reward_type || 'fcx',
          reward_amount: activityData.reward_amount || 0,
          start_time: activityData.start_time,
          end_time: activityData.end_time,
          max_participants: activityData.max_participants || 100,
          current_participants: 0,
          status: 'draft',
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('创建问答活动失败:', error);
      throw error;
    }
  }

  // 更新问答活动
  static async updateActivity(id: string, activityData: ActivityUpdateData) {
    try {
      const { data, error } = await supabase
        .from('reward_activities')
        .update({
          ...activityData,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('更新问答活动失败:', error);
      throw error;
    }
  }

  // 删除问答活动
  static async deleteActivity(id: string) {
    try {
      const { error } = await supabase
        .from('reward_activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('删除问答活动失败:', error);
      throw error;
    }
  }

  // 发布活动
  static async publishActivity(id: string) {
    try {
      const { data, error } = await supabase
        .from('reward_activities')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('发布问答活动失败:', error);
      throw error;
    }
  }

  // 结束活动
  static async endActivity(id: string) {
    try {
      const { data, error } = await supabase
        .from('reward_activities')
        .update({
          status: 'ended',
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('结束问答活动失败:', error);
      throw error;
    }
  }

  // ========== 题目管理 ==========

  // 获取活动的所有题目
  static async getQuestions(activityId: string) {
    try {
      const { data, error } = await supabase
        .from('reward_questions')
        .select('*')
        .eq('activity_id', activityId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取题目列表失败:', error);
      throw error;
    }
  }

  // 获取单个题目详情
  static async getQuestionById(id: string) {
    try {
      const { data, error } = await supabase
        .from('reward_questions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('获取题目详情失败:', error);
      throw error;
    }
  }

  // 创建题目
  static async createQuestion(questionData: QuestionCreateData) {
    try {
      const { data, error } = await supabase
        .from('reward_questions')
        .insert({
          activity_id: questionData.activity_id,
          question_text: questionData.question_text,
          question_type: questionData.question_type || 'single',
          options: questionData.options || [],
          correct_answer: questionData.correct_answer,
          explanation: questionData.explanation || '',
          points: questionData.points || 10,
          sort_order: questionData.sort_order || 0,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('创建题目失败:', error);
      throw error;
    }
  }

  // 更新题目
  static async updateQuestion(id: string, questionData: QuestionUpdateData) {
    try {
      const { data, error } = await supabase
        .from('reward_questions')
        .update({
          ...questionData,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('更新题目失败:', error);
      throw error;
    }
  }

  // 删除题目
  static async deleteQuestion(id: string) {
    try {
      const { error } = await supabase
        .from('reward_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('删除题目失败:', error);
      throw error;
    }
  }

  // 批量创建题目
  static async batchCreateQuestions(questions: QuestionCreateData[]) {
    try {
      const { data, error } = await supabase
        .from('reward_questions')
        .insert(
          questions.map((q, index) => ({
            activity_id: q.activity_id,
            question_text: q.question_text,
            question_type: q.question_type || 'single',
            options: q.options || [],
            correct_answer: q.correct_answer,
            explanation: q.explanation || '',
            points: q.points || 10,
            sort_order: q.sort_order || index,
          })) as any
        )
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('批量创建题目失败:', error);
      throw error;
    }
  }

  // ========== 用户答题 ==========

  // 提交答案
  static async submitAnswer(answerData: SubmitAnswerData, userId: string) {
    try {
      // 获取题目信息
      const question = await this.getQuestionById(answerData.question_id);
      if (!question) {
        throw new Error('题目不存在');
      }

      // 检查是否已答题
      const { data: existingAnswer } = await supabase
        .from('user_reward_answers')
        .select('*')
        .eq('question_id', answerData.question_id)
        .eq('user_id', userId)
        .single();

      if (existingAnswer) {
        throw new Error('您已经回答过这道题了');
      }

      // 判断答案是否正确
      let isCorrect = false;
      if (question.question_type === 'multiple') {
        // 多选题：比较答案数组
        const correctAnswers = question.correct_answer.split(',').sort();
        const userAnswers = answerData.user_answer.split(',').sort();
        isCorrect =
          JSON.stringify(correctAnswers) === JSON.stringify(userAnswers);
      } else {
        // 单选题和文本题
        isCorrect =
          question.correct_answer.toLowerCase() ===
          answerData.user_answer.toLowerCase();
      }

      // 保存答案记录
      const { data, error } = await supabase
        .from('user_reward_answers')
        .insert({
          activity_id: answerData.activity_id,
          question_id: answerData.question_id,
          user_id: userId,
          user_answer: answerData.user_answer,
          is_correct: isCorrect,
          points_earned: isCorrect ? question.points : 0,
          reward_claimed: false,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // 更新活动的参与人数
      await supabase.rpc('increment_participants', {
        activity_id: answerData.activity_id,
      });

      return {
        ...data,
        is_correct: isCorrect,
        points_earned: isCorrect ? question.points : 0,
      };
    } catch (error) {
      console.error('提交答案失败:', error);
      throw error;
    }
  }

  // 获取用户答题记录
  static async getUserAnswers(activityId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_reward_answers')
        .select('*')
        .eq('activity_id', activityId)
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取答题记录失败:', error);
      throw error;
    }
  }

  // 领取奖励
  static async claimReward(answerId: string, userId: string) {
    try {
      // 检查答案记录
      const { data: answer, error: fetchError } = await supabase
        .from('user_reward_answers')
        .select('*')
        .eq('id', answerId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !answer) {
        throw new Error('答题记录不存在');
      }

      if (answer.reward_claimed) {
        throw new Error('奖励已领取');
      }

      if (!answer.is_correct) {
        throw new Error('答题错误，无法领取奖励');
      }

      // 更新领取状态
      const { data, error } = await supabase
        .from('user_reward_answers')
        .update({
          reward_claimed: true,
          claimed_at: new Date().toISOString(),
        } as any)
        .eq('id', answerId)
        .select()
        .single();

      if (error) throw error;

      // TODO: 这里可以添加发放FCX奖励的逻辑
      // await FcxService.grantReward(userId, answer.points_earned);

      return data;
    } catch (error) {
      console.error('领取奖励失败:', error);
      throw error;
    }
  }

  // ========== 统计 ==========

  // 获取活动统计信息
  static async getActivityStats(activityId: string) {
    try {
      // 获取参与人数
      const { count: participantsCount } = await supabase
        .from('user_reward_answers')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', activityId);

      // 获取正确人数
      const { count: correctCount } = await supabase
        .from('user_reward_answers')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', activityId)
        .eq('is_correct', true);

      // 获取已领取奖励人数
      const { count: claimedCount } = await supabase
        .from('user_reward_answers')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', activityId)
        .eq('reward_claimed', true);

      // 获取总发放奖励
      const { data: pointsData } = await supabase
        .from('user_reward_answers')
        .select('points_earned')
        .eq('activity_id', activityId)
        .eq('reward_claimed', true);

      const totalPoints =
        pointsData?.reduce((sum, item) => sum + item.points_earned, 0) || 0;

      return {
        participantsCount: participantsCount || 0,
        correctCount: correctCount || 0,
        claimedCount: claimedCount || 0,
        totalPoints,
      };
    } catch (error) {
      console.error('获取活动统计失败:', error);
      throw error;
    }
  }
}
