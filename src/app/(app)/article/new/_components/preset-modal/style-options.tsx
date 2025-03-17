"use client";

import { type UseFormReturn } from "react-hook-form";
import { type PresetFormValues } from "../form-schema";
import { Card } from "@/components/ui/card";
import {
  presetStyleContentTone,
  presetStyleWritingStyle,
} from "@/server/db/schema";
import {
  MessageSquare,
  Building,
  Settings,
  Palette,
  GraduationCap,
  Newspaper,
  BookOpen,
  Paintbrush,
  FileText,
  Scale,
  Speech,
  Microscope,
} from "lucide-react";

interface StyleOptionsProps {
  form: UseFormReturn<PresetFormValues>;
}

// Icons for content tones
const toneIcons: Record<string, React.ComponentType> = {
  casual: MessageSquare,
  formal: Building,
  technical: Settings,
  creative: Palette,
  educational: GraduationCap,
  journalistic: Newspaper,
};

// Icons for writing styles
const styleIcons: Record<string, React.ComponentType> = {
  narrative: BookOpen,
  descriptive: Paintbrush,
  expository: FileText,
  persuasive: Scale,
  conversational: Speech,
  analytical: Microscope,
};

export function StyleOptions({ form }: StyleOptionsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Content Tone</h3>
        <p className="text-sm text-muted-foreground">
          Choose the tone of voice for your content.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {presetStyleContentTone.enumValues.map((tone) => {
          const isSelected = form.getValues().style.contentTone === tone;
          const Icon = toneIcons[tone] ?? FileText;

          return (
            <div
              key={tone}
              onClick={() => {
                form.setValue("style.contentTone", tone);
                void form.trigger("style.contentTone");
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
                    <h4 className="font-medium capitalize">{tone}</h4>
                    <p className="text-xs text-muted-foreground">
                      {getToneDescription(tone)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="mt-6 text-lg font-medium">Writing Style</h3>
        <p className="text-sm text-muted-foreground">
          Choose the writing style for your content.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {presetStyleWritingStyle.enumValues.map((style) => {
          const isSelected = form.getValues().style.writingStyle === style;
          const Icon = styleIcons[style] ?? FileText;

          return (
            <div
              key={style}
              onClick={() => {
                form.setValue("style.writingStyle", style);
                void form.trigger("style.writingStyle");
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
                    <h4 className="font-medium capitalize">{style}</h4>
                    <p className="text-xs text-muted-foreground">
                      {getStyleDescription(style)}
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
          <strong>Tip:</strong> Match your tone and style to your target
          audience and the purpose of your content.
        </p>
      </Card>
    </div>
  );
}

function getToneDescription(tone: string): string {
  const descriptions: Record<string, string> = {
    casual: "Relaxed, conversational tone that feels like talking to a friend.",
    formal:
      "Professional, structured tone suitable for business or academic content.",
    technical:
      "Precise, detailed tone with specialized terminology for expert audiences.",
    creative:
      "Imaginative, expressive tone that uses colorful language and imagery.",
    educational:
      "Clear, instructive tone focused on explaining concepts effectively.",
    journalistic:
      "Objective, fact-based tone that presents information impartially.",
  };
  return descriptions[tone] ?? "";
}

function getStyleDescription(style: string): string {
  const descriptions: Record<string, string> = {
    narrative: "Tells a story with a beginning, middle, and end.",
    descriptive: "Paints a detailed picture with rich, sensory language.",
    expository: "Explains concepts clearly with facts and examples.",
    persuasive: "Convinces the reader with compelling arguments and evidence.",
    conversational: "Engages the reader as if having a direct conversation.",
    analytical:
      "Examines topics critically, breaking them down into components.",
  };
  return descriptions[style] ?? "";
}
