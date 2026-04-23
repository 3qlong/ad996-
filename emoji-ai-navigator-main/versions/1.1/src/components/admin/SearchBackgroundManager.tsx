
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const SearchBackgroundManager = () => {
  const [searchBg, setSearchBg] = useState<string | null>(null);

  useEffect(() => {
    const storedBg = localStorage.getItem('searchBg');
    if (storedBg) {
      setSearchBg(storedBg);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSearchBg(base64String);
        localStorage.setItem('searchBg', base64String);
        toast.success('背景图片已更新。');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSearchBg(null);
    localStorage.removeItem('searchBg');
    toast.success('背景图片已移除。');
  };

  return (
    <div className="border rounded-lg p-6 bg-white">
      <h2 className="text-lg font-semibold mb-4">首页搜索框背景</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="search-bg-upload">上传新背景图片</Label>
          <Input id="search-bg-upload" type="file" accept="image/*" onChange={handleFileChange} className="mt-1"/>
        </div>
        {searchBg && (
          <div>
            <p className="text-sm font-medium mb-2">当前背景:</p>
            <div className="relative w-full max-w-md h-48 border rounded-lg overflow-hidden">
              <img src={searchBg} alt="搜索框背景预览" className="w-full h-full object-cover" />
            </div>
            <Button variant="destructive" size="sm" onClick={handleRemoveImage} className="mt-2">
              移除图片
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
