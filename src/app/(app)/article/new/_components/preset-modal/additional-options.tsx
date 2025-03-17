"use client";

import { type UseFormReturn } from "react-hook-form";
import { type PresetFormValues } from "../form-schema";
import { Card } from "@/components/ui/card";
import { HelpCircle, FileText } from "lucide-react";

interface AdditionalOptionsProps {
  form: UseFormReturn<PresetFormValues>;
}

type OptionKey = "faqSections" | "summary";

// Additional options with icons
const additionalOptions = [
  {
    id: "faqSections" as OptionKey,
    name: "FAQ Sections",
    description:
      "Include a frequently asked questions section at the end of your article",
    icon: HelpCircle,
  },
  {
    id: "summary" as OptionKey,
    name: "Summary",
    description:
      "Include a concise summary at the beginning or end of your article",
    icon: FileText,
  },
];

export function AdditionalOptions({ form }: AdditionalOptionsProps) {
  const toggleOption = (option: OptionKey) => {
    const currentValue = form.getValues().options[option];
    form.setValue(`options.${option}`, !currentValue);
    void form.trigger("options");
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Additional Options</h3>
        <p className="text-sm text-muted-foreground">
          Choose additional features to enhance your content.
        </p>
      </div>

      <div className="grid gap-4">
        {additionalOptions.map((option) => {
          const isSelected = form.getValues().options[option.id];
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
          <strong>Tip:</strong> FAQ sections can help address common questions
          and improve SEO, while summaries help readers quickly understand the
          key points.
        </p>
      </Card>
    </div>
  );
}
