import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { THEMES, type ThemeType } from "@/types";

interface ThemeSwitcherProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  onClose: () => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  currentTheme,
  onThemeChange,
  onClose,
}) => {
  const themes = Object.entries(THEMES) as [ThemeType, typeof THEMES[ThemeType]][];

  const applyTheme = (theme: ThemeType) => {
    const themeData = THEMES[theme];
    document.documentElement.style.setProperty("--primary", themeData.primary);
    document.documentElement.style.setProperty("--accent", themeData.accent);
    document.documentElement.style.setProperty("--ring", themeData.primary);
    
    // 更新渐变
    const primaryHsl = `hsl(${themeData.primary})`;
    const accentHsl = `hsl(${themeData.accent})`;
    document.documentElement.style.setProperty(
      "--gradient-primary",
      `linear-gradient(135deg, ${primaryHsl}, ${accentHsl})`
    );

    localStorage.setItem("growth-tracker-theme", theme);
    onThemeChange(theme);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>主题设置</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="grid grid-cols-2 gap-3">
          {themes.map(([key, theme]) => (
            <button
              key={key}
              onClick={() => applyTheme(key)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                currentTheme === key
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, hsl(${theme.primary}), hsl(${theme.accent}))`,
                  }}
                />
                <span className="font-medium">{theme.name}</span>
              </div>
              <div className="flex gap-1">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ background: `hsl(${theme.primary})` }}
                />
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ background: `hsl(${theme.accent})` }}
                />
              </div>
            </button>
          ))}
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

// 初始化主题的 hook
export function useTheme() {
  const [theme, setTheme] = React.useState<ThemeType>("default");

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("growth-tracker-theme") as ThemeType;
    if (savedTheme && THEMES[savedTheme]) {
      setTheme(savedTheme);
      // 应用保存的主题
      const themeData = THEMES[savedTheme];
      document.documentElement.style.setProperty("--primary", themeData.primary);
      document.documentElement.style.setProperty("--accent", themeData.accent);
      document.documentElement.style.setProperty("--ring", themeData.primary);
      
      const primaryHsl = `hsl(${themeData.primary})`;
      const accentHsl = `hsl(${themeData.accent})`;
      document.documentElement.style.setProperty(
        "--gradient-primary",
        `linear-gradient(135deg, ${primaryHsl}, ${accentHsl})`
      );
    }
  }, []);

  return { theme, setTheme };
}
