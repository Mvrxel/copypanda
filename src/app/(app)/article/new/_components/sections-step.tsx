"use client";

import { useState } from "react";
import { type UseFormReturn, useFieldArray } from "react-hook-form";
import { type ArticleFormValues } from "./form-schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Trash2, MoveUp, MoveDown, Sparkles } from "lucide-react";

interface SectionsStepProps {
  form: UseFormReturn<ArticleFormValues>;
}

export function SectionsStep({ form }: SectionsStepProps) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "sections",
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSections = () => {
    // Mock generation - in a real app, this would call an API
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-semibold">Article Sections</h2>
        <p className="text-muted-foreground">
          Define the sections of your article. You can add between 1 and 10
          sections.
        </p>
      </div>

      <Card className="bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> For best results, we recommend using 3-7
          sections in your article.
        </p>
      </Card>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id} className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium">Section {index + 1}</h3>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => move(index, Math.max(0, index - 1))}
                  disabled={index === 0}
                  className="h-8 w-8"
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    move(index, Math.min(fields.length - 1, index + 1))
                  }
                  disabled={index === fields.length - 1}
                  className="h-8 w-8"
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <FormField
              control={form.control}
              name={`sections.${index}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Section Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter section title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ title: "" })}
          disabled={fields.length >= 10}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Add Section
        </Button>

        <Separator />

        <Button
          type="button"
          variant="secondary"
          onClick={handleGenerateSections}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Sections"}
        </Button>
      </div>

      <FormDescription className="text-sm text-muted-foreground">
        You can manually add sections or let our AI generate them based on your
        article title.
      </FormDescription>
    </div>
  );
}
