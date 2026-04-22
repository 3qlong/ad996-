
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileSearch, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toolSchema, ToolFormValues } from "@/lib/validations/tool";
import { Form } from "@/components/ui/form";
import { LogoUpload } from "@/components/form/LogoUpload";
import { AdminToolFields } from "@/components/form/AdminToolFields";
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Submission {
  id: number;
  siteName: string;
  introduction: string;
  category: string;
  tags: string;
  logo: string;
  usageTips?: string;
  awards?: string;
}

const initialSubmissions: Submission[] = [
  { id: 1, siteName: 'AI 灵感画板', introduction: '一个激发创意的 AI 绘画工具。', category: 'AI 图像', tags: '绘画, 创意, AI', logo: '/placeholder.svg', usageTips: '尝试不同的关键词组合，可以获得意想不到的效果。', awards: '2025年度最佳创意工具奖' },
  { id: 2, siteName: '智能写作助手', introduction: '帮助你快速完成各种文案写作。', category: 'AI 写作', tags: '写作, 效率', logo: '/placeholder.svg', usageTips: '输入核心观点，助手会自动扩展成文。' },
  { id: 3, siteName: '视频一键生成', introduction: '输入文本，即可生成高质量短视频。', category: 'AI 视频', tags: '视频, 自动化', logo: '/placeholder.svg', awards: '' },
];


const AdminSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isRejectAlertOpen, setIsRejectAlertOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);

  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolSchema),
  });

  useEffect(() => {
    if (isReviewOpen && currentSubmission) {
      form.reset({
        siteName: currentSubmission.siteName,
        introduction: currentSubmission.introduction,
        category: currentSubmission.category,
        tags: currentSubmission.tags,
        logo: currentSubmission.logo,
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
  }, [isReviewOpen, currentSubmission, form]);

  const handleReviewClick = (submission: Submission) => {
    setCurrentSubmission(submission);
    setIsReviewOpen(true);
  };
  
  const handleRejectClick = () => {
    setIsRejectAlertOpen(true);
  };

  const confirmReject = () => {
    if (currentSubmission) {
      setSubmissions(submissions.filter(s => s.id !== currentSubmission.id));
      toast.success(`网站 “${currentSubmission.siteName}” 已被拒绝。`);
      setCurrentSubmission(null);
    }
    setIsRejectAlertOpen(false);
    setIsReviewOpen(false);
  };

  const onApprove = (values: ToolFormValues) => {
    // In a real app, this would also add the approved tool to the main tools list.
    // Here we'll just show a success message and remove it from the submission list.
     if (currentSubmission) {
      setSubmissions(submissions.filter(s => s.id !== currentSubmission.id));
      toast.success(`网站 “${values.siteName}” 已通过审核并添加。`);
      setCurrentSubmission(null);
    }
    setIsReviewOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="sticky top-0 z-10 shadow-sm bg-gradient-to-b from-white to-white/80 backdrop-blur-sm">
        <Header />
      </div>
      <main className="container mx-auto py-6 md:py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin">后台管理</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>网站收录审核</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold">网站收录审核</h1>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Logo</TableHead>
                  <TableHead>网站名称</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead className="max-w-[300px]">简介</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10 rounded-md">
                        <AvatarImage src={submission.logo} alt={submission.siteName} className="object-cover" />
                        <AvatarFallback className="rounded-md">{submission.siteName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{submission.siteName}</TableCell>
                    <TableCell>{submission.category}</TableCell>
                    <TableCell className="truncate max-w-[300px]">{submission.introduction}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleReviewClick(submission)} title="审核">
                        <FileSearch className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>审核网站</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onApprove)} className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-2">
              <LogoUpload existingLogoUrl={currentSubmission?.logo} />
              <AdminToolFields />
              {(currentSubmission?.usageTips || currentSubmission?.awards) && (
                <div className="space-y-4 pt-4 border-t">
                  {currentSubmission?.usageTips && (
                    <div className="space-y-2">
                      <Label>使用技巧</Label>
                      <Textarea readOnly value={currentSubmission.usageTips} rows={3} className="bg-gray-50 text-sm"/>
                    </div>
                  )}
                  {currentSubmission?.awards && (
                    <div className="space-y-2">
                      <Label>获得奖项</Label>
                      <Textarea readOnly value={currentSubmission.awards} rows={3} className="bg-gray-50 text-sm"/>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter className="pt-4 sticky bottom-0 bg-white pb-2 -mb-2">
                <Button type="button" variant="outline" onClick={() => setIsReviewOpen(false)}>取消</Button>
                <Button type="button" variant="destructive" onClick={handleRejectClick}><XCircle className="mr-2 h-4 w-4" /> 拒绝</Button>
                <Button type="submit"><CheckCircle className="mr-2 h-4 w-4" /> 审核通过</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isRejectAlertOpen} onOpenChange={setIsRejectAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要拒绝吗？</AlertDialogTitle>
            <AlertDialogDescription>此操作无法撤销。这将永久删除网站 “{currentSubmission?.siteName}” 的收录申请。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReject} className="bg-red-500 hover:bg-red-600">确定拒绝</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSubmissionsPage;

