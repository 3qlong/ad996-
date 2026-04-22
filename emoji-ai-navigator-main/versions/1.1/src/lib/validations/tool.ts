
import * as z from "zod";

export const toolSchema = z.object({
  siteName: z.string().min(1, { message: "网站名称不能为空。" }),
  introduction: z.string().min(1, { message: "网站介绍不能为空。" }),
  category: z.string().min(1, { message: "必须选择一个分类。" }),
  tags: z.string().optional(),
  logo: z.any().optional(),
});

export type ToolFormValues = z.infer<typeof toolSchema>;
