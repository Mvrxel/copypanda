import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { useState } from "react";
import { type Content } from "@tiptap/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

type EditorProps = {
  articleContent: string;
};

export default function Editor({ articleContent }: EditorProps) {
  const [content, setContent] = useState(articleContent);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <Card className="overflow-hidden border bg-card shadow">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4">
        <CardTitle className="text-lg font-medium">Edycja artykułu</CardTitle>
        <Button
          onClick={handleSave}
          size="sm"
          className="gap-1.5"
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[calc(100vh-14rem)] overflow-hidden">
          <MinimalTiptapEditor
            value={content}
            onChange={(newContent: Content) => setContent(newContent as string)}
            className="min-h-[500px] w-full border-0 shadow-none"
            editorContentClassName="p-6"
            output="html"
            placeholder="Wprowadź treść artykułu..."
            autofocus={false}
            editable={true}
            editorClassName="focus:outline-none prose prose-sm max-w-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}
