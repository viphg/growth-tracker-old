import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Goal } from "@/types";
import { getDaysUntil, formatDate } from "@/lib/utils";

interface GoalRemindersProps {
  goals: Goal[];
}

export const GoalReminders: React.FC<GoalRemindersProps> = ({ goals }) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // 获取即将到期的目标（7天内）
  const urgentGoals = goals
    .filter((g) => !g.completed && !dismissed.has(g.id))
    .map((g) => ({ ...g, daysLeft: getDaysUntil(g.deadline) }))
    .filter((g) => g.daysLeft <= 7 && g.daysLeft >= -3) // 包括已过期3天内的
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // 请求通知权限
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // 发送浏览器通知
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      const todayGoals = urgentGoals.filter((g) => g.daysLeft === 0);
      todayGoals.forEach((goal) => {
        const notificationKey = `notified-${goal.id}-${new Date().toDateString()}`;
        if (!sessionStorage.getItem(notificationKey)) {
          new Notification("目标提醒 🎯", {
            body: `"${goal.title}" 今天到期！`,
            icon: "/vite.svg",
            tag: goal.id,
          });
          sessionStorage.setItem(notificationKey, "true");
        }
      });
    }
  }, [urgentGoals]);

  const dismissGoal = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  if (urgentGoals.length === 0) return null;

  const getStatusColor = (daysLeft: number) => {
    if (daysLeft < 0) return "destructive";
    if (daysLeft === 0) return "warning";
    if (daysLeft <= 3) return "warning";
    return "secondary";
  };

  const getStatusText = (daysLeft: number) => {
    if (daysLeft < 0) return `已过期 ${Math.abs(daysLeft)} 天`;
    if (daysLeft === 0) return "今天到期";
    if (daysLeft === 1) return "明天到期";
    return `${daysLeft} 天后到期`;
  };

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-lg">🔔</span>
        <h3 className="font-semibold">目标提醒</h3>
        <Badge variant="warning">{urgentGoals.length}</Badge>
      </div>
      
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {urgentGoals.map((goal) => (
          <Card
            key={goal.id}
            className={`p-3 border-l-4 ${
              goal.daysLeft < 0
                ? "border-l-destructive bg-destructive/5"
                : goal.daysLeft <= 1
                ? "border-l-warning bg-warning/5"
                : "border-l-primary bg-primary/5"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{goal.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getStatusColor(goal.daysLeft)}>
                    {getStatusText(goal.daysLeft)}
                  </Badge>
                </div>
              </div>
              <button
                onClick={() => dismissGoal(goal.id)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
