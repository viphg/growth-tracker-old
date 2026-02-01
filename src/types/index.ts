export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number; // 0-100
  color?: string;
  createdAt: string;
  updatedAt: string;
  history?: SkillHistory[]; // 技能历史记录
}

export interface SkillHistory {
  level: number;
  date: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
  completedAt?: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  date: string;
  icon?: string;
  category: string;
}

export interface UserProfile {
  name: string;
  bio?: string;
  avatarUrl?: string;
  email?: string;
  location?: string;
  website?: string;
  isPublic: boolean;
  createdAt: string;
}

export interface GrowthData {
  profile: UserProfile;
  skills: Skill[];
  goals: Goal[];
  achievements: Achievement[];
}

// 主题类型
export type ThemeType = "default" | "ocean" | "forest" | "sunset" | "midnight";

export const THEMES: Record<ThemeType, { name: string; primary: string; accent: string }> = {
  default: { name: "默认紫", primary: "262 83% 58%", accent: "225 73% 57%" },
  ocean: { name: "海洋蓝", primary: "199 89% 48%", accent: "187 100% 42%" },
  forest: { name: "森林绿", primary: "142 76% 36%", accent: "160 84% 39%" },
  sunset: { name: "日落橙", primary: "24 95% 53%", accent: "38 92% 50%" },
  midnight: { name: "午夜黑", primary: "240 5% 34%", accent: "240 4% 46%" },
};

export const SKILL_CATEGORIES = [
  "编程",
  "语言",
  "设计",
  "音乐",
  "运动",
  "其他",
] as const;

export const ACHIEVEMENT_CATEGORIES = [
  "技能突破",
  "目标达成",
  "学习里程碑",
  "个人成就",
  "其他",
] as const;

export const ACHIEVEMENT_ICONS = [
  "🏆",
  "⭐",
  "🎯",
  "🚀",
  "💡",
  "🎨",
  "💪",
  "📚",
  "🔥",
  "✨",
] as const;
