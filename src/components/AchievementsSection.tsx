import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import type { Achievement } from "@/types";
import { ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_ICONS } from "@/types";
import { formatDate } from "@/lib/utils";

interface AchievementsSectionProps {
  achievements: Achievement[];
  onAddAchievement: (achievement: Omit<Achievement, "id">) => void;
  onDeleteAchievement: (id: string) => void;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  achievements,
  onAddAchievement,
  onDeleteAchievement,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    icon: ACHIEVEMENT_ICONS[0],
    category: ACHIEVEMENT_CATEGORIES[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAchievement.title.trim()) {
      onAddAchievement(newAchievement);
      setNewAchievement({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        icon: ACHIEVEMENT_ICONS[0],
        category: ACHIEVEMENT_CATEGORIES[0],
      });
      setIsDialogOpen(false);
    }
  };

  const sortedAchievements = [...achievements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">成就记录</h2>
          <p className="text-muted-foreground text-sm mt-1">记录你的里程碑时刻</p>
        </div>
        <Button variant="gradient" onClick={() => setIsDialogOpen(true)}>
          <span className="mr-1">+</span> 新成就
        </Button>
      </div>

      {achievements.length === 0 ? (
        <Card variant="interactive" className="p-8 text-center">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-muted-foreground">还没有记录任何成就</p>
          <p className="text-sm text-muted-foreground mt-1">记录你的第一个里程碑</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {sortedAchievements.map((achievement) => (
            <Card key={achievement.id} variant="interactive" className="p-4 group">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{achievement.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{achievement.title}</span>
                    <button
                      onClick={() => onDeleteAchievement(achievement.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                  {achievement.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {achievement.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="success">{achievement.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(achievement.date)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogHeader>
          <DialogTitle>记录新成就</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">成就标题</label>
              <Input
                placeholder="例如：完成第一个开源项目"
                value={newAchievement.title}
                onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">描述（可选）</label>
              <Input
                placeholder="记录更多细节..."
                value={newAchievement.description}
                onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">日期</label>
                <Input
                  type="date"
                  value={newAchievement.date}
                  onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">分类</label>
                <Select
                  options={ACHIEVEMENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
                  value={newAchievement.category}
                  onChange={(e) => setNewAchievement({ ...newAchievement, category: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">图标</label>
              <div className="flex gap-2 flex-wrap">
                {ACHIEVEMENT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewAchievement({ ...newAchievement, icon })}
                    className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                      newAchievement.icon === icon
                        ? "bg-primary/20 ring-2 ring-primary"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {icon}
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
              保存
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </section>
  );
};
