"use client";

import { type UseFormReturn } from "react-hook-form";
import { type ArticleFormValues } from "./form-schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface TitleStepProps {
  form: UseFormReturn<ArticleFormValues>;
}

export function TitleStep({ form }: TitleStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-semibold">Article Title</h2>
        <p className="text-muted-foreground">
          Choose a clear and engaging title for your article.
        </p>
      </div>

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter article title"
                {...field}
                className="text-lg"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Card className="mt-6 bg-muted/50 p-4">
        <h3 className="mb-2 font-medium">Tips for a great title</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Title language determines content language</strong> - The
              language you use for your title will be used for the generated
              content.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              Be specific and descriptive to attract the right audience.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              Include keywords relevant to your topic for better
              discoverability.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Keep it concise but informative (typically 5-10 words).</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
