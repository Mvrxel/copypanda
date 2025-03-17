"use client";

import { type UseFormReturn } from "react-hook-form";
import { type PresetFormValues } from "../form-schema";
import { Card } from "@/components/ui/card";
import { FileText, BookOpen, ClipboardList, Search } from "lucide-react";

interface LengthOptionsProps {
  form: UseFormReturn<PresetFormValues>;
}

type LengthOption = "short" | "medium" | "long" | "superLong";

export function LengthOptions({ form }: LengthOptionsProps) {
  // Helper function to set only one length option to true
  const setLengthOption = (option: LengthOption) => {
    form.setValue("length.short", option === "short");
    form.setValue("length.medium", option === "medium");
    form.setValue("length.long", option === "long");
    form.setValue("length.superLong", option === "superLong");
  };

  // Determine which option is currently selected
  const getSelectedOption = (): LengthOption => {
    const values = form.getValues().length;
    if (values.short) return "short";
    if (values.medium) return "medium";
    if (values.long) return "long";
    if (values.superLong) return "superLong";
    return "medium"; // Default
  };

  const selectedOption = getSelectedOption();

  const lengthOptions = [
    {
      id: "short" as LengthOption,
      name: "Short & Sweet",
      wordCount: "300-500",
      description: "Quick and focused read",
      icon: FileText,
    },
    {
      id: "medium" as LengthOption,
      name: "Standard Article",
      wordCount: "800-1200",
      description: "Balanced coverage",
      icon: BookOpen,
    },
    {
      id: "long" as LengthOption,
      name: "In-Depth Guide",
      wordCount: "1500-2000",
      description: "Comprehensive coverage",
      icon: ClipboardList,
    },
    {
      id: "superLong" as LengthOption,
      name: "Deep Research",
      wordCount: "2500-3000",
      description: "Complete exploration",
      icon: Search,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Content Length</h3>
        <p className="text-sm text-muted-foreground">
          Choose how long your generated content should be.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {lengthOptions.map((option) => {
          const isSelected = selectedOption === option.id;
          const Icon = option.icon;

          return (
            <div
              key={option.id}
              onClick={() => {
                setLengthOption(option.id);
                void form.trigger("length");
              }}
              className="cursor-pointer"
            >
              <Card
                className={`h-full p-4 transition-all ${
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
                    <div className="text-sm font-medium text-primary">
                      {option.wordCount}
                    </div>
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
          <strong>Tip:</strong> Medium-length content typically performs best
          for most online audiences, balancing depth with readability.
        </p>
      </Card>
    </div>
  );
}
