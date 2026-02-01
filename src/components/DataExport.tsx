import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import type { GrowthData } from "@/types";
import { formatDate } from "@/lib/utils";

interface DataExportProps {
  data: GrowthData;
  onClose: () => void;
}

export const DataExport: React.FC<DataExportProps> = ({ data, onClose }) => {
  const [exporting, setExporting] = useState(false);

  const exportJSON = () => {
    setExporting(true);
    try {
      const exportData = {
        ...data,
        exportedAt: new Date().toISOString(),
        version: "1.0",
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `growth-tracker-backup-${formatDate(new Date())}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const exportMarkdown = () => {
    setExporting(true);
    try {
      const md = generateMarkdown(data);
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `growth-tracker-report-${formatDate(new Date())}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const generateMarkdown = (data: GrowthData): string => {
    const lines: string[] = [];
    
    lines.push(`# ${data.profile.name} - 成长记录`);
    lines.push("");
    lines.push(`> ${data.profile.bio || "记录每一步成长"}`);
    lines.push("");
    lines.push(`导出时间: ${formatDate(new Date())}`);
    lines.push("");

    // 统计概览
    const completedGoals = data.goals.filter((g) => g.completed).length;
    const avgLevel = data.skills.length > 0
      ? Math.round(data.skills.reduce((acc, s) => acc + s.level, 0) / data.skills.length)
      : 0;

    lines.push("## 📊 统计概览");
    lines.push("");
    lines.push(`- 技能数量: ${data.skills.length}`);
    lines.push(`- 平均熟练度: ${avgLevel}%`);
    lines.push(`- 目标完成: ${completedGoals}/${data.goals.length}`);
    lines.push(`- 成就数量: ${data.achievements.length}`);
    lines.push("");

    // 技能列表
    if (data.skills.length > 0) {
      lines.push("## 📚 技能列表");
      lines.push("");
      const sortedSkills = [...data.skills].sort((a, b) => b.level - a.level);
      sortedSkills.forEach((skill) => {
        const bar = "█".repeat(Math.floor(skill.level / 10)) + "░".repeat(10 - Math.floor(skill.level / 10));
        lines.push(`- **${skill.name}** [${skill.category}] ${bar} ${skill.level}%`);
      });
      lines.push("");
    }

    // 目标列表
    if (data.goals.length > 0) {
      lines.push("## 🎯 目标列表");
      lines.push("");
      
      const activeGoals = data.goals.filter((g) => !g.completed);
      const completedGoalsList = data.goals.filter((g) => g.completed);

      if (activeGoals.length > 0) {
        lines.push("### 进行中");
        activeGoals.forEach((goal) => {
          lines.push(`- [ ] **${goal.title}** - 截止: ${formatDate(goal.deadline)}`);
          if (goal.description) lines.push(`  - ${goal.description}`);
        });
        lines.push("");
      }

      if (completedGoalsList.length > 0) {
        lines.push("### 已完成");
        completedGoalsList.forEach((goal) => {
          lines.push(`- [x] **${goal.title}** - 完成于: ${formatDate(goal.completedAt || goal.deadline)}`);
        });
        lines.push("");
      }
    }

    // 成就列表
    if (data.achievements.length > 0) {
      lines.push("## 🏆 成就记录");
      lines.push("");
      const sortedAchievements = [...data.achievements].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      sortedAchievements.forEach((achievement) => {
        lines.push(`- ${achievement.icon || "🏆"} **${achievement.title}** - ${formatDate(achievement.date)}`);
        if (achievement.description) lines.push(`  - ${achievement.description}`);
      });
      lines.push("");
    }

    lines.push("---");
    lines.push("*由成长追踪器生成*");

    return lines.join("\n");
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        // 这里可以添加导入逻辑
        alert("导入功能即将上线！目前仅支持导出。");
      } catch (err) {
        alert("文件格式错误，请选择有效的 JSON 文件");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>数据导出与备份</DialogTitle>
      </DialogHeader>
      <DialogContent className="space-y-4">
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{data.skills.length}</div>
                <div className="text-xs text-muted-foreground">技能</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{data.goals.length}</div>
                <div className="text-xs text-muted-foreground">目标</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">{data.achievements.length}</div>
                <div className="text-xs text-muted-foreground">成就</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">
                  {data.goals.filter((g) => g.completed).length}
                </div>
                <div className="text-xs text-muted-foreground">已完成</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            variant="gradient"
            className="w-full justify-start gap-3"
            onClick={exportJSON}
            disabled={exporting}
          >
            <span className="text-lg">📦</span>
            <div className="text-left">
              <div className="font-medium">导出 JSON</div>
              <div className="text-xs opacity-80">完整数据备份，可用于恢复</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={exportMarkdown}
            disabled={exporting}
          >
            <span className="text-lg">📄</span>
            <div className="text-left">
              <div className="font-medium">导出 Markdown</div>
              <div className="text-xs opacity-80">生成可读性报告</div>
            </div>
          </Button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importJSON}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button
              variant="secondary"
              className="w-full justify-start gap-3"
            >
              <span className="text-lg">📥</span>
              <div className="text-left">
                <div className="font-medium">导入数据</div>
                <div className="text-xs opacity-80">从 JSON 文件恢复（即将上线）</div>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          关闭
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
