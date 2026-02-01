import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import type { Skill } from "@/types";
import { SKILL_CATEGORIES } from "@/types";

interface SkillsSectionProps {
  skills: Skill[];
  onAddSkill: (skill: Omit<Skill, "id" | "createdAt" | "updatedAt">) => void;
  onUpdateSkill: (id: string, updates: Partial<Skill>) => void;
  onDeleteSkill: (id: string) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  onAddSkill,
  onUpdateSkill,
  onDeleteSkill,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: SKILL_CATEGORIES[0],
    level: 50,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.name.trim()) {
      onAddSkill(newSkill);
      setNewSkill({ name: "", category: SKILL_CATEGORIES[0], level: 50 });
      setIsDialogOpen(false);
    }
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">技能追踪</h2>
          <p className="text-muted-foreground text-sm mt-1">记录你正在学习的技能</p>
        </div>
        <Button variant="gradient" onClick={() => setIsDialogOpen(true)}>
          <span className="mr-1">+</span> 添加技能
        </Button>
      </div>

      {skills.length === 0 ? (
        <Card variant="interactive" className="p-8 text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-muted-foreground">还没有添加任何技能</p>
          <p className="text-sm text-muted-foreground mt-1">点击上方按钮开始追踪你的技能成长</p>
        </Card>
      ) : (
        <div className="space-y-6 stagger-children">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{category}</Badge>
                <span className="text-xs text-muted-foreground">
                  {categorySkills.length} 项技能
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {categorySkills.map((skill) => (
                  <Card key={skill.id} variant="interactive" className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{skill.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-primary font-semibold">
                          {skill.level}%
                        </span>
                        <button
                          onClick={() => onDeleteSkill(skill.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <Progress value={skill.level} size="md" />
                    <div className="mt-3 flex gap-1">
                      {[25, 50, 75, 100].map((level) => (
                        <button
                          key={level}
                          onClick={() => onUpdateSkill(skill.id, { level })}
                          className={`flex-1 py-1 text-xs rounded transition-all ${
                            skill.level >= level
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {level}%
                        </button>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogHeader>
          <DialogTitle>添加新技能</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">技能名称</label>
              <Input
                placeholder="例如：React、钢琴、日语..."
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">分类</label>
              <Select
                options={SKILL_CATEGORIES.map((c) => ({ value: c, label: c }))}
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                当前熟练度: {newSkill.level}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button type="submit" variant="gradient">
              添加
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </section>
  );
};
