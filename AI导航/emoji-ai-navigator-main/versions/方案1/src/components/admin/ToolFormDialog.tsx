
import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form } from "@/components/ui/form";
import { LogoUpload } from "@/components/form/LogoUpload";
import { AdminToolFields } from "@/components/form/AdminToolFields";
import { toolSchema, ToolFormValues } from "@/lib/validations/tool";
import { Tool } from '@/types/tool';

interface ToolFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: ToolFormValues) => void;
  currentTool: Tool | null;
}

export const ToolFormDialog: React.FC<ToolFormDialogProps> = ({ isOpen, onOpenChange, onSubmit, currentTool }) => {
  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      siteName: '',
      introduction: '',
      category: '',
      tags: '',
      logo: undefined,
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (currentTool) {
        form.reset({
          siteName: currentTool.name,
          introduction: currentTool.introduction,
          category: currentTool.category,
          tags: currentTool.tags.join(', '),
          logo: currentTool.logo,
        });
      } else {
        form.reset({
          siteName: '',
          introduction: '',
          category: '',
          tags: '',
          logo: undefined,
        });
      }
    }
  }, [isOpen, currentTool, form]);
  
  const handleSubmit = (values: ToolFormValues) => {
    if (!values.logo && !currentTool) {
      form.setError("logo", { type: "manual", message: "必须上传 Logo。" });
      return;
    }
    onSubmit(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{currentTool ? '编辑网站' : '新增网站'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-4">
            <LogoUpload existingLogoUrl={currentTool?.logo} />
            <AdminToolFields />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
