"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type PresetFormValues, presetFormSchema } from "./form-schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormatOptions } from "./preset-modal/format-options";
import { LengthOptions } from "./preset-modal/length-options";
import { StyleOptions } from "./preset-modal/style-options";
import { AdditionalOptions } from "./preset-modal/additional-options";

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preset: PresetFormValues) => void;
}

export function PresetModal({ isOpen, onClose, onSave }: PresetModalProps) {
  const [activeTab, setActiveTab] = useState("format");

  const form = useForm<PresetFormValues>({
    resolver: zodResolver(presetFormSchema),
    defaultValues: {
      name: "",
      format: {
        subheadings: false,
        bulletPoints: false,
        numberedList: false,
      },
      length: {
        short: false,
        medium: true,
        long: false,
        superLong: false,
      },
      style: {
        contentTone: "casual",
        writingStyle: "narrative",
      },
      options: {
        faqSections: false,
        summary: false,
      },
    },
  });

  const handleSubmit = (data: PresetFormValues) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Preset</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preset Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter preset name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your preset a descriptive name to easily identify it
                    later.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 grid grid-cols-4">
                <TabsTrigger value="format">Format</TabsTrigger>
                <TabsTrigger value="length">Length</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
                <TabsTrigger value="options">Options</TabsTrigger>
              </TabsList>

              <TabsContent value="format" className="space-y-4">
                <FormatOptions form={form} />
              </TabsContent>

              <TabsContent value="length" className="space-y-4">
                <LengthOptions form={form} />
              </TabsContent>

              <TabsContent value="style" className="space-y-4">
                <StyleOptions form={form} />
              </TabsContent>

              <TabsContent value="options" className="space-y-4">
                <AdditionalOptions form={form} />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Preset</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
