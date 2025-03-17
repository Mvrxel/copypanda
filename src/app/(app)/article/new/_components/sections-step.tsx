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
  const [activeTab, setActiveTab] = useState("ai"); // Default to AI tab

  const handleGenerateSections = () => {
    // Mock generation - in a real app, this would call an API
    setIsGenerating(true);

    // Create empty sections based on the slider value
    const newSections = Array.from({ length: sectionCount }, () => ({
      title: "",
    }));

    // In a real app, you would populate these with AI-generated titles
    setTimeout(() => {
      replace(newSections);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-semibold">Article Structure</h2>
        <p className="text-muted-foreground">
          Define how your article will be structured and organized.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
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
              Our AI will generate section titles based on your article title.
              You can edit them afterward.
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
