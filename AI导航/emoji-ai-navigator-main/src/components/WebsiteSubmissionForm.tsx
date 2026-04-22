import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/sonner";
import { websiteSubmissionSchema, WebsiteSubmissionValues } from "@/lib/validations/websiteSubmission";
import { LogoUpload } from "./form/LogoUpload";
import { SiteInfoFields } from "./form/SiteInfoFields";
import { OptionalFields } from "./form/OptionalFields";

const WebsiteSubmissionForm = () => {
  const form = useForm<WebsiteSubmissionValues>({
    resolver: zodResolver(websiteSubmissionSchema),
    defaultValues: {
      siteName: "",
      introduction: "",
      category: "",
      tags: "",
      usageTips: "",
      awards: "",
      logo: undefined,
    },
  });

  function onSubmit(values: WebsiteSubmissionValues) {
    console.log({
        ...values,
        logo: values.logo[0]
    });
    toast.success("Success!", {
      description: "Your website has been submitted for review.",
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <LogoUpload />
        <SiteInfoFields />
        <OptionalFields />
        <div className="flex justify-end pt-4">
          <Button type="submit" variant="outline" size="lg">提交审核</Button>
        </div>
      </form>
    </Form>
  );
};

export default WebsiteSubmissionForm;
