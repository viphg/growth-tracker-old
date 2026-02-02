import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

declare global {
  interface Window {
    deferredPrompt: Event | null;
  }
}

export const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // 阻止默认的迷你安装横幅
      e.preventDefault();
      // 存储事件以供稍后使用
      setDeferredPrompt(e);
      // 显示安装按钮
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 检查是否已在主屏幕
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (navigator.standalone !== undefined && navigator.standalone);
    
    if (!isStandalone) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // @ts-ignore - TypeScript doesn't recognize this property
    deferredPrompt.prompt();

    // 等待用户响应
    // @ts-ignore - TypeScript doesn't recognize this property
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('用户接受了安装');
    } else {
      console.log('用户拒绝了安装');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 p-4 border-primary/30 bg-primary/5 backdrop-blur-sm glass shadow-lg max-w-md mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-2xl">📱</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">添加到主屏幕</h4>
            <p className="text-xs text-muted-foreground truncate">
              将成长追踪器添加到主屏幕，随时记录成长
            </p>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="gradient" 
          onClick={handleInstallClick}
          className="whitespace-nowrap"
        >
          添加
        </Button>
      </div>
    </Card>
  );
};