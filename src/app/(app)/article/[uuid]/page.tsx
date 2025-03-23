"use client";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import RealtimeTask from "./_components/realtime-task";
import Editor from "./_components/editor";
export default function ArticlePage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { data, isLoading } = api.article.getArticleByUuid.useQuery({
    uuid: uuid,
  });

  console.log(data);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <div>Article not found</div>;
  }

  if (!data.article) {
    return <div>Article not found</div>;
  }

  if (data.article.status === "running") {
    return (
      <RealtimeTask
        runId={data.article.tasks.runId}
        token={data.article.tasks.publicToken}
        articleId={data.article.id}
      />
    );
  }

  return <Editor articleContent={data.article.content ?? ""} />;
}
