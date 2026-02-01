import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useGrowthData } from "@/hooks/useGrowthData";
import { AuthForm } from "@/components/AuthForm";
import { ProfileSettings } from "@/components/ProfileSettings";
import { SkillsSection } from "@/components/SkillsSection";
import { GoalsSection } from "@/components/GoalsSection";
import { AchievementsSection } from "@/components/AchievementsSection";
import { StatsCard } from "@/components/StatsCard";
import { YearReview } from "@/components/YearReview";
import { SkillChart } from "@/components/SkillChart";
import { DataExport } from "@/components/DataExport";
import { GoalReminders } from "@/components/GoalReminders";
import { ThemeSwitcher, useTheme } from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type TabType = "dashboard" | "skills" | "goals" | "achievements" | "review" | "charts";

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [showAuth, setShowAuth] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();

  const {
    data,
    isLoading,
    isSyncing,
    updateProfile,
    addSkill,
    updateSkill,
    deleteSkill,
    addGoal,
    toggleGoalComplete,
    deleteGoal,
    addAchievement,
    deleteAchievement,
    getStats,
    getYearReview,
    migrateLocalData,
  } = useGrowthData(user?.id);

  // 登录后迁移本地数据
  useEffect(() => {
    if (user?.id) {
      migrateLocalData();
      setShowAuth(false);
    }
  }, [user?.id]);

  const stats = getStats();
  const yearReview = getYearReview();

  const tabs = [
    { id: "dashboard" as const, label: "总览", icon: "📊" },
    { id: "skills" as const, label: "技能", icon: "📚" },
    { id: "goals" as const, label: "目标", icon: "🎯" },
    { id: "achievements" as const, label: "成就", icon: "🏆" },
    { id: "charts" as const, label: "图表", icon: "📈" },
    { id: "review" as const, label: "年度", icon: "📅" },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  // 显示登录页面
  if (showAuth && !user) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          className="absolute top-4 left-4 z-50"
          onClick={() => setShowAuth(false)}
        >
          ← 返回
        </Button>
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 头像/Logo - 点击打开设置 */}
              <button
                onClick={() => setShowSettings(true)}
                className="relative group"
              >
                {data.profile.avatarUrl ? (
                  <img
                    src={data.profile.avatarUrl}
                    alt="头像"
                    className="w-10 h-10 rounded-xl object-cover border-2 border-border group-hover:border-primary transition-colors"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground group-hover:scale-105 transition-transform">
                    {getInitials(data.profile.name || "用户")}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-card border border-border rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                  ⚙️
                </div>
              </button>
              <div>
                <h1 className="text-xl font-bold">{data.profile.name}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{data.profile.bio}</p>
                  {isSyncing && (
                    <Badge variant="secondary" className="text-xs py-0">
                      同步中...
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 工具按钮 */}
              <Button variant="ghost" size="sm" onClick={() => setShowTheme(true)} title="主题">
                🎨
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowExport(true)} title="导出">
                📤
              </Button>
              
              {user ? (
                <>
                  <Badge variant="success" className="hidden sm:flex">
                    ☁️ 已同步
                  </Badge>
                  <Button
                    variant={data.profile.isPublic ? "success" : "outline"}
                    size="sm"
                    onClick={() => updateProfile({ isPublic: !data.profile.isPublic })}
                  >
                    {data.profile.isPublic ? "🌐 公开" : "🔒 私密"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    退出
                  </Button>
                </>
              ) : (
                <>
                  <Badge variant="secondary" className="hidden sm:flex">
                    💾 本地
                  </Badge>
                  <Button variant="gradient" size="sm" onClick={() => setShowAuth(true)}>
                    登录
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-[73px] z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* 目标提醒 */}
        {activeTab === "dashboard" && <GoalReminders goals={data.goals} />}

        {activeTab === "dashboard" && (
          <div className="space-y-8 fade-in">
            <StatsCard stats={stats} />
            
            {/* Quick Overview */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">最近目标</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("goals")}>
                    查看全部
                  </Button>
                </div>
                {data.goals.filter(g => !g.completed).length === 0 ? (
                  <p className="text-muted-foreground text-sm">暂无进行中的目标</p>
                ) : (
                  <div className="space-y-2">
                    {data.goals.filter(g => !g.completed).slice(0, 3).map((goal) => (
                      <div key={goal.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <span className="text-sm">🎯</span>
                        <span className="text-sm flex-1 truncate">{goal.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">最新成就</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("achievements")}>
                    查看全部
                  </Button>
                </div>
                {data.achievements.length === 0 ? (
                  <p className="text-muted-foreground text-sm">暂无成就记录</p>
                ) : (
                  <div className="space-y-2">
                    {data.achievements.slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <span className="text-sm">{achievement.icon}</span>
                        <span className="text-sm flex-1 truncate">{achievement.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Top Skills */}
            {data.skills.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">技能概览</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("charts")}>
                    查看图表
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.skills.slice(0, 6).map((skill) => (
                    <div key={skill.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-xs text-primary">{skill.level}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-primary"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Sync Prompt for non-logged in users */}
            {!user && (
              <Card className="p-6 border-primary/30 bg-primary/5">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">☁️</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">开启云同步</h3>
                    <p className="text-sm text-muted-foreground">登录后可在手机和电脑间同步数据</p>
                  </div>
                  <Button variant="gradient" onClick={() => setShowAuth(true)}>
                    立即登录
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === "skills" && (
          <div className="fade-in">
            <SkillsSection
              skills={data.skills}
              onAddSkill={addSkill}
              onUpdateSkill={updateSkill}
              onDeleteSkill={deleteSkill}
            />
          </div>
        )}

        {activeTab === "goals" && (
          <div className="fade-in">
            <GoalReminders goals={data.goals} />
            <GoalsSection
              goals={data.goals}
              onAddGoal={addGoal}
              onToggleComplete={toggleGoalComplete}
              onDeleteGoal={deleteGoal}
            />
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="fade-in">
            <AchievementsSection
              achievements={data.achievements}
              onAddAchievement={addAchievement}
              onDeleteAchievement={deleteAchievement}
            />
          </div>
        )}

        {activeTab === "charts" && (
          <div className="fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gradient">技能成长图表</h2>
              <p className="text-muted-foreground text-sm mt-1">可视化你的技能成长</p>
            </div>
            <SkillChart skills={data.skills} />
          </div>
        )}

        {activeTab === "review" && (
          <div className="fade-in">
            <YearReview review={yearReview} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>🌱 成长追踪器 — {user ? "数据已同步至云端" : "数据存储在本地"}</p>
          {user && <p className="text-xs mt-1">{user.email}</p>}
        </div>
      </footer>

      {/* Modals */}
      {showSettings && (
        <ProfileSettings
          profile={data.profile}
          userEmail={user?.email}
          userId={user?.id}
          onUpdateProfile={updateProfile}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showExport && (
        <DataExport
          data={data}
          onClose={() => setShowExport(false)}
        />
      )}

      {showTheme && (
        <ThemeSwitcher
          currentTheme={theme}
          onThemeChange={setTheme}
          onClose={() => setShowTheme(false)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
