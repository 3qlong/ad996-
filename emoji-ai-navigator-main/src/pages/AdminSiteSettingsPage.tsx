import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const LOGO_KEY = 'site.logoUrl';
const DEFAULT_LOGO = '/logo-adqqb.png';
const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

const AdminSiteSettingsPage: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string>('');
  const [manualUrl, setManualUrl] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(LOGO_KEY);
    if (stored) setLogoUrl(stored);
  }, []);

  const handlePick = () => inputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPT.split(',').includes(file.type)) {
      toast.error('仅支持 PNG / JPG / WEBP / GIF / SVG');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(`文件超过 ${MAX_BYTES / 1024 / 1024}MB 限制`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPendingPreview(String(reader.result));
      setPendingFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const next = pendingPreview || manualUrl.trim() || logoUrl;
    if (!next) return;
    localStorage.setItem(LOGO_KEY, next);
    setLogoUrl(next);
    setPendingFile(null);
    setPendingPreview('');
    setManualUrl('');
    // 通知 Header 实时刷新
    window.dispatchEvent(new Event('site-logo-changed'));
    toast.success('Logo 已保存');
  };

  const handleReset = () => {
    localStorage.removeItem(LOGO_KEY);
    setLogoUrl(DEFAULT_LOGO);
    setPendingFile(null);
    setPendingPreview('');
    setManualUrl('');
    window.dispatchEvent(new Event('site-logo-changed'));
    toast.success('已恢复默认 Logo');
  };

  const previewSrc = pendingPreview || logoUrl;
  const isGif = previewSrc.includes('.gif') || previewSrc.startsWith('data:image/gif');

  return (
    <div className="max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            主页 Logo 设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview */}
          <div className="space-y-2">
            <Label>当前 Logo 预览</Label>
            <div className="flex items-center gap-4 rounded-lg border border-dashed p-6 bg-gray-50 dark:bg-gray-900">
              <img
                src={previewSrc}
                alt="Logo 预览"
                className="h-12 w-auto object-contain"
                style={{ maxWidth: 200 }}
              />
              <div className="text-xs text-gray-500">
                <div>格式：{isGif ? 'GIF（动图）' : '静态图片'}</div>
                <div className="mt-1">建议尺寸：高度 40px，最大宽度 200px</div>
              </div>
            </div>
          </div>

          {/* Upload */}
          <div className="space-y-2">
            <Label>上传新 Logo</Label>
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="outline" onClick={handlePick}>
                <Upload className="h-4 w-4 mr-2" />
                选择文件
              </Button>
              <span className="text-xs text-gray-500">
                支持 PNG / JPG / WEBP / <strong>GIF</strong> / SVG，最大 2MB
              </span>
            </div>
            {pendingFile && (
              <div className="text-xs text-green-600 mt-2">
                已选择：{pendingFile.name}（{(pendingFile.size / 1024).toFixed(1)} KB）
              </div>
            )}
          </div>

          {/* Or URL */}
          <div className="space-y-2">
            <Label>或填写远程 URL</Label>
            <Input
              placeholder="https://example.com/logo.gif"
              value={manualUrl}
              onChange={e => setManualUrl(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              如果 CDN 上已有 GIF 动图，可直接填 URL。两种方式任选其一。
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button onClick={handleSave} disabled={!pendingFile && !manualUrl.trim()}>
              <Save className="h-4 w-4 mr-2" />
              保存 Logo
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <Trash2 className="h-4 w-4 mr-2" />
              恢复默认
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>说明</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <p>• 当前 Logo 存储于浏览器 <code>localStorage</code>，仅影响当前设备预览效果。</p>
          <p>• 上线前请将最终 Logo 替换为 <code>/public/logo-adqqb.png</code> 或部署到 CDN 后在此填入 URL。</p>
          <p>• GIF 动图会自动播放，建议控制在 200KB 以内以保证首屏性能。</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSiteSettingsPage;
