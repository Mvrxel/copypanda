"use client";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type RealtimeTaskProps = {
  runId: string;
  token: string;
  articleId: string;
};

export default function RealtimeTask({
  runId,
  token,
  articleId,
}: RealtimeTaskProps) {
  const router = useRouter();
  const { run, error } = useRealtimeRun(runId, {
    accessToken: token,
  });
  const [fadeIn, setFadeIn] = useState(false);

  // Animation effect when status changes
  useEffect(() => {
    if (run?.metadata?.status) {
      setFadeIn(true);
      const timer = setTimeout(() => setFadeIn(false), 500);
      return () => clearTimeout(timer);
    }
  }, [run?.metadata?.status]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-6 shadow-md">
        <h3 className="text-lg font-semibold text-red-800">Generation Error</h3>
        <p className="mt-2 text-red-700">{error.message}</p>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="animate-pulse rounded-lg border border-gray-100 bg-white p-6 shadow-md">
        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
        <div className="mt-4 h-3 w-1/2 rounded bg-gray-200"></div>
        <div className="mt-6 h-2 w-full rounded bg-gray-200"></div>
      </div>
    );
  }

  const isCompleted = run.status === "COMPLETED";
  const progress = (run.metadata?.progress as number) || 0;
  const status = (run.metadata?.status as string) || "Processing";
  const currentStep = status || "Initializing...";

  // Define colors based on the current step
  const getStepColor = () => {
    if (status?.includes("Generating")) return "bg-gray-800";
    if (status?.includes("Editing")) return "bg-gray-900";
    if (status?.includes("completed")) return "bg-black";
    return "bg-gray-800";
  };

  const getStatusIcon = () => {
    if (isCompleted) return "✓";
    if (progress < 0.3) return "✍️";
    if (progress < 0.7) return "⚙️";
    if (progress < 1) return "🔍";
    return "✓";
  };

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-medium text-gray-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-sm text-white">
            {getStatusIcon()}
          </span>
          <span className="font-semibold">Content Generation</span>
        </h3>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-900">
          {Math.round(progress * 100)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getStepColor()}`}
          style={{ width: `${Math.max(3, progress * 100)}%` }}
        ></div>
      </div>

      {/* Current status */}
      <div
        className={`mb-4 transition-opacity duration-300 ${fadeIn ? "opacity-100" : "opacity-90"}`}
      >
        <p className="font-medium text-gray-800">{currentStep}</p>
        {run.metadata?.article_title && (
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-normal">
              {run.metadata.article_title as string}
            </span>
          </p>
        )}
      </div>

      {/* Task details */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
        {run.metadata?.sections && (
          <div className="col-span-2">
            <span className="font-medium text-gray-700">Sections: </span>
            {(run.metadata.sections as string[]).join(", ")}
          </div>
        )}
      </div>

      {/* Show article button when completed */}
      {isCompleted && (
        <button
          onClick={() => router.push(`/article/${articleId}`)}
          className="mt-6 w-full rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        >
          View Article
        </button>
      )}
    </div>
  );
}
