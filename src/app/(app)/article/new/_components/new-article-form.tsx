"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ArticleFormValues,
  articleFormSchema,
  defaultArticleFormValues,
} from "./form-schema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TitleStep } from "./title-step";
import { SectionsStep } from "./sections-step";
import { SettingsStep } from "./settings-step";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const steps = [
  { id: "title", label: "Title" },
  { id: "sections", label: "Sections" },
  { id: "settings", label: "Settings" },
];

export function NewArticleForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: defaultArticleFormValues,
    mode: "onChange",
  });

  const { formState } = form;

  // Create article mutation
  const generateArticleMutation = api.article.genereteArticle.useMutation({
    onSuccess: () => {
      toast.success("Article generation request processed");
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(`Failed to generate article: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const goToNextStep = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent the default form submission
    e.preventDefault();

    const fields = ["title", "sections"];
    const currentFields = fields[currentStep];

    const isValid = await form.trigger(
      currentFields as keyof ArticleFormValues,
    );
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: ArticleFormValues) => {
    setIsSubmitting(true);

    // Check that we have the minimum required values
    if (!data.title) {
      toast.error("Article title is required");
      setIsSubmitting(false);
      return;
    }

    if (!data.sections || data.sections.length === 0) {
      toast.error("At least one section is required");
      setIsSubmitting(false);
      return;
    }

    // Validate title length to prevent database error
    if (data.title.length > 190) {
      toast.error("Title is too long (maximum 190 characters)");
      setIsSubmitting(false);
      return;
    }

    // Validate section title lengths
    const longSectionTitle = data.sections.find(
      (section) => section.title.length > 190,
    );
    if (longSectionTitle) {
      toast.error(
        `Section title "${longSectionTitle.title.substring(0, 30)}..." is too long (maximum 190 characters)`,
      );
      setIsSubmitting(false);
      return;
    }

    // try {
    //   // Call the API to generate the article
    //   const articleResponse = await generateArticleMutation.mutateAsync({
    //     title: data.title,
    //     context: data.context,
    //     sections: data.sections,
    //     presetId: data.presetId,
    //   });

    //   if (articleResponse) {
    //     if (articleResponse.articleId) {
    //       router.push(`/article/${articleResponse.articleId}`);
    //     }
    //   }
    // } catch (error) {
    //   console.error("Article generation failed:", error);
    //   // Error is handled by the mutation's onError callback
    //   setIsSubmitting(false);
    // }

    // Log the data for debugging
    console.log("Form submitted:", data);
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${
                  index === currentStep
                    ? "bg-primary text-primary-foreground"
                    : index < currentStep
                      ? "bg-primary/80 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`text-sm ${index === currentStep ? "font-medium" : "text-muted-foreground"}`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute inset-0 flex items-center">
            <div className="h-1 w-full bg-muted"></div>
          </div>
          <div
            className="absolute inset-0 flex items-center"
            style={{
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
              transition: "width 0.3s ease-in-out",
            }}
          >
            <div className="h-1 w-full bg-primary"></div>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 0 && <TitleStep form={form} />}
            {currentStep === 1 && <SectionsStep form={form} />}
            {currentStep === 2 && <SettingsStep form={form} />}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={goToNextStep}>
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={
                    !formState.isValid ||
                    isSubmitting ||
                    generateArticleMutation.isPending
                  }
                >
                  {isSubmitting || generateArticleMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Create Article"
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
