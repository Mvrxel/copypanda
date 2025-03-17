"use client";

import { type UseFormReturn } from "react-hook-form";
import { type PresetFormValues } from "../form-schema";
import { Card } from "@/components/ui/card";
import { Heading, List, ListOrdered } from "lucide-react";

interface FormatOptionsProps {
  form: UseFormReturn<PresetFormValues>;
}

type FormatOptionKey = "subheadings" | "bulletPoints" | "numberedList";

// Format options with icons
const formatOptions = [
  {
    id: "subheadings" as FormatOptionKey,
    name: "Subheadings",
    description:
      "Include subheadings to organize content into smaller sections",
    icon: Heading,
  },
  {
    id: "bulletPoints" as FormatOptionKey,
    name: "Bullet Points",
    description: "Use bullet points for lists and key points",
    icon: List,
  },
  {
    id: "numberedList" as FormatOptionKey,
    name: "Numbered Lists",
    description: "Use numbered lists for sequential steps or ranked items",
    icon: ListOrdered,
  },
];

export function FormatOptions({ form }: FormatOptionsProps) {
  const toggleOption = (option: FormatOptionKey) => {
    const currentValue = form.getValues().format[option];
    form.setValue(`format.${option}`, !currentValue);
    void form.trigger("format");
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Format Options</h3>
        <p className="text-sm text-muted-foreground">
          Choose how your content will be structured.
        </p>
      </div>

      <div className="grid gap-4">
        {formatOptions.map((option) => {
          const isSelected = form.getValues().format[option.id];
          const Icon = option.icon;

          return (
            <div
              key={option.id}
              onClick={() => toggleOption(option.id)}
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
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">{option.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      <Card className="mt-4 bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Using a combination of formatting options can
          make your content more engaging and easier to read.
        </p>
      </Card>
    </div>
  );
}
