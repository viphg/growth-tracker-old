import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Skill, Achievement } from "@/types";

interface YearReviewProps {
  review: {
    year: number;
    newSkills: number;
    goalsSet: number;
    goalsCompleted: number;
    achievements: number;
    topSkills: Skill[];
    recentAchievements: Achievement[];
  };
}

export const YearReview: React.FC<YearReviewProps> = ({ review }) => {
  const hasData = review.newSkills > 0 || review.goalsSet > 0 || review.achievements > 0;

  if (!hasData) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">📅</div>
        <p className="text-muted-foreground">暂无 {review.year} 年的数据</p>
        <p className="text-sm text-muted-foreground mt-1">开始记录你的成长吧！</p>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient">{review.year} 年度回顾</h2>
        <p className="text-muted-foreground text-sm mt-1">这一年你取得了不少成就！</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 text-center bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
          <div className="text-3xl font-bold text-primary">{review.newSkills}</div>
          <p className="text-sm text-muted-foreground mt-1">新技能</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
          <div className="text-3xl font-bold text-accent">{review.goalsSet}</div>
          <p className="text-sm text-muted-foreground mt-1">目标设定</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-success/20 to-success/5 border-success/30">
          <div className="text-3xl font-bold text-success">{review.goalsCompleted}</div>
          <p className="text-sm text-muted-foreground mt-1">目标完成</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-warning/20 to-warning/5 border-warning/30">
          <div className="text-3xl font-bold text-warning">{review.achievements}</div>
          <p className="text-sm text-muted-foreground mt-1">成就解锁</p>
        </Card>
      </div>

      {review.topSkills.length > 0 && (
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg">🌟 Top 技能</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3">
              {review.topSkills.map((skill, index) => (
                <div key={skill.id} className="flex items-center gap-3">
                  <span className="text-lg">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</span>
                  <span className="flex-1 font-medium">{skill.name}</span>
                  <Badge variant="default">{skill.level}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {review.recentAchievements.length > 0 && (
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg">🏆 年度成就</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-wrap gap-2">
              {review.recentAchievements.map((achievement) => (
                <Badge key={achievement.id} variant="success" className="py-1 px-3">
                  {achievement.icon} {achievement.title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};
