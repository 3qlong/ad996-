
import * as z from "zod";

export const userFormSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3, "用户名至少需要3个字符。"),
  role: z.enum(["超级管理员", "子账号"], {
    required_error: "必须选择一个角色。",
  }),
  password: z.string().min(6, "密码至少需要6个字符。").optional().or(z.literal('')),
}).refine(data => {
    // If it's a new user (no id), password is required.
    if (!data.id) {
        return !!data.password && data.password.length >= 6;
    }
    return true;
}, {
    message: "新用户必须设置密码。",
    path: ["password"],
});

export type UserFormValues = z.infer<typeof userFormSchema>;
