import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  presets,
  presetFormat,
  presetLength,
  presetOptions,
  presetStyle,
  presetStyleContentTone,
  presetStyleWritingStyle,
  articles,
  tasks as dbTask,
} from "@/server/db/schema";
import { tasks } from "@trigger.dev/sdk/v3";
import { type generateArticleContent } from "@/trigger/content-generation-agent";
import { eq, desc } from "drizzle-orm";

// Preset schema for create/update operations
const presetSchema = z.object({
  name: z.string().min(1).max(255),
  format: z.object({
    subheadings: z.boolean().default(false),
    bulletPoints: z.boolean().default(false),
    numberedList: z.boolean().default(false),
  }),
  length: z.object({
    short: z.boolean().default(false),
    medium: z.boolean().default(true),
    long: z.boolean().default(false),
    superLong: z.boolean().default(false),
  }),
  style: z.object({
    contentTone: z.enum(presetStyleContentTone.enumValues).default("casual"),
    writingStyle: z
      .enum(presetStyleWritingStyle.enumValues)
      .default("narrative"),
  }),
  options: z.object({
    faqSections: z.boolean().default(false),
    summary: z.boolean().default(false),
  }),
});

export const articleRouter = createTRPCRouter({
  // Get all presets for the current user
  getPresets: protectedProcedure.query(async ({ ctx }) => {
    const userPresets = await ctx.db.query.presets.findMany({
      where: eq(presets.userId, ctx.session.user.id),
      with: {
        format: true,
        length: true,
        style: true,
        options: true,
      },
    });

    return userPresets;
  }),

  // Get a single preset by ID
  getPresetById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const preset = await ctx.db.query.presets.findFirst({
        where: eq(presets.id, input.id),
        with: {
          format: true,
          length: true,
          style: true,
          options: true,
        },
      });

      if (!preset || preset.userId !== ctx.session.user.id) {
        throw new Error("Preset not found or access denied");
      }

      return preset;
    }),

  // Create a new preset
  createPreset: protectedProcedure
    .input(presetSchema)
    .mutation(async ({ ctx, input }) => {
      // Start a transaction to create all related records
      return await ctx.db.transaction(async (tx) => {
        // 1. Create the preset
        const [newPreset] = await tx
          .insert(presets)
          .values({
            userId: ctx.session.user.id,
            name: input.name,
          })
          .returning();

        if (!newPreset?.id) {
          throw new Error("Failed to create preset");
        }

        // 2. Create format options
        await tx.insert(presetFormat).values({
          presetId: newPreset.id,
          subheadings: input.format.subheadings,
          bulletPoints: input.format.bulletPoints,
          numberedList: input.format.numberedList,
        });

        // 3. Create length options
        await tx.insert(presetLength).values({
          presetId: newPreset.id,
          short: input.length.short,
          medium: input.length.medium,
          long: input.length.long,
          superLong: input.length.superLong,
        });

        // 4. Create style options
        await tx.insert(presetStyle).values({
          presetId: newPreset.id,
          contentTone: input.style.contentTone,
          writingStyle: input.style.writingStyle,
        });

        // 5. Create additional options
        await tx.insert(presetOptions).values({
          presetId: newPreset.id,
          faqSections: input.options.faqSections,
          summary: input.options.summary,
        });

        return newPreset;
      });
    }),

  // Update an existing preset
  updatePreset: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: presetSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First check if the preset exists and belongs to the user
      const existingPreset = await ctx.db.query.presets.findFirst({
        where: eq(presets.id, input.id),
      });

      if (!existingPreset || existingPreset.userId !== ctx.session.user.id) {
        throw new Error("Preset not found or access denied");
      }

      // Update all related records in a transaction
      return await ctx.db.transaction(async (tx) => {
        // 1. Update the preset
        await tx
          .update(presets)
          .set({
            name: input.data.name,
            updatedAt: new Date(),
          })
          .where(eq(presets.id, input.id));

        // 2. Update format options
        await tx
          .update(presetFormat)
          .set({
            subheadings: input.data.format.subheadings,
            bulletPoints: input.data.format.bulletPoints,
            numberedList: input.data.format.numberedList,
            updatedAt: new Date(),
          })
          .where(eq(presetFormat.presetId, input.id));

        // 3. Update length options
        await tx
          .update(presetLength)
          .set({
            short: input.data.length.short,
            medium: input.data.length.medium,
            long: input.data.length.long,
            superLong: input.data.length.superLong,
            updatedAt: new Date(),
          })
          .where(eq(presetLength.presetId, input.id));

        // 4. Update style options
        await tx
          .update(presetStyle)
          .set({
            contentTone: input.data.style.contentTone,
            writingStyle: input.data.style.writingStyle,
            updatedAt: new Date(),
          })
          .where(eq(presetStyle.presetId, input.id));

        // 5. Update additional options
        await tx
          .update(presetOptions)
          .set({
            faqSections: input.data.options.faqSections,
            summary: input.data.options.summary,
            updatedAt: new Date(),
          })
          .where(eq(presetOptions.presetId, input.id));

        // Return the updated preset
        return {
          id: input.id,
          ...input.data,
        };
      });
    }),

  // Delete a preset
  deletePreset: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // First check if the preset exists and belongs to the user
      const existingPreset = await ctx.db.query.presets.findFirst({
        where: eq(presets.id, input.id),
      });

      if (!existingPreset || existingPreset.userId !== ctx.session.user.id) {
        throw new Error("Preset not found or access denied");
      }

      // Delete the preset (related records will be deleted via cascading constraints)
      await ctx.db.delete(presets).where(eq(presets.id, input.id));

      return { success: true };
    }),

  // Mock procedure for generating sections
  mockGenerateSections: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        context: z.string().optional(),
        count: z.number().min(1).max(10).default(5),
      }),
    )
    .mutation(async ({ input }) => {
      // This is a mock implementation that should be replaced with actual AI generation
      const { title, context, count } = input;

      // For a real implementation, you would call an AI service here
      // But for now, we'll just use some placeholder logic

      const basePhrases = [
        "Introduction to",
        "Understanding",
        "Key aspects of",
        "The importance of",
        "How to implement",
        "Benefits of",
        "Challenges with",
        "The future of",
        "Best practices for",
        "Case studies on",
      ];

      // Create mock sections based on the title
      const sections = Array.from({ length: count }, (_, index) => {
        // Use the title and context to generate somewhat relevant section titles
        const phrase = basePhrases[index % basePhrases.length];
        const titleWords = title.split(" ");
        const relevantWord = titleWords[index % titleWords.length];

        return {
          title: `${phrase} ${relevantWord}`,
        };
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return sections;
    }),

  genereteArticle: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        context: z.string().optional(),
        sections: z.array(
          z.object({
            title: z.string(),
          }),
        ),
        presetId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { title, context, sections, presetId } = input;

      // Get preset details if presetId is provided
      let presetDetails = null;
      if (presetId) {
        const preset = await ctx.db.query.presets.findFirst({
          where: eq(presets.id, presetId),
          with: {
            format: true,
            length: true,
            style: true,
            options: true,
          },
        });

        if (preset && preset.userId === ctx.session.user.id) {
          presetDetails = preset;
        }
      }

      // Create test object with all information
      const articleData = {
        title,
        context: context ?? undefined,
        sections: sections.map((section) => section.title),
        parameters: {
          format: presetDetails?.format ?? {
            subheadings: false,
            bulletPoints: false,
            numberedList: false,
          },
          length: presetDetails?.length ?? {
            short: false,
            medium: true,
            long: false,
            superLong: false,
          },
          options: presetDetails?.options ?? {
            faqSections: false,
            summary: false,
          },
          contentType: {
            contentTone: presetDetails?.style?.contentTone ?? "casual",
            writingStyle: presetDetails?.style?.writingStyle ?? "narrative",
          },
        },
      };

      const article = await ctx.db
        .insert(articles)
        .values({
          title: articleData.title,
          userId: ctx.session.user.id,
        })
        .returning();

      if (!article) {
        throw new Error("Failed to create article");
      }

      if (!article[0]?.id) {
        throw new Error("Failed to create article");
      }

      const handle = await tasks.trigger<typeof generateArticleContent>(
        "generate-article-content",
        {
          title: articleData.title,
          context: articleData.context,
          sections: articleData.sections,
          parameters: articleData.parameters,
          articleId: article[0].id,
        },
      );

      const [id] = await ctx.db
        .insert(dbTask)
        .values({
          articleId: article[0].id,
          runId: handle.id,
          publicToken: handle.publicAccessToken,
        })
        .returning();

      return {
        articleId: article[0].id,
        runId: handle.id,
        publicToken: handle.publicAccessToken,
      };
    }),

  getArticleByUuid: protectedProcedure
    .input(z.object({ uuid: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { uuid } = input;

      const article = await ctx.db.query.articles.findFirst({
        where: eq(articles.id, uuid),
        with: {
          tasks: true,
        },
      });
      console.log(article);
      return {
        article,
      };
    }),
  getAllArticles: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.query.articles.findMany({
      where: eq(articles.userId, ctx.session.user.id),
      orderBy: [desc(articles.createdAt)],
    });
    return data;
  }),
});
