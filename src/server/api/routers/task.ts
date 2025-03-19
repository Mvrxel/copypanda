import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { tasks } from "@trigger.dev/sdk/v3";
import { type helloWorldTask } from "../../../trigger/example";

export const taskRouter = createTRPCRouter({
  test: protectedProcedure
    .input(
      z.object({
        msg: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const handle = await tasks.trigger<typeof helloWorldTask>("hello-world", {
        userId: ctx.session.user.id,
      });
      console.log(handle);
      return null;
    }),
});
