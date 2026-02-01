import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatsCardProps {
  stats: {
    totalSkills: number;
    avgSkillLevel: number;
    completedGoals: number;
    totalGoals: number;
    totalAchievements: number;
    goalCompletionRate: number;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const statItems = [
    {
      label: "技能数量",
      value: stats.totalSkills,
      icon: "📚",
      color: "text-primary",
    },
    {
      label: "平均熟练度",
      value: `${stats.avgSkillLevel}%`,
      icon: "📈",
      color: "text-accent",
      showProgress: true,
      progress: stats.avgSkillLevel,
    },
    {
      label: "目标完成",
      value: `${stats.completedGoals}/${stats.totalGoals}`,
      icon: "🎯",
      color: "text-success",
      showProgress: true,
      progress: stats.goalCompletionRate,
    },
    {
      label: "成就数",
      value: stats.totalAchievements,
      icon: "🏆",
      color: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
      {statItems.map((stat) => (
        <Card key={stat.label} variant="interactive" className="p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{stat.icon}</div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
          {stat.showProgress && (
            <div className="mt-3">
              <Progress value={stat.progress || 0} size="sm" variant="gradient" />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
