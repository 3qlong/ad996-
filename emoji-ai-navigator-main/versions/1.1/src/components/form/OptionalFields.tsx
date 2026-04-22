
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export const OptionalFields = () => {
  const { control } = useFormContext();
  return (
    <>
      <FormField
        control={control}
        name="usageTips"
        render={({ field }) => (
          <FormItem>
            <FormLabel>使用技巧 (选填)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="分享一些使用您网站的小技巧"
                className="resize-none"
                {...field}
                rows={5}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="awards"
        render={({ field }) => (
          <FormItem>
            <FormLabel>获得奖项 (选填)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="您的网站获得过哪些奖项？"
                className="resize-none"
                {...field}
                rows={5}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
