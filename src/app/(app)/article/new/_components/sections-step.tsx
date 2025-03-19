"use client";

import { useState, useEffect } from "react";
import { type UseFormReturn, useFieldArray } from "react-hook-form";
import { type ArticleFormValues } from "./form-schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlusCircle,
  Trash2,
  MoveUp,
  MoveDown,
  Sparkles,
  Wand2,
  Edit,
  Loader2,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface SectionsStepProps {
  form: UseFormReturn<ArticleFormValues>;
}

export function SectionsStep({ form }: SectionsStepProps) {
  const { fields, append, remove, move, replace } = useFieldArray({
    control: form.control,
    name: "sections",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [sectionCount, setSectionCount] = useState(5); // Default to 5 sections
  const [activeTab, setActiveTab] = useState(() => {
    // Initialize the active tab based on whether sections already exist
    return form.getValues("sections")?.length > 0 ? "manual" : "ai";
  });

  // When switching to manual tab, ensure there's at least one section
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "manual" && fields.length === 0) {
      append({ title: "" });
    }
  };

  // Only initialize AI tab with empty sections if this is the first load and there are no sections
  useEffect(() => {
    // Only clear the sections if we're in AI tab mode and this is the initial render
    const currentSections = form.getValues("sections") || [];
    if (activeTab === "ai" && currentSections.length === 0) {
      // This only happens on the first load when there are no sections yet
      replace([]);
    } else if (activeTab === "manual" && currentSections.length === 0) {
      // Ensure at least one section in manual mode
      append({ title: "" });
    }
  }, []); // Only run once on component mount

  // Use the real AI section generation endpoint
  const generateSectionsMutation = api.ai.genereteSection.useMutation({
    onSuccess: (data) => {
      if (data) {
        // Transform the string array to the expected format with title property
        const formattedSections = data.map((title) => ({ title }));
        replace(formattedSections);

        // Switch to manual tab after generation to prevent clearing sections
        setActiveTab("manual");

        toast.success("Sections generated successfully!");
      } else {
        toast.error("Failed to generate sections. Please try again.");
      }
    },
    onError: (error) => {
      toast.error(`Failed to generate sections: ${error.message}`);
    },
  });

  const handleGenerateSections = () => {
    setIsGenerating(true);

    // Validate that we have a title
    const title = form.getValues("title");
    if (!title) {
      toast.error("Please enter an article title before generating sections");
      setIsGenerating(false);
      return;
    }

    // Get the optional context if available
    const context = form.getValues("context");

    // Call the AI generation endpoint
    generateSectionsMutation.mutate(
      {
        title,
        context,
        count: sectionCount,
      },
      {
        onSettled: () => {
          setIsGenerating(false);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-semibold">Article Structure</h2>
        <p className="text-muted-foreground">
          Define how your article will be structured and organized.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            AI Generated
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-6 pt-4">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="mb-2 text-lg font-medium">Number of Sections</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Choose how many sections you want in your article. We recommend
                3-7 sections for optimal readability.
              </p>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">1</span>
                  <span
                    className={`text-sm font-medium ${sectionCount >= 3 && sectionCount <= 7 ? "text-primary" : ""}`}
                  >
                    {sectionCount}{" "}
                    {sectionCount >= 3 && sectionCount <= 7 && "(Recommended)"}
                  </span>
                  <span className="text-sm font-medium">10</span>
                </div>
                <Slider
                  value={[sectionCount]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setSectionCount(value[0] ?? 5)}
                  className="py-2"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGenerateSections}
              disabled={isGenerating || generateSectionsMutation.isPending}
              className="w-full"
            >
              {isGenerating || generateSectionsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Sections...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate {sectionCount} Sections
                </>
              )}
            </Button>

            <p className="mt-4 text-xs text-muted-foreground">
              Our AI will generate section titles based on your article title
              {form.getValues("context") ? " and context" : ""}. You can edit
              them afterward.
            </p>
          </Card>

          {fields.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Generated Sections</h3>
              <div className="space-y-3">
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
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name={`sections.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="sr-only">
                            Section Title
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter section title"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-6 pt-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
