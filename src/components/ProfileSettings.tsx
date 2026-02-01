import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import type { UserProfile } from "@/types";
import { supabase } from "@/lib/supabase";

interface ProfileSettingsProps {
  profile: UserProfile;
  userEmail?: string;
  userId?: string;
  onUpdateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  onClose: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  profile,
  userEmail,
  userId,
  onUpdateProfile,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: profile.name,
    bio: profile.bio || "",
    location: profile.location || "",
    website: profile.website || "",
  });
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件");
      return;
    }

    // 验证文件大小 (最大 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("图片大小不能超过 2MB");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // 上传到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 获取公开 URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      
      const newAvatarUrl = `${data.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(newAvatarUrl);

      // 更新数据库中的头像 URL
      await onUpdateProfile({ avatarUrl: newAvatarUrl });
    } catch (err) {
      console.error("Avatar upload error:", err);
      setError("头像上传失败，请重试");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await onUpdateProfile({
        name: formData.name,
        bio: formData.bio || undefined,
        location: formData.location || undefined,
        website: formData.website || undefined,
      });
      onClose();
    } catch (err) {
      console.error("Profile update error:", err);
      setError("保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>个人资料设置</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-6">
          {/* 头像区域 */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="头像"
                  className="w-24 h-24 rounded-full object-cover border-4 border-border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  {getInitials(formData.name || "用户")}
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-background/80 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !userId}
            >
              {isUploading ? "上传中..." : "更换头像"}
            </Button>
            {!userId && (
              <p className="text-xs text-muted-foreground">登录后可上传头像</p>
            )}
          </div>

          {/* 账户信息 */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">账户邮箱</span>
                <Badge variant="secondary">{userEmail || "未登录"}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* 基本信息 */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                显示名称 <span className="text-destructive">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="你的名字"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                个人简介
              </label>
              <Input
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="介绍一下你自己..."
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                所在地
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="例如：北京"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                个人网站
              </label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" variant="gradient" disabled={isSaving}>
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
