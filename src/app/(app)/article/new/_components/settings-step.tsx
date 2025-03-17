"use client";

import { useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { type ArticleFormValues } from "./form-schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, FileText, Code, Newspaper } from "lucide-react";
import { PresetModal } from "./preset-modal";

interface SettingsStepProps {
  form: UseFormReturn<ArticleFormValues>;
}

// Mock presets data - in a real app, this would come from the database
const mockPresets = [
  {
    id: "1",
    name: "Blog Post",
    description: "Casual, medium length with bullet points",
    icon: FileText,
  },
  {
    id: "2",
    name: "Technical Article",
    description: "Formal, detailed with subheadings",
    icon: Code,
  },
  {
    id: "3",
    name: "News Article",
    description: "Journalistic style with summary",
    icon: Newspaper,
  },
];

export function SettingsStep({ form }: SettingsStepProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-semibold">Content Settings</h2>
        <p className="text-muted-foreground">
          Choose a preset or create a new one to define how your article will be
          generated.
        </p>
      </div>

      <FormField
        control={form.control}
        name="presetId"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <FormLabel>Select Preset</FormLabel>
            <FormControl>
              <div className="grid gap-4">
                {mockPresets.map((preset) => {
                  const isSelected = field.value === preset.id;
                  const Icon = preset.icon;

                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        field.onChange(preset.id);
                        void form.trigger("presetId");
                      }}
                      className="cursor-pointer"
                    >
                      <Card
                        className={`p-4 transition-all ${
                          isSelected
                            ? "border-primary"
                            : "border-muted hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-medium">{preset.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {preset.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        className="mt-4 flex w-full items-center justify-center gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        Create New Preset
      </Button>

      <PresetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(preset) => {
          // In a real app, this would save the preset to the database
          // and then set the presetId in the form
          console.log("New preset:", preset);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
