#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚨 紧急修复：统一认证Hook无限循环问题\n');

// 修复useUnifiedAuth Hook中的无限循环问题
const hookPath = path.join(
  process.cwd(),
  'src',
  'hooks',
  'use-unified-auth.ts'
);

if (fs.existsSync(hookPath)) {
  let content = fs.readFileSync(hookPath, 'utf8');

  console.log('1️⃣ 修复认证状态监听中的无限循环...');

  // 找到问题代码 - 认证状态变化监听器中的异步调用
  const problematicListener = `    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        AuthService.isAdminUser(session.user.id).then(isAdmin => {
          setAuthState({
            user: session.user,
            isAuthenticated: true,
            is_admin: isAdmin,
            roles: isAdmin ? ['admin'] : ['viewer'],
            isLoading: false,
            error: null
          });
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          is_admin: false,
          roles: [],
          isLoading: false,
          error: null
        });
      }
    });`;

  // 修复方案：添加防抖动和状态比较
  const fixedListener = `    // 防止无限循环的状态缓存
    let lastUserId = null;
    let lastAuthState = null;
    
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUserId = session?.user?.id || null;
      const currentAuthState = session ? 'authenticated' : 'unauthenticated';
      
      // 只有当用户真正发生变化时才更新状态
      if (currentUserId !== lastUserId || currentAuthState !== lastAuthState) {
        lastUserId = currentUserId;
        lastAuthState = currentAuthState;
        
        if (session?.user) {
          // 使用缓存避免重复的管理员检查
          const cachedIsAdmin = window.__adminCache?.[currentUserId];
          if (cachedIsAdmin !== undefined) {
            setAuthState({
              user: session.user,
              isAuthenticated: true,
              is_admin: cachedIsAdmin,
              roles: cachedIsAdmin ? ['admin'] : ['viewer'],
              isLoading: false,
              error: null
            });
          } else {
            // 首次检查并缓存结果
            AuthService.isAdminUser(session.user.id).then(isAdmin => {
              // 缓存结果
              if (!window.__adminCache) window.__adminCache = {};
              window.__adminCache[currentUserId] = isAdmin;
              
              setAuthState({
                user: session.user,
                isAuthenticated: true,
                is_admin: isAdmin,
                roles: isAdmin ? ['admin'] : ['viewer'],
                isLoading: false,
                error: null
              });
            }).catch(error => {
              console.warn('管理员权限检查失败:', error);
              // 失败时默认为非管理员
              setAuthState({
                user: session.user,
                isAuthenticated: true,
                is_admin: false,
                roles: ['viewer'],
                isLoading: false,
                error: null
              });
            });
          }
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            is_admin: false,
            roles: [],
            isLoading: false,
            error: null
          });
        }
      }
    });`;

  if (content.includes(problematicListener)) {
    content = content.replace(problematicListener, fixedListener);
    console.log('✅ 修复了认证监听器中的无限循环问题');
  } else {
    console.log('⚠️  未找到预期的认证监听器代码');
  }

  console.log('\n2️⃣ 添加初始化防抖动机制...');

  // 在Hook顶部添加防抖动标志
  const hookStart = `export function useUnifiedAuth() {`;

  const debouncedHookStart = `// 全局防抖动标志
let isInitializing = false;

export function useUnifiedAuth() {`;

  if (
    content.includes(hookStart) &&
    !content.includes('isInitializing = false')
  ) {
    content = content.replace(hookStart, debouncedHookStart);
    console.log('✅ 添加了Hook级别的防抖动机制');
  }

  console.log('\n3️⃣ 优化初始化逻辑...');

  // 找到初始化逻辑
  const initLogic = `  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 检查Supabase会话
        const { data: { session } } = await supabase.auth.getSession();`;

  const optimizedInitLogic = `  useEffect(() => {
    // 防止重复初始化
    if (isInitializing) return;
    isInitializing = true;
    
    const initializeAuth = async () => {
      try {
        // 检查Supabase会话
        const { data: { session } } = await supabase.auth.getSession();`;

  if (content.includes(initLogic)) {
    content = content.replace(initLogic, optimizedInitLogic);
    console.log('✅ 优化了初始化逻辑，防止重复执行');
  }

  // 写入修复后的内容
  fs.writeFileSync(hookPath, content);
  console.log('\n✅ useUnifiedAuth Hook修复完成！');
} else {
  console.log('❌ 未找到useUnifiedAuth Hook文件');
}

// 创建紧急替代方案
console.log('\n4️⃣ 创建紧急替代认证Hook...');

const emergencyHookContent = `'use client';

/**
 * 紧急替代认证Hook - 避免无限循环问题
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthService } from '@/lib/auth-service';

interface EmergencyAuthState {
  user: any;
  isAuthenticated: boolean;
  is_admin: boolean;
  roles: string[];
  isLoading: boolean;
  error: string | null;
}

// 全局缓存避免重复检查
const authCache = new Map();
const adminCache = new Map();

export function useEmergencyAuth() {
  const [authState, setAuthState] = useState<EmergencyAuthState>({
    user: null,
    isAuthenticated: false,
    is_admin: false,
    roles: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        // 检查缓存
        const cacheKey = 'current_session';
        const cached = authCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < 5000) {
          // 使用缓存数据
          if (isMounted) {
            setAuthState(cached.data);
          }
          return;
        }
        
        // 获取当前会话
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user && isMounted) {
          // 检查管理员权限（带缓存）
          let isAdmin = adminCache.get(session.user.id);
          if (isAdmin === undefined) {
            try {
              isAdmin = await AuthService.isAdminUser(session.user.id);
              adminCache.set(session.user.id, isAdmin);
            } catch (adminError) {
              console.warn('管理员检查失败:', adminError);
              isAdmin = false;
            }
          }
          
          const newState = {
            user: session.user,
            isAuthenticated: true,
            is_admin: isAdmin,
            roles: isAdmin ? ['admin'] : ['viewer'],
            isLoading: false,
            error: null
          };
          
          // 缓存结果
          authCache.set(cacheKey, {
            data: newState,
            timestamp: Date.now()
          });
          
          setAuthState(newState);
        } else if (isMounted) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            is_admin: false,
            roles: [],
            isLoading: false,
            error: null
          });
        }
      } catch (error: any) {
        if (isMounted) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            is_admin: false,
            roles: [],
            isLoading: false,
            error: error.message || '认证检查失败'
          });
        }
      }
    };
    
    checkAuth();
    
    // 监听认证变化（简化版）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (isMounted) {
        // 清除缓存并重新检查
        authCache.clear();
        checkAuth();
      }
    });
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // 清除相关缓存
      authCache.clear();
      adminCache.delete(data.user.id);
      
      // 重新检查管理员权限
      const isAdmin = await AuthService.isAdminUser(data.user.id);
      adminCache.set(data.user.id, isAdmin);
      
      const newState = {
        user: data.user,
        isAuthenticated: true,
        is_admin: isAdmin,
        roles: isAdmin ? ['admin'] : ['viewer'],
        isLoading: false,
        error: null
      };
      
      setAuthState(newState);
      return { success: true, user: data.user };
    } catch (error: any) {
      const errorMessage = error.message || '登录失败';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await supabase.auth.signOut();
      localStorage.removeItem('jwt_token');
      
      // 清除所有缓存
      authCache.clear();
      adminCache.clear();
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        is_admin: false,
        roles: [],
        isLoading: false,
        error: null
      });
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || '登出失败';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const hasPermission = (permission: string) => {
    return authState.is_admin;
  };

  return {
    ...authState,
    login,
    logout,
    hasPermission
  };
}`;

const emergencyHookPath = path.join(
  process.cwd(),
  'src',
  'hooks',
  'use-emergency-auth.ts'
);
fs.writeFileSync(emergencyHookPath, emergencyHookContent);
console.log('✅ 创建了紧急替代认证Hook');

console.log('\n🎉 紧急修复完成！');
console.log('\n📋 立即操作建议:');
console.log('1. 重启开发服务器: npm run dev');
console.log('2. 清除浏览器所有缓存和存储');
console.log(
  '3. 测试登录功能: http://localhost:3001/login?redirect=/admin/dashboard'
);
console.log('4. 如仍有问题，可临时使用紧急Hook替换原Hook');
