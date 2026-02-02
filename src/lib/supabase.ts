// src/lib/supabase.ts
// 本地API适配器 - 保持与原Supabase接口兼容
import { apiClient } from './api-client';
import type { Database } from '@/types/database';

// 定义Supabase标准类型
export interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  [key: string]: any;
}

export interface Session {
  id: string;
  user: User;
  provider_token?: string;
  [key: string]: any;
}

export interface AuthChangeEvent {
  (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED' | 'USER_DELETED', session: Session | null): void;
}

export interface AuthResponse {
  data: {
    session: Session | null;
    user: User | null;
  };
  error: any;
}

export interface SignUpResponse {
  data: {
    session: Session | null;
    user: User | null;
  };
  error: any;
}

export interface SignInWithPasswordCredentials {
  email: string;
  password: string;
}

export interface SignInResponse {
  data: {
    session: Session | null;
    user: User | null;
  };
  error: any;
}

export interface AuthChangeEventMFA {
  (event: 'MFA_CHALLENGE_VERIFIED', session: Session | null): void;
}

export interface Subscription {
  unsubscribe: () => void;
}

export interface RealtimeSubscriptionOptions {
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  schema?: string;
  table?: string;
  filter?: string;
}

export interface RealtimeChannel {
  subscribe(callback: (payload: any) => void): void;
  unsubscribe(): void;
}

export interface FunctionsResponse {
  data: any;
  error: any;
}

export interface RpcResponse<R> {
  data: R;
  error: any;
}

export interface QueryResult<T> {
  data: T | null;
  error: any;
}

export interface QuerySingleResult<T> {
  data: T extends any[] ? T[number] : T | null;
  error: any;
}

export interface QueryMultipleResult<T> {
  data: T[];
  error: any;
}

// Auth API 模拟实现
class AuthAPI {
  private currentUser: User | null = null;
  private currentSession: Session | null = null;
  private listeners: Array<(event: string, session: Session | null) => void> = [];

  async getSession(): Promise<AuthResponse> {
    // 尝试从localStorage恢复会话
    const savedSession = localStorage.getItem('auth_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        this.currentSession = session;
        this.currentUser = session.user || null;
        return { data: { session, user: session.user }, error: null };
      } catch (error) {
        console.error('Error parsing saved session:', error);
        return { data: { session: null, user: null }, error };
      }
    }
    return { data: { session: this.currentSession, user: this.currentUser }, error: null };
  }

  async signInWithPassword(credentials: SignInWithPasswordCredentials): Promise<SignInResponse> {
    try {
      // 模拟登录过程 - 使用固定的测试凭据
      // 在实际应用中，这里会调用后端API进行身份验证
      if (credentials.email && credentials.password) {
        // 创建一个模拟用户
        const user: User = {
          id: '123e4567-e89b-12d3-a456-426614174000', // 模拟UUID
          email: credentials.email,
          user_metadata: {},
          app_metadata: {}
        };

        const session: Session = {
          id: 'sess_' + Date.now().toString(36),
          user: user,
          provider_token: 'mock_provider_token'
        };

        this.currentUser = user;
        this.currentSession = session;

        // 保存会话到localStorage
        localStorage.setItem('auth_session', JSON.stringify(session));

        // 触发认证事件
        this.notifyListeners('SIGNED_IN', session);

        return { data: { session, user }, error: null };
      }

      return { data: { session: null, user: null }, error: new Error('Invalid credentials') };
    } catch (error) {
      return { data: { session: null, user: null }, error };
    }
  }

  async signUp(credentials: SignInWithPasswordCredentials): Promise<SignUpResponse> {
    try {
      // 模拟注册过程
      if (credentials.email && credentials.password) {
        // 创建一个模拟用户
        const user: User = {
          id: '123e4567-e89b-12d3-a456-426614174000', // 模拟UUID
          email: credentials.email,
          user_metadata: {},
          app_metadata: {}
        };

        const session: Session = {
          id: 'sess_' + Date.now().toString(36),
          user: user,
          provider_token: 'mock_provider_token'
        };

        this.currentUser = user;
        this.currentSession = session;

        // 保存会话到localStorage
        localStorage.setItem('auth_session', JSON.stringify(session));

        // 触发认证事件
        this.notifyListeners('SIGNED_IN', session);

        return { data: { session, user }, error: null };
      }

      return { data: { session: null, user: null }, error: new Error('Invalid credentials') };
    } catch (error) {
      return { data: { session: null, user: null }, error };
    }
  }

  async signOut(): Promise<{ error: any }> {
    try {
      this.currentUser = null;
      this.currentSession = null;
      
      // 清除本地存储的会话
      localStorage.removeItem('auth_session');
      
      // 触发认证事件
      this.notifyListeners('SIGNED_OUT', null);
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  onAuthStateChange(callback: AuthChangeEvent): { data: { subscription: Subscription } } {
    this.listeners.push(callback);
    
    // 立即触发一次当前状态
    callback('SIGNED_IN', this.currentSession);
    
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
              this.listeners.splice(index, 1);
            }
          }
        }
      }
    };
  }

  private notifyListeners(event: string, session: Session | null) {
    this.listeners.forEach(listener => {
      listener(event, session);
    });
  }
}

class LocalApiAdapter {
  public auth: AuthAPI;

  constructor() {
    this.auth = new AuthAPI();
  }

  from<T extends keyof Database['public']['Tables']>(table: T) {
    return new TableOperation<T>(table);
  }
}

class TableOperation<T extends keyof Database['public']['Tables']> {
  private table: T;

  constructor(table: T) {
    this.table = table;
  }

  async select(columns?: string): Promise<QueryMultipleResult<Database['public']['Tables'][T]['Row']>> {
    try {
      // 获取当前用户ID
      const authResult = await supabase.auth.getSession();
      const userId = authResult.data.session?.user?.id || this.getCurrentUserId();
      
      if (this.table === 'profiles') {
        // 特殊处理profiles表的查询
        if (columns && columns.includes('id') && userId) {
          // 查询特定用户的资料
          const profile = await apiClient.getProfile(userId);
          return { data: [profile], error: null } as any;
        }
        return { data: [], error: null } as any;
      } else if (this.table === 'skills') {
        if (userId) {
          const data = await apiClient.getSkills(userId);
          return { data, error: null } as any;
        }
      } else if (this.table === 'goals') {
        if (userId) {
          const data = await apiClient.getGoals(userId);
          return { data, error: null } as any;
        }
      } else if (this.table === 'achievements') {
        if (userId) {
          const data = await apiClient.getAchievements(userId);
          return { data, error: null } as any;
        }
      }
      
      return { data: [], error: null } as any;
    } catch (error) {
      console.error(`Error in select for table ${this.table}:`, error);
      return { data: [], error } as any;
    }
  }

  // 辅助方法：获取当前用户ID
  private getCurrentUserId(): string | null {
    // 从全局上下文获取用户ID
    if (typeof window !== 'undefined' && (window as any).__USER_ID__) {
      return (window as any).__USER_ID__;
    }
    // 或者从其他地方获取，例如localStorage
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.id || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  async insert(values: Partial<Database['public']['Tables'][T]['Insert']>): Promise<QueryResult<any>> {
    try {
      if (this.table === 'profiles') {
        const data = await apiClient.upsertProfile(values);
        return { data, error: null };
      } else if (this.table === 'skills') {
        const data = await apiClient.createSkill(values);
        return { data, error: null };
      } else if (this.table === 'goals') {
        const data = await apiClient.createGoal(values);
        return { data, error: null };
      } else if (this.table === 'achievements') {
        const data = await apiClient.createAchievement(values);
        return { data, error: null };
      }
      
      return { data: null, error: null };
    } catch (error) {
      console.error(`Error in insert for table ${this.table}:`, error);
      return { data: null, error };
    }
  }

  async upsert(values: Partial<Database['public']['Tables'][T]['Insert']>): Promise<QueryResult<any>> {
    return this.insert(values); // 对于我们的API，upsert和insert行为相同
  }

  async update(values: Partial<Database['public']['Tables'][T]['Update']>) {
    // update方法需要先调用eq指定条件
    return new UpdateOperation<T>(this.table, values);
  }

  eq(column: string, value: any) {
    // 为简单起见，这里我们返回一个可以链式调用的对象
    if (this.table === 'profiles' && column === 'id') {
      // 当查询特定用户资料时
      return {
        single: async (): Promise<QuerySingleResult<Database['public']['Tables'][T]['Row']>> => {
          try {
            const data = await apiClient.getProfile(value);
            return { data, error: null } as any;
          } catch (error) {
            console.error(`Error in profiles single query:`, error);
            return { data: null, error } as any;
          }
        }
      };
    }
    
    // 对于其他情况，我们返回一个通用对象
    return this;
  }

  async delete() {
    // delete方法需要先调用eq指定条件
    return new DeleteOperation(this.table);
  }

  order(column: string, options?: { ascending?: boolean }) {
    // 简单的排序处理，实际在API中处理
    return this;
  }
}

class UpdateOperation<T extends keyof Database['public']['Tables']> {
  private table: T;
  private values: Partial<Database['public']['Tables'][T]['Update']>;

  constructor(table: T, values: Partial<Database['public']['Tables'][T]['Update']>) {
    this.table = table;
    this.values = values;
  }

  eq(column: string, value: any) {
    // 实际执行更新操作
    return {
      then: async (callback: (result: any) => any) => {
        try {
          if (this.table === 'skills' && column === 'id') {
            const data = await apiClient.updateSkill(value, this.values);
            callback({ data: [data], error: null });
          } else if (this.table === 'goals' && column === 'id') {
            const data = await apiClient.updateGoal(value, this.values);
            callback({ data: [data], error: null });
          } else if (this.table === 'profiles' && column === 'id') {
            const data = await apiClient.upsertProfile({...this.values, id: value});
            callback({ data: [data], error: null });
          }
        } catch (error) {
          console.error(`Error in update for table ${this.table}:`, error);
          callback({ data: null, error });
        }
      }
    };
  }
}

class DeleteOperation {
  private table: string;

  constructor(table: string) {
    this.table = table;
  }

  eq(column: string, value: any) {
    // 实际执行删除操作
    return {
      then: async (callback: (result: any) => any) => {
        try {
          if (this.table === 'skills' && column === 'id') {
            await apiClient.deleteSkill(value);
            callback({ error: null });
          } else if (this.table === 'goals' && column === 'id') {
            await apiClient.deleteGoal(value);
            callback({ error: null });
          } else if (this.table === 'achievements' && column === 'id') {
            await apiClient.deleteAchievement(value);
            callback({ error: null });
          }
        } catch (error) {
          console.error(`Error in delete for table ${this.table}:`, error);
          callback({ error });
        }
      }
    };
  }
}

// 创建本地API实例，模拟Supabase客户端
export const supabase = new LocalApiAdapter();