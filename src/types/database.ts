export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          bio: string | null;
          avatar_url: string | null;
          email: string | null;
          location: string | null;
          website: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          bio?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          location?: string | null;
          website?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          bio?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          location?: string | null;
          website?: string | null;
          is_public?: boolean;
          updated_at?: string;
        };
      };
      skills: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          level: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: string;
          level?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          category?: string;
          level?: number;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          deadline: string;
          priority: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          deadline: string;
          priority?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          deadline?: string;
          priority?: string;
          completed?: boolean;
          completed_at?: string | null;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          date: string;
          icon: string;
          category: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          date: string;
          icon?: string;
          category: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          date?: string;
          icon?: string;
          category?: string;
        };
      };
    };
  };
}
