import { logger, task, wait } from "@trigger.dev/sdk/v3";
import { users } from "@/server/db/schema";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
export const helloWorldTask = task({
  id: "hello-world",
  maxDuration: 300,
  run: async (payload: { userId: string }, { ctx }) => {
    logger.log("Hello, world!", { payload, ctx });

    await wait.for({ seconds: 5 });
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });
    if (!user) {
      throw new Error("User not found");
    }
    return {
      user: user,
    };
  },
});
