import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { GrowthData, Skill, Goal, Achievement, UserProfile } from "@/types";

const STORAGE_KEY = "growth-tracker-data";

const defaultData: GrowthData = {
  profile: {
    name: "我的成长之路",
    bio: "记录每一步成长",
    isPublic: false,
    createdAt: new Date().toISOString(),
  },
  skills: [],
  goals: [],
  achievements: [],
};

export function useGrowthData(userId?: string | null) {
  const [data, setData] = useState<GrowthData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // 从 Supabase 加载数据
  const loadFromSupabase = useCallback(async () => {
    if (!userId) return;

    try {
      setIsSyncing(true);

      // 并行加载所有数据
      const [profileRes, skillsRes, goalsRes, achievementsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("skills").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("goals").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("achievements").select("*").eq("user_id", userId).order("date", { ascending: false }),
      ]);

      const newData: GrowthData = {
        profile: profileRes.data
          ? {
              name: profileRes.data.name,
              bio: profileRes.data.bio || undefined,
              avatarUrl: profileRes.data.avatar_url || undefined,
              email: profileRes.data.email || undefined,
              location: profileRes.data.location || undefined,
              website: profileRes.data.website || undefined,
              isPublic: profileRes.data.is_public,
              createdAt: profileRes.data.created_at,
            }
          : defaultData.profile,
        skills: (skillsRes.data || []).map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          level: s.level,
          createdAt: s.created_at,
          updatedAt: s.updated_at,
        })),
        goals: (goalsRes.data || []).map((g) => ({
          id: g.id,
          title: g.title,
          description: g.description || undefined,
          deadline: g.deadline,
          priority: g.priority as "low" | "medium" | "high",
          completed: g.completed,
          completedAt: g.completed_at || undefined,
          createdAt: g.created_at,
        })),
        achievements: (achievementsRes.data || []).map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description || undefined,
          date: a.date,
          icon: a.icon,
          category: a.category,
        })),
      };

      setData(newData);
      // 同时保存到本地作为缓存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error("Failed to load from Supabase:", error);
      // 回退到本地存储
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setData(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse stored data:", e);
        }
      }
    } finally {
      setIsSyncing(false);
    }
  }, [userId]);

  // 初始化：加载数据
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);

      if (userId) {
        // 已登录：从 Supabase 加载
        await loadFromSupabase();
      } else {
        // 未登录：从本地存储加载
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            setData(JSON.parse(stored));
          } catch (e) {
            console.error("Failed to parse stored data:", e);
          }
        }
      }

      setIsLoading(false);
    };

    initData();
  }, [userId, loadFromSupabase]);

  // 保存到本地（用于未登录状态）
  const saveLocal = (newData: GrowthData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  // Profile
  const updateProfile = async (profile: Partial<UserProfile>) => {
    const newProfile = { ...data.profile, ...profile };
    saveLocal({ ...data, profile: newProfile });

    if (userId) {
      await supabase.from("profiles").upsert({
        id: userId,
        name: newProfile.name,
        bio: newProfile.bio || null,
        avatar_url: newProfile.avatarUrl || null,
        location: newProfile.location || null,
        website: newProfile.website || null,
        is_public: newProfile.isPublic,
        updated_at: new Date().toISOString(),
      });
    }
  };

  // Skills
  const addSkill = async (skill: Omit<Skill, "id" | "createdAt" | "updatedAt">) => {
    const newSkill: Skill = {
      ...skill,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveLocal({ ...data, skills: [newSkill, ...data.skills] });

    if (userId) {
      await supabase.from("skills").insert({
        id: newSkill.id,
        user_id: userId,
        name: newSkill.name,
        category: newSkill.category,
        level: newSkill.level,
        created_at: newSkill.createdAt,
        updated_at: newSkill.updatedAt,
      });
    }
  };

  const updateSkill = async (id: string, updates: Partial<Skill>) => {
    const skills = data.skills.map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    saveLocal({ ...data, skills });

    if (userId) {
      await supabase
        .from("skills")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    }
  };

  const deleteSkill = async (id: string) => {
    saveLocal({ ...data, skills: data.skills.filter((s) => s.id !== id) });

    if (userId) {
      await supabase.from("skills").delete().eq("id", id);
    }
  };

  // Goals
  const addGoal = async (goal: Omit<Goal, "id" | "createdAt" | "completed">) => {
    const newGoal: Goal = {
      ...goal,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    saveLocal({ ...data, goals: [newGoal, ...data.goals] });

    if (userId) {
      await supabase.from("goals").insert({
        id: newGoal.id,
        user_id: userId,
        title: newGoal.title,
        description: newGoal.description || null,
        deadline: newGoal.deadline,
        priority: newGoal.priority,
        completed: false,
        created_at: newGoal.createdAt,
      });
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const goals = data.goals.map((g) => (g.id === id ? { ...g, ...updates } : g));
    saveLocal({ ...data, goals });

    if (userId) {
      await supabase.from("goals").update(updates).eq("id", id);
    }
  };

  const toggleGoalComplete = async (id: string) => {
    const goal = data.goals.find((g) => g.id === id);
    if (!goal) return;

    const completed = !goal.completed;
    const completedAt = completed ? new Date().toISOString() : undefined;

    const goals = data.goals.map((g) =>
      g.id === id ? { ...g, completed, completedAt } : g
    );
    saveLocal({ ...data, goals });

    if (userId) {
      await supabase.from("goals").update({
        completed,
        completed_at: completedAt || null,
      }).eq("id", id);
    }
  };

  const deleteGoal = async (id: string) => {
    saveLocal({ ...data, goals: data.goals.filter((g) => g.id !== id) });

    if (userId) {
      await supabase.from("goals").delete().eq("id", id);
    }
  };

  // Achievements
  const addAchievement = async (achievement: Omit<Achievement, "id">) => {
    const newAchievement: Achievement = {
      ...achievement,
      id: crypto.randomUUID(),
    };
    saveLocal({ ...data, achievements: [newAchievement, ...data.achievements] });

    if (userId) {
      await supabase.from("achievements").insert({
        id: newAchievement.id,
        user_id: userId,
        title: newAchievement.title,
        description: newAchievement.description || null,
        date: newAchievement.date,
        icon: newAchievement.icon || "🏆",
        category: newAchievement.category,
      });
    }
  };

  const deleteAchievement = async (id: string) => {
    saveLocal({ ...data, achievements: data.achievements.filter((a) => a.id !== id) });

    if (userId) {
      await supabase.from("achievements").delete().eq("id", id);
    }
  };

  // 迁移本地数据到云端
  const migrateLocalData = async () => {
    if (!userId) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const localData: GrowthData = JSON.parse(stored);

      // 检查云端是否有数据
      const { data: existingSkills } = await supabase
        .from("skills")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      // 如果云端没有数据，则迁移本地数据
      if (!existingSkills || existingSkills.length === 0) {
        // 创建/更新 profile
        await supabase.from("profiles").upsert({
          id: userId,
          name: localData.profile.name,
          bio: localData.profile.bio || null,
          is_public: localData.profile.isPublic,
          created_at: localData.profile.createdAt,
          updated_at: new Date().toISOString(),
        });

        // 迁移技能
        if (localData.skills.length > 0) {
          await supabase.from("skills").insert(
            localData.skills.map((s) => ({
              id: s.id,
              user_id: userId,
              name: s.name,
              category: s.category,
              level: s.level,
              created_at: s.createdAt,
              updated_at: s.updatedAt,
            }))
          );
        }

        // 迁移目标
        if (localData.goals.length > 0) {
          await supabase.from("goals").insert(
            localData.goals.map((g) => ({
              id: g.id,
              user_id: userId,
              title: g.title,
              description: g.description || null,
              deadline: g.deadline,
              priority: g.priority,
              completed: g.completed,
              completed_at: g.completedAt || null,
              created_at: g.createdAt,
            }))
          );
        }

        // 迁移成就
        if (localData.achievements.length > 0) {
          await supabase.from("achievements").insert(
            localData.achievements.map((a) => ({
              id: a.id,
              user_id: userId,
              title: a.title,
              description: a.description || null,
              date: a.date,
              icon: a.icon || "🏆",
              category: a.category,
            }))
          );
        }
      }

      // 重新加载数据
      await loadFromSupabase();
    } catch (error) {
      console.error("Failed to migrate local data:", error);
    }
  };

  // Stats
  const getStats = () => {
    const totalSkills = data.skills.length;
    const avgSkillLevel =
      totalSkills > 0
        ? Math.round(data.skills.reduce((acc, s) => acc + s.level, 0) / totalSkills)
        : 0;
    const completedGoals = data.goals.filter((g) => g.completed).length;
    const totalGoals = data.goals.length;
    const totalAchievements = data.achievements.length;

    return {
      totalSkills,
      avgSkillLevel,
      completedGoals,
      totalGoals,
      totalAchievements,
      goalCompletionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
    };
  };

  // Year Review
  const getYearReview = (year: number = new Date().getFullYear()) => {
    const startOfYear = new Date(year, 0, 1).toISOString();
    const endOfYear = new Date(year, 11, 31, 23, 59, 59).toISOString();

    const yearSkills = data.skills.filter(
      (s) => s.createdAt >= startOfYear && s.createdAt <= endOfYear
    );
    const yearGoals = data.goals.filter(
      (g) => g.createdAt >= startOfYear && g.createdAt <= endOfYear
    );
    const yearAchievements = data.achievements.filter(
      (a) => a.date >= startOfYear && a.date <= endOfYear
    );
    const completedYearGoals = yearGoals.filter((g) => g.completed);

    return {
      year,
      newSkills: yearSkills.length,
      goalsSet: yearGoals.length,
      goalsCompleted: completedYearGoals.length,
      achievements: yearAchievements.length,
      topSkills: [...data.skills].sort((a, b) => b.level - a.level).slice(0, 3),
      recentAchievements: yearAchievements.slice(-5),
    };
  };

  return {
    data,
    isLoading,
    isSyncing,
    updateProfile,
    addSkill,
    updateSkill,
    deleteSkill,
    addGoal,
    updateGoal,
    toggleGoalComplete,
    deleteGoal,
    addAchievement,
    deleteAchievement,
    getStats,
    getYearReview,
    migrateLocalData,
    refresh: loadFromSupabase,
  };
}
