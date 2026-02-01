import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import type { Goal } from "@/types";
import { formatDate, getDaysUntil } from "@/lib/utils";

interface GoalsSectionProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, "id" | "createdAt" | "completed">) => void;
  onToggleComplete: (id: string) => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({
  goals,
  onAddGoal,
  onToggleComplete,
  onDeleteGoal,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "medium" as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.title.trim() && newGoal.deadline) {
      onAddGoal(newGoal);
      setNewGoal({ title: "", description: "", deadline: "", priority: "medium" });
      setIsDialogOpen(false);
    }
  };

  const activeGoals = goals.filter((g) => !g.completed).sort((a, b) => 
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );
  const completedGoals = goals.filter((g) => g.completed);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "high":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    const days = getDaysUntil(deadline);
    if (days < 0) return { text: "已过期", variant: "destructive" as const };
    if (days === 0) return { text: "今天截止", variant: "warning" as const };
    if (days <= 7) return { text: `${days}天后`, variant: "warning" as const };
    return { text: formatDate(deadline), variant: "secondary" as const };
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">目标管理</h2>
          <p className="text-muted-foreground text-sm mt-1">设定目标，追踪进度</p>
        </div>
        <Button variant="gradient" onClick={() => setIsDialogOpen(true)}>
          <span className="mr-1">+</span> 新目标
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card variant="interactive" className="p-8 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-muted-foreground">还没有设定任何目标</p>
          <p className="text-sm text-muted-foreground mt-1">设定一个目标开始你的成长之旅</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeGoals.length > 0 && (
            <div className="space-y-3 stagger-children">
              <h3 className="text-sm font-medium text-muted-foreground">进行中 ({activeGoals.length})</h3>
              {activeGoals.map((goal) => {
                const status = getDeadlineStatus(goal.deadline);
                return (
                  <Card key={goal.id} variant="interactive" className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onToggleComplete(goal.id)}
                        className="mt-1 w-5 h-5 rounded-full border-2 border-primary/50 hover:border-primary hover:bg-primary/20 transition-all flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{goal.title}</span>
                          <Badge variant={getPriorityStyle(goal.priority)}>
                            {goal.priority === "high" ? "高优先" : goal.priority === "low" ? "低优先" : "中等"}
                          </Badge>
                        </div>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                        )}
                        <div className="mt-2">
                          <Badge variant={status.variant}>{status.text}</Badge>
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {completedGoals.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">已完成 ({completedGoals.length})</h3>
              {completedGoals.slice(0, 5).map((goal) => (
                <Card key={goal.id} className="p-4 opacity-60">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleComplete(goal.id)}
                      className="w-5 h-5 rounded-full bg-success flex items-center justify-center flex-shrink-0"
                    >
                      <span className="text-success-foreground text-xs">✓</span>
                    </button>
                    <span className="line-through text-muted-foreground">{goal.title}</span>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogHeader>
          <DialogTitle>设定新目标</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">目标标题</label>
              <Input
                placeholder="例如：完成 React 进阶课程"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">描述（可选）</label>
              <Input
                placeholder="添加更多细节..."
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">截止日期</label>
              <Input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">优先级</label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewGoal({ ...newGoal, priority: p })}
                    className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                      newGoal.priority === p
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {p === "high" ? "高" : p === "low" ? "低" : "中"}
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button type="submit" variant="gradient">
              创建
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </section>
  );
};
