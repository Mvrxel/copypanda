import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { useState } from "react";
import { type Content } from "@tiptap/react";

type EditorProps = {
  articleContent: string;
};

export default function Editor({ articleContent }: EditorProps) {
  const [content, setContent] = useState(articleContent);
  return (
    <div className="h-[calc(100vh-6rem)]">
      <MinimalTiptapEditor
        value={content}
        onChange={(newContent: Content) => setContent(newContent as string)}
        className="min-h-[500px] w-full"
        editorContentClassName="p-5"
        output="html"
        placeholder="Wprowadź treść artykułu..."
        autofocus={false}
        editable={true}
        editorClassName="focus:outline-none"
      />
    </div>
  );
}
