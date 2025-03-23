"use client";
import { api } from "@/trpc/react";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Button } from "../../../../components/ui/button";
import { useRouter } from "next/navigation";
import { Separator } from "../../../../components/ui/separator";
export default function Articles() {
  const router = useRouter();
  const { data, isLoading } = api.article.getAllArticles.useQuery();
  if (isLoading)
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );

  if (data && data.length === 0)
    return (
      <div className="mt-4 flex w-full flex-col items-center justify-center gap-4 rounded-lg border bg-white p-4">
        <p className="text-center text-gray-500">No articles found</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/article/new")}
        >
          Create New Article
        </Button>
      </div>
    );
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data?.map((article) => (
        <div
          className="mb-2 flex flex-row rounded-lg border bg-white p-4"
          key={article.id}
        >
          <div className="flex flex-col gap-2">
            <p className="font-medium">{article.title}</p>
            <p className="line-clamp-4 text-sm text-gray-500">
              {article.content}
            </p>
            <Separator className="my-2" />
            <div className="flex flex-row items-center justify-between gap-2">
              <p className="text-sm text-gray-500">
                {article.createdAt.toLocaleDateString()}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/article/${article.id}`)}
              >
                View
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
