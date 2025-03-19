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
import {
  PlusCircle,
  FileText,
  Code,
  Newspaper,
  Loader2,
  Wand2,
} from "lucide-react";
import { PresetModal } from "./preset-modal";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface SettingsStepProps {
  form: UseFormReturn<ArticleFormValues>;
}

// Define preset interfaces
interface Preset {
  id: string;
  name: string;
  format?: {
    subheadings?: boolean;
    bulletPoints?: boolean;
    numberedList?: boolean;
  };
  length?: {
    short?: boolean;
    medium?: boolean;
    long?: boolean;
    superLong?: boolean;
  };
  style?: {
    contentTone?: string;
  };
}

// Icon mapping for different types of presets
const getPresetIcon = (name: string) => {
  const normalizedName = name.toLowerCase();
  if (normalizedName.includes("technical") || normalizedName.includes("code")) {
    return Code;
  }
  if (normalizedName.includes("news") || normalizedName.includes("journal")) {
    return Newspaper;
  }
  return FileText; // Default
};

export function SettingsStep({ form }: SettingsStepProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch presets
  const presetsQuery = api.article.getPresets.useQuery();

  // Delete preset mutation
  const deletePreset = api.article.deletePreset.useMutation({
    onSuccess: () => {
      toast.success("Preset deleted successfully");
      // Refetch presets after successful deletion
      void presetsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete preset: ${error.message}`);
    },
  });

  // Generate description based on preset data
  const getPresetDescription = (preset: Preset): string => {
    const parts: string[] = [];

    // Content tone
    if (preset.style?.contentTone) {
      parts.push(
        preset.style.contentTone.charAt(0).toUpperCase() +
          preset.style.contentTone.slice(1),
      );
    }

    // Length
    if (preset.length?.short) parts.push("short");
    else if (preset.length?.medium) parts.push("medium length");
    else if (preset.length?.long) parts.push("long");
    else if (preset.length?.superLong) parts.push("comprehensive");

    // Format features
    const formatFeatures: string[] = [];
    if (preset.format?.subheadings) formatFeatures.push("subheadings");
    if (preset.format?.bulletPoints) formatFeatures.push("bullet points");
    if (preset.format?.numberedList) formatFeatures.push("numbered lists");

    if (formatFeatures.length > 0) {
      parts.push(`with ${formatFeatures.join(", ")}`);
    }

    return parts.join(", ");
  };

  const handleSavePreset = (preset: Preset) => {
    // Set the preset ID in the form
    form.setValue("presetId", preset.id);
    // Trigger validation
    void form.trigger("presetId");
    // Close the modal
    setIsModalOpen(false);
    // Refetch presets
    void presetsQuery.refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-semibold">Content Settings</h2>
        <p className="text-muted-foreground">
          Choose a preset or create a new one to define how your article will be
          generated.
        </p>
      </div>

      {presetsQuery.isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading presets...</span>
        </div>
      )}

      {presetsQuery.isError && (
        <Card className="bg-destructive/10 p-4 text-destructive">
          <p>Failed to load presets. Please try again later.</p>
        </Card>
      )}

      {presetsQuery.isSuccess && presetsQuery.data.length === 0 && (
        <Card className="bg-muted p-6 text-center">
          <p className="mb-4 text-muted-foreground">
            You don&apos;t have any presets yet. Create your first preset to
            save your preferred content settings.
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="mx-auto flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create First Preset
          </Button>
        </Card>
      )}

      {presetsQuery.isSuccess && presetsQuery.data.length > 0 && (
        <FormField
          control={form.control}
          name="presetId"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel>Select Preset</FormLabel>
              <FormControl>
                <div className="grid gap-4">
                  {presetsQuery.data.map((preset) => {
                    const isSelected = field.value === preset.id;
                    const Icon = getPresetIcon(preset.name);
                    const description = getPresetDescription(preset);

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
                                {description}
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
      )}

      {presetsQuery.isSuccess && presetsQuery.data.length > 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsModalOpen(true)}
          className="mt-4 flex w-full items-center justify-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Create New Preset
        </Button>
      )}

      <PresetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePreset}
      />
    </div>
  );
}
