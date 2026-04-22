
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { allTools } from '@/data/tools';

// Extract unique categories from real data
const categories = [...new Set(allTools.map(t => t.category))].sort().map((name, i) => ({ id: i + 1, name }));

export const AdminToolFields = () => {
  const { control } = useFormContext();
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="siteName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>网站名称 (必填)</FormLabel>
            <FormControl>
              <Input placeholder="例如：ChatGPT" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="introduction"
        render={({ field }) => (
          <FormItem>
            <FormLabel>网站介绍 (必填)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="用一句话简单介绍一下您的网站"
                className="resize-none"
                {...field}
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>网站URL</FormLabel>
            <FormControl>
              <Input placeholder="https://..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>分类 (必填)</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="选择一个分类" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>标签 (选填, 逗号分隔)</FormLabel>
            <FormControl>
              <Input placeholder="例如: 设计, 效率, 灵感" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="usageTips"
        render={({ field }) => (
          <FormItem>
            <FormLabel>使用技巧 (选填)</FormLabel>
            <FormControl>
              <Textarea placeholder="使用技巧和建议" className="resize-none" {...field} rows={3} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="productIntro"
        render={({ field }) => (
          <FormItem>
            <FormLabel>产品介绍 (选填)</FormLabel>
            <FormControl>
              <Textarea placeholder="详细的产品介绍" className="resize-none" {...field} rows={3} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
