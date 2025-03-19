"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";

export default function TestComponent() {
  const { mutate, isPending } = api.task.test.useMutation();
  return (
    <div>
      <Button disabled={isPending} onClick={() => mutate({ msg: "Hello" })}>
        Test
      </Button>
      {isPending && <p>Loading...</p>}
    </div>
  );
}
