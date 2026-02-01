import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Skill } from "@/types";

interface SkillChartProps {
  skills: Skill[];
}

export const SkillChart: React.FC<SkillChartProps> = ({ skills }) => {
  if (skills.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">📈</div>
        <p className="text-muted-foreground">添加技能后可查看成长图表</p>
      </Card>
    );
  }

  // 按等级排序的技能
  const sortedSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 10);

  // 按分类分组统计
  const categoryStats = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = { count: 0, totalLevel: 0 };
    }
    acc[skill.category].count++;
    acc[skill.category].totalLevel += skill.level;
    return acc;
  }, {} as Record<string, { count: number; totalLevel: number }>);

  const categories = Object.entries(categoryStats).map(([name, stats]) => ({
    name,
    count: stats.count,
    avgLevel: Math.round(stats.totalLevel / stats.count),
  }));

  // 雷达图数据 - 显示各分类平均水平
  const radarData = categories.slice(0, 6);
  const radarSize = 200;
  const radarCenter = radarSize / 2;
  const radarRadius = 70;

  const getRadarPoint = (index: number, value: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (value / 100) * radarRadius;
    return {
      x: radarCenter + r * Math.cos(angle),
      y: radarCenter + r * Math.sin(angle),
    };
  };

  const radarPoints = radarData.map((cat, i) => getRadarPoint(i, cat.avgLevel, radarData.length));
  const radarPath = radarPoints.length > 0
    ? `M ${radarPoints.map((p) => `${p.x},${p.y}`).join(" L ")} Z`
    : "";

  // 网格线
  const gridLevels = [25, 50, 75, 100];

  return (
    <div className="space-y-6">
      {/* 技能雷达图 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">技能雷达图</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <svg width={radarSize} height={radarSize} className="flex-shrink-0">
              {/* 背景网格 */}
              {gridLevels.map((level) => {
                const points = radarData.map((_, i) => {
                  const p = getRadarPoint(i, level, radarData.length);
                  return `${p.x},${p.y}`;
                }).join(" ");
                return (
                  <polygon
                    key={level}
                    points={points}
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                    opacity={0.5}
                  />
                );
              })}
              
              {/* 轴线 */}
              {radarData.map((_, i) => {
                const p = getRadarPoint(i, 100, radarData.length);
                return (
                  <line
                    key={i}
                    x1={radarCenter}
                    y1={radarCenter}
                    x2={p.x}
                    y2={p.y}
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                    opacity={0.5}
                  />
                );
              })}

              {/* 数据区域 */}
              {radarPath && (
                <path
                  d={radarPath}
                  fill="hsl(var(--primary) / 0.3)"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                />
              )}

              {/* 数据点 */}
              {radarPoints.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="hsl(var(--primary))"
                />
              ))}

              {/* 标签 */}
              {radarData.map((cat, i) => {
                const p = getRadarPoint(i, 115, radarData.length);
                return (
                  <text
                    key={i}
                    x={p.x}
                    y={p.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-xs"
                  >
                    {cat.name}
                  </text>
                );
              })}
            </svg>

            {/* 分类统计 */}
            <div className="flex-1 space-y-3 w-full">
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-sm w-16 text-muted-foreground">{cat.name}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                      style={{ width: `${cat.avgLevel}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{cat.avgLevel}%</span>
                  <span className="text-xs text-muted-foreground w-8">({cat.count})</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 技能排行榜 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">技能排行榜</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedSkills.map((skill, index) => (
              <div key={skill.id} className="flex items-center gap-3">
                <span className="text-lg w-8">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-sm text-primary font-semibold">{skill.level}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 技能分布饼图 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">技能分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((cat, index) => {
              const colors = [
                "bg-primary",
                "bg-accent",
                "bg-success",
                "bg-warning",
                "bg-destructive",
                "bg-muted-foreground",
              ];
              const percentage = Math.round((cat.count / skills.length) * 100);
              return (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                  <span className="text-sm">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">({percentage}%)</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
