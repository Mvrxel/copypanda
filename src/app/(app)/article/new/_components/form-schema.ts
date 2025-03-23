import { z } from "zod";
import {
  presetStyleContentTone,
  presetStyleWritingStyle,
} from "@/server/db/schema";

// Form schema for the article creation form
export const articleFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(190, "Title is too long (maximum 190 characters)"),
  context: z.string().optional(),
  sections: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, "Section title is required")
          .max(190, "Section title is too long (maximum 190 characters)"),
      }),
    )
    .min(1, "At least one section is required")
    .max(10, "Maximum 10 sections allowed"),
  presetId: z.string().optional(),
});

// Schema for creating a new preset
export const presetFormSchema = z.object({
  name: z
    .string()
    .min(1, "Preset name is required")
    .max(255, "Preset name is too long"),
  format: z.object({
    subheadings: z.boolean().default(false),
    bulletPoints: z.boolean().default(false),
    numberedList: z.boolean().default(false),
  }),
  length: z.object({
    short: z.boolean().default(false),
    medium: z.boolean().default(true),
    long: z.boolean().default(false),
    superLong: z.boolean().default(false),
  }),
  style: z.object({
    contentTone: z.enum(presetStyleContentTone.enumValues).default("casual"),
    writingStyle: z
      .enum(presetStyleWritingStyle.enumValues)
      .default("narrative"),
  }),
  options: z.object({
    faqSections: z.boolean().default(false),
    summary: z.boolean().default(false),
  }),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;
export type PresetFormValues = z.infer<typeof presetFormSchema>;

// Default values for the article form - no default sections
export const defaultArticleFormValues: Partial<ArticleFormValues> = {
  title: "",
  context: "",
  sections: [],
};
