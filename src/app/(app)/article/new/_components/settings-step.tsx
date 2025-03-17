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
import { PlusCircle } from "lucide-react";
import { PresetModal } from "./preset-modal";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SettingsStepProps {
  form: UseFormReturn<ArticleFormValues>;
}

// Mock presets data - in a real app, this would come from the database
const mockPresets = [
  {
    id: "1",
    name: "Blog Post",
    description: "Casual, medium length with bullet points",
  },
  {
    id: "2",
    name: "Technical Article",
    description: "Formal, detailed with subheadings",
  },
  {
    id: "3",
    name: "News Article",
    description: "Journalistic style with summary",
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
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="space-y-3"
              >
                {mockPresets.map((preset) => (
                  <FormItem
                    key={preset.id}
                    className="flex items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <RadioGroupItem value={preset.id} />
                    </FormControl>
                    <div className="w-full">
                      <Card
                        className={`cursor-pointer p-4 ${field.value === preset.id ? "border-primary" : ""}`}
                      >
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {preset.description}
                        </div>
                      </Card>
                    </div>
                  </FormItem>
                ))}
              </RadioGroup>
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
