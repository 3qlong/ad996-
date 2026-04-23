
import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Upload } from "lucide-react";
import { toast } from "@/components/ui/sonner";

export const LogoUpload = ({ existingLogoUrl }: { existingLogoUrl?: string | null }) => {
    const [logoPreview, setLogoPreview] = useState<string | null>(existingLogoUrl || null);
    const { control, watch, resetField } = useFormContext();
    const logoFiles = watch("logo");

    useEffect(() => {
        const file = logoFiles?.[0];
        if (file instanceof File || file instanceof Blob) {
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setLogoPreview(existingLogoUrl || null);
        }
    }, [logoFiles, existingLogoUrl]);

    return (
        <FormField
            control={control}
            name="logo"
            render={({ field: { onChange, value, ...fieldProps } }) => (
                <FormItem>
                    <FormLabel>Logo (必填)</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 rounded-md">
                                <AvatarImage src={logoPreview || undefined} alt="Logo preview" className="object-cover" />
                                <AvatarFallback className="text-xs flex items-center justify-center bg-gray-100 rounded-md">
                                    <Upload className="h-6 w-6 text-gray-400" />
                                </AvatarFallback>
                            </Avatar>
                            <Input
                                {...fieldProps}
                                type="file"
                                accept="image/png, image/jpeg, image/svg+xml, image/gif"
                                className="hidden"
                                id="logo-upload"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file && file.size > 1 * 1024 * 1024) {
                                        toast.error("File is too large", { description: "Please upload an image under 1MB." });
                                        resetField("logo");
                                        e.target.value = "";
                                    } else {
                                        onChange(e.target.files);
                                    }
                                }}
                            />
                            <label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                上传图片
                            </label>
                        </div>
                    </FormControl>
                    <FormDescription>
                        请上传一个正方形图标，建议尺寸 60x60 像素或以上，大小不超过 1MB。
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
