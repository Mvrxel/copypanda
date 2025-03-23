"use client";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";
import { Separator } from "../../../components/ui/separator";
import Articles from "./_compontets/articles";
export default function Dashboard() {
  const router = useRouter();
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl font-bold">Dashboard</h3>
        <Button onClick={() => router.push("/article/new")}>
          Create Article
        </Button>
      </div>
      <Separator />
      <Articles />
    </div>
  );
}
