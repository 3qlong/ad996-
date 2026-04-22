
import * as z from "zod";

export const websiteSubmissionSchema = z.object({
  logo: z.instanceof(FileList).refine(files => files?.length === 1, "Logo is required."),
  siteName: z.string().min(1, { message: "Site name is required." }),
  introduction: z.string().min(1, { message: "Website introduction is required." }),
  category: z.string().min(1, { message: "必须选择一个分类。" }),
  tags: z.string().optional(),
  usageTips: z.string().optional(),
  awards: z.string().optional(),
});

export type WebsiteSubmissionValues = z.infer<typeof websiteSubmissionSchema>;
