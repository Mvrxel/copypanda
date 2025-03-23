import { logger, task, wait } from "@trigger.dev/sdk/v3";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import * as schema from "@/server/db/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { db } from "@/server/db";
// const sql = neon(process.env.DATABASE_URL!);
// const db = drizzle(sql, { schema });

export const helloWorldTask = task({
  id: "hello-world",
  maxDuration: 300,
  run: async (payload: { userId: string }, { ctx }) => {
    logger.log("Hello, world!", { payload, ctx });

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId));
    if (!user) {
      throw new Error("User not found");
    }
    return {
      user: user,
    };
  },
});
