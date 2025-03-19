import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

type GeneratedSections = {
  object: {
    sections: string[];
  };
};

export const aiRouter = createTRPCRouter({
  genereteSection: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        context: z.string().optional(),
        count: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { title, context, count } = input;
      console.log(title, context, count);
      const prompt = `
        You are an expert at generating attractive and engaging sections for blog articles.

        I will provide you with an article title and the desired number of sections (${count}). Your task is to create creative, logical, and cohesive section suggestions that can later be easily expanded into a full article.

        IMPORTANT! Sections must be concise, ideally one short sentence, clear, and user-friendly.

        Please follow these guidelines when generating sections:

        1. Sections should be engaging, interesting, and encourage continued reading.
        2. Each section should logically flow from the previous one, creating a cohesive structure for the article.
        3. Incorporate variety – use different approaches to the topic, such as examples, statistical data, practical tips, common mistakes, myths and facts, case studies, etc.
        4. Avoid general or vague section titles – use specific language and keywords that clearly reflect the content.
        5. Sections should be brief, concise, and easy to understand.
        6. Generate sections in the language used in the article's title.

        Article Title: ${title}
        ${context ? `Context: ${context}` : ""}
        Number of sections: ${count}
        Return only the sections without additional information.
    `;
      try {
        const result = (await generateObject({
          model: openai("gpt-4o"),
          schema: z.object({
            sections: z.array(z.string()),
          }),
          prompt,
        })) as GeneratedSections;

        return result.object.sections;
      } catch (error) {
        console.error(error);
        return null;
      }
    }),
});
