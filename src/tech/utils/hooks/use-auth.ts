import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  // 监听认证状态变?
  useEffect(() => {
    // 获取当前用户
    const getUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setAuthState((prev) => ({
          ...prev,
          user: session?.user || null,
          isLoading: false,
        }));
      } catch (error) {
        console.error("获取用户信息失败:", error);
        setAuthState((prev) => ({
          ...prev,
          error: "获取用户信息失败",
          isLoading: false,
        }));
      }
    };

    getUser();

    // 监听认证状态变?
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user || null,
        isLoading: false,
        error: null,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 登录
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setAuthState({
        user: data.user,
        isLoading: false,
        error: null,
      });

      return { success: true, user: data.user };
    } catch (error: any) {
      const errorMessage = error.message || "登录失败";
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // 注册
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      setAuthState({
        user: data.user,
        isLoading: false,
        error: null,
      });

      return { success: true, user: data.user };
    } catch (error: any) {
      const errorMessage = error.message || "注册失败";
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // 登出
  const signOut = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || "登出失败";
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // 重置密码
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || "发送重置邮件失败";
      return { success: false, error: errorMessage };
    }
  }, []);

  // 更新用户信息
  const updateUser = useCallback(
    async (userData: { email?: string; password?: string; data?: object }) => {
      try {
        const { data, error } = await supabase.auth.updateUser(userData);

        if (error) throw error;

        setAuthState((prev) => ({
          ...prev,
          user: data.user || prev.user,
        }));

        return { success: true, user: data.user };
      } catch (error: any) {
        const errorMessage = error.message || "更新用户信息失败";
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUser,
  };
}

// 专门用于众筹系统的认证Hook
export function useCrowdfundingAuth() {
  const { user, isLoading, error, signIn, signUp, signOut } = useAuth();

  // 检查用户是否有创建项目权限
  const canCreateProject = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      // 检查用户是否在admin_users表中有记录且激?
      const { data, error } = await supabase
        .from("admin_users")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      return !error && data !== null;
    } catch (error) {
      console.error("检查创建项目权限失?", error);
      return false;
    }
  }, [user]);

  // 检查用户是否是项目创建?
  const isProjectCreator = useCallback(
    async (projectId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { data, error } = await supabase
          .from("crowdfunding_projects")
          .select("creator_id")
          .eq("id", projectId)
          .single();

        if (error) return false;

        return data.creator_id === user.id;
      } catch (error) {
        console.error("检查项目创建者身份失?", error);
        return false;
      }
    },
    [user]
  );

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    canCreateProject,
    isProjectCreator,
  };
}
