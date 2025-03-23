import { schemaTask, metadata } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { eq } from "drizzle-orm";
import * as schema from "@/server/db/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
// import { db } from "@/server/db";
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Schemas for content type
const ContentToneSchema = z.enum([
  "casual",
  "formal",
  "technical",
  "creative",
  "educational",
  "journalistic",
]);

const WritingStyleSchema = z.enum([
  "narrative",
  "descriptive",
  "expository",
  "persuasive",
  "conversational",
  "analytical",
]);

// Schema for the main payload
const ContentGenerationSchema = z.object({
  articleId: z.string().min(1),
  title: z.string().min(1),
  context: z.string().optional(),
  sections: z.array(z.string()),
  parameters: z.object({
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
    options: z.object({
      faqSections: z.boolean().default(false),
      summary: z.boolean().default(false),
    }),
    contentType: z.object({
      contentTone: ContentToneSchema,
      writingStyle: WritingStyleSchema,
    }),
  }),
});

const ContentEditorGenerationSchema = z.object({
  title: z.string().min(1),
  context: z.string().optional(),
  sections: z.array(z.string()),
  parameters: z.object({
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
    options: z.object({
      faqSections: z.boolean().default(false),
      summary: z.boolean().default(false),
    }),
    contentType: z.object({
      contentTone: ContentToneSchema,
      writingStyle: WritingStyleSchema,
    }),
  }),
  draft: z.string(),
});

// Helper function to generate content using OpenAI GPT-4o
async function generateWithAI(prompt: string): Promise<string> {
  try {
    // Create a custom prompt that will return plain text
    const customPrompt = `${prompt}\n\nRespond with plain text content only, without any additional formatting or metadata. Return the content in markdown format. Language the same as the language given in text.`;

    // Use the AI SDK to generate text
    const result = await generateText({
      model: openai("gpt-4o"),
      system:
        "You are a professional content writer. Generate high-quality, engaging content following the instructions provided. Language the same as the language given in text.",
      messages: [{ role: "user", content: customPrompt }],
      temperature: 0.7,
    });

    // The result should be directly usable as a string
    return (result.text as unknown as string) || "Content generation failed";
  } catch (error) {
    console.error("Error generating content with OpenAI:", error);
    return `[Error generating content: ${error instanceof Error ? error.message : String(error)}]`;
  }
}

export const editor = schemaTask({
  id: "editor",
  schema: ContentEditorGenerationSchema,
  run: async (payload) => {
    metadata.set("status", "Editing content");
    // Format instructions
    let formatInstructions = "";
    if (payload.parameters.format.subheadings) {
      formatInstructions += " Include relevant subheadings.";
    }
    if (payload.parameters.format.bulletPoints) {
      formatInstructions += " Use bullet points for listing items.";
    }
    if (payload.parameters.format.numberedList) {
      formatInstructions += " Use numbered lists for sequential information.";
    }

    // Craft the prompt
    const contextPrompt = payload.context
      ? ` taking into account this context: ${payload.context}`
      : "";
    const stylePrompt = ` The tone should be ${payload.parameters.contentType.contentTone} and the writing style should be ${payload.parameters.contentType.writingStyle}.`;
    const formatPrompt = formatInstructions ? formatInstructions : "";
    const lengthPrompt = ` The article should be approximately ${payload.parameters.length.medium ? "1200" : payload.parameters.length.long ? "2000" : payload.parameters.length.superLong ? "3000" : "800"} words.`;
    const prompt = `
    You are acting as a professional editor. You'll be provided with an article and specific editing guidelines. Your task is to carefully edit the provided text according to all given instructions. Ensure the text remains clear, readable, natural-sounding, and closely resembles human-written content. Return the final text formatted neatly in high-quality Markdown, including appropriate headings, subheadings, bullet points, numbered lists, bold and italic formatting, and block quotes where suitable.
    Guidelines:
    Title: ${payload.title}
    - Context: ${contextPrompt}
    - Style: ${stylePrompt}
    - Format: ${formatPrompt}
    - Length: ${lengthPrompt}
    `;
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: prompt,
      messages: [
        {
          role: "user",
          content: `
        You are given a draft of a content. Please edit it to make it better.
        Draft: ${payload.draft}
        `,
        },
      ],
      temperature: 0.7,
    });
    return text;
  },
});

// Introduction generation subtask
export const generateIntroduction = schemaTask({
  id: "generate-introduction",
  schema: z.object({
    title: z.string(),
    context: z.string().optional(),
    contentTone: ContentToneSchema,
    writingStyle: WritingStyleSchema,
  }),
  run: async (payload) => {
    metadata.set("status", "Generating introduction");

    // Generate an introduction based on the title, context, and content type
    const wordCount = 100; // Introductions are typically shorter

    // Craft a prompt based on the parameters
    const promptBase = `Write an engaging introduction for an article titled "${payload.title}"`;
    const contextPrompt = payload.context
      ? ` with the following context: ${payload.context}`
      : "";
    const stylePrompt = ` The tone should be ${payload.contentTone} and the writing style should be ${payload.writingStyle}.`;
    const lengthPrompt = ` The introduction should be approximately ${wordCount} words.`;

    const fullPrompt = `${promptBase}${contextPrompt}.${stylePrompt}${lengthPrompt}`;

    // Generate content using OpenAI
    const generatedContent = await generateWithAI(fullPrompt);
    const introduction = `# ${payload.title}\n\n${generatedContent}`;

    metadata.set("status", "Introduction generated");
    return { introduction };
  },
});

// Body section generation subtask
export const generateBodySection = schemaTask({
  id: "generate-body-section",
  schema: z.object({
    sectionTitle: z.string(),
    articleTitle: z.string(),
    context: z.string().optional(),
    contentTone: ContentToneSchema,
    writingStyle: WritingStyleSchema,
    format: z.object({
      subheadings: z.boolean(),
      bulletPoints: z.boolean(),
      numberedList: z.boolean(),
    }),
    wordCount: z.number(),
  }),
  run: async (payload) => {
    metadata.set("status", `Generating section: ${payload.sectionTitle}`);

    // Format instructions
    let formatInstructions = "";
    if (payload.format.subheadings) {
      formatInstructions += " Include relevant subheadings.";
    }
    if (payload.format.bulletPoints) {
      formatInstructions += " Use bullet points for listing items.";
    }
    if (payload.format.numberedList) {
      formatInstructions += " Use numbered lists for sequential information.";
    }

    // Craft the prompt
    const promptBase = `Write content for the section "${payload.sectionTitle}" of an article titled "${payload.articleTitle}"`;
    const contextPrompt = payload.context
      ? ` taking into account this context: ${payload.context}`
      : "";
    const stylePrompt = ` The tone should be ${payload.contentTone} and the writing style should be ${payload.writingStyle}.`;
    const formatPrompt = formatInstructions ? formatInstructions : "";
    const lengthPrompt = ` This section should be approximately ${payload.wordCount} words.`;

    const fullPrompt = `${promptBase}${contextPrompt}.${stylePrompt}${formatPrompt}${lengthPrompt}`;

    // Generate content using OpenAI
    const generatedContent = await generateWithAI(fullPrompt);
    const sectionContent = `## ${payload.sectionTitle}\n\n${generatedContent}`;

    metadata.set("status", `Section generated: ${payload.sectionTitle}`);
    return { sectionContent };
  },
});

// Conclusion generation subtask
export const generateConclusion = schemaTask({
  id: "generate-conclusion",
  schema: z.object({
    title: z.string(),
    context: z.string().optional(),
    contentTone: ContentToneSchema,
    writingStyle: WritingStyleSchema,
  }),
  run: async (payload) => {
    metadata.set("status", "Generating conclusion");

    // Generate a conclusion based on the title, context, and content type
    const wordCount = 150; // Conclusions are typically moderate in length

    // Craft the prompt
    const promptBase = `Write a strong conclusion for an article titled "${payload.title}"`;
    const contextPrompt = payload.context
      ? ` with the following context: ${payload.context}`
      : "";
    const stylePrompt = ` The tone should be ${payload.contentTone} and the writing style should be ${payload.writingStyle}.`;
    const lengthPrompt = ` The conclusion should be approximately ${wordCount} words.`;

    const fullPrompt = `${promptBase}${contextPrompt}.${stylePrompt}${lengthPrompt}`;

    // Generate content using OpenAI
    const generatedContent = await generateWithAI(fullPrompt);
    const conclusion = `## Conclusion\n\n${generatedContent}`;

    metadata.set("status", "Conclusion generated");
    return { conclusion };
  },
});

// FAQ generation subtask
export const generateFAQ = schemaTask({
  id: "generate-faq",
  schema: z.object({
    title: z.string(),
    sections: z.array(z.string()),
    context: z.string().optional(),
    contentTone: ContentToneSchema,
  }),
  run: async (payload) => {
    metadata.set("status", "Generating FAQ section");

    // Generate FAQ sections based on the article title, sections, and context
    const numQuestions = 5; // A reasonable number of questions for an FAQ
    const wordCount = 300; // Moderate length for all FAQ answers combined

    // Craft the prompt
    const promptBase = `Generate ${numQuestions} frequently asked questions and answers for an article titled "${payload.title}"`;
    const sectionsPrompt = ` covering these sections: ${payload.sections.join(", ")}`;
    const contextPrompt = payload.context
      ? ` with this additional context: ${payload.context}`
      : "";
    const stylePrompt = ` The tone should be ${payload.contentTone}.`;
    const formatPrompt = ` Format as a Q&A section with bold questions followed by detailed answers.`;

    const fullPrompt = `${promptBase}${sectionsPrompt}${contextPrompt}.${stylePrompt}${formatPrompt}`;

    // Generate content using OpenAI
    const generatedContent = await generateWithAI(fullPrompt);
    const faqContent = `## Frequently Asked Questions\n\n${generatedContent}`;

    metadata.set("status", "FAQ section generated");
    return { faqContent };
  },
});

// Summary generation subtask
export const generateSummary = schemaTask({
  id: "generate-summary",
  schema: z.object({
    title: z.string(),
    sections: z.array(z.string()),
    context: z.string().optional(),
    contentTone: ContentToneSchema,
  }),
  run: async (payload) => {
    metadata.set("status", "Generating summary");

    // Generate a summary based on the article title, sections, and context
    const wordCount = 150; // Summaries should be concise

    // Craft the prompt
    const promptBase = `Write a concise summary for an article titled "${payload.title}"`;
    const sectionsPrompt = ` that covers these sections: ${payload.sections.join(", ")}`;
    const contextPrompt = payload.context
      ? ` with this additional context: ${payload.context}`
      : "";
    const stylePrompt = ` The tone should be ${payload.contentTone}.`;
    const lengthPrompt = ` The summary should be approximately ${wordCount} words.`;

    const fullPrompt = `${promptBase}${sectionsPrompt}${contextPrompt}.${stylePrompt}${lengthPrompt}`;

    // Generate content using OpenAI
    const generatedContent = await generateWithAI(fullPrompt);
    const summaryContent = `## Summary\n\n${generatedContent}`;

    metadata.set("status", "Summary generated");
    return { summaryContent };
  },
});

// Main task that coordinates all the subtasks
export const generateArticleContent = schemaTask({
  id: "generate-article-content",
  schema: ContentGenerationSchema,
  run: async (payload) => {
    metadata.set("status", "Starting content generation agent");
    metadata.set("article_title", payload.title);
    metadata.set("sections", payload.sections);

    // Calculate the total word count based on the selected length
    let totalWordCount = 0;
    if (payload.parameters.length.short) {
      totalWordCount = Math.floor(Math.random() * (500 - 300 + 1)) + 300; // 300-500 words
      metadata.set("length", "short");
    } else if (payload.parameters.length.medium) {
      totalWordCount = Math.floor(Math.random() * (1200 - 800 + 1)) + 800; // 800-1200 words
      metadata.set("length", "medium");
    } else if (payload.parameters.length.long) {
      totalWordCount = Math.floor(Math.random() * (2000 - 1500 + 1)) + 1500; // 1500-2000 words
      metadata.set("length", "long");
    } else if (payload.parameters.length.superLong) {
      totalWordCount = Math.floor(Math.random() * (3000 - 2500 + 1)) + 2500; // 2500-3000 words
      metadata.set("length", "super long");
    } else {
      // Default to medium if somehow none are selected
      totalWordCount = Math.floor(Math.random() * (1200 - 800 + 1)) + 800;
      metadata.set("length", "medium (default)");
    }

    metadata.set("total_word_count", totalWordCount);

    // Calculate word count for body sections
    // Introduction and conclusion take about 20%, the rest goes to body
    const introAndConclusionWordCount = Math.floor(totalWordCount * 0.2);
    const remainingWordCount = totalWordCount - introAndConclusionWordCount;
    const wordCountPerSection = Math.floor(
      remainingWordCount / payload.sections.length,
    );

    metadata.set("section_word_count", wordCountPerSection);

    // 1. Generate the introduction
    metadata.set("progress", 0.1);
    const introResult = await generateIntroduction.triggerAndWait({
      title: payload.title,
      context: payload.context,
      contentTone: payload.parameters.contentType.contentTone,
      writingStyle: payload.parameters.contentType.writingStyle,
    });

    // Safely access the introduction content
    let articleContent = "";
    if (introResult.ok) {
      articleContent = introResult.output.introduction;
    } else {
      throw new Error(
        `Failed to generate introduction: ${JSON.stringify(introResult)}`,
      );
    }

    metadata.set("progress", 0.2);

    // 2. Generate each body section
    let sectionCount = 0;
    for (const section of payload.sections) {
      sectionCount++;
      const progress = 0.2 + 0.5 * (sectionCount / payload.sections.length);
      metadata.set("progress", progress);

      const sectionResult = await generateBodySection.triggerAndWait({
        sectionTitle: section,
        articleTitle: payload.title,
        context: payload.context,
        contentTone: payload.parameters.contentType.contentTone,
        writingStyle: payload.parameters.contentType.writingStyle,
        format: payload.parameters.format,
        wordCount: wordCountPerSection,
      });

      // Safely access the section content
      if (sectionResult.ok) {
        articleContent += "\n\n" + sectionResult.output.sectionContent;
      } else {
        throw new Error(
          `Failed to generate section '${section}': ${JSON.stringify(sectionResult)}`,
        );
      }
    }

    metadata.set("progress", 0.7);

    // 3. Generate the conclusion
    const conclusionResult = await generateConclusion.triggerAndWait({
      title: payload.title,
      context: payload.context,
      contentTone: payload.parameters.contentType.contentTone,
      writingStyle: payload.parameters.contentType.writingStyle,
    });

    // Safely access the conclusion content
    if (conclusionResult.ok) {
      articleContent += "\n\n" + conclusionResult.output.conclusion;
    } else {
      throw new Error(
        `Failed to generate conclusion: ${JSON.stringify(conclusionResult)}`,
      );
    }

    metadata.set("progress", 0.8);

    // 4. Generate the FAQ section if requested
    if (payload.parameters.options.faqSections) {
      metadata.set("generating", "FAQ section");
      const faqResult = await generateFAQ.triggerAndWait({
        title: payload.title,
        sections: payload.sections,
        context: payload.context,
        contentTone: payload.parameters.contentType.contentTone,
      });

      // Safely access the FAQ content
      if (faqResult.ok) {
        articleContent += "\n\n" + faqResult.output.faqContent;
      } else {
        throw new Error(
          `Failed to generate FAQ section: ${JSON.stringify(faqResult)}`,
        );
      }
    }

    metadata.set("progress", 0.9);

    // 5. Generate the summary if requested
    if (payload.parameters.options.summary) {
      metadata.set("generating", "Summary");
      const summaryResult = await generateSummary.triggerAndWait({
        title: payload.title,
        sections: payload.sections,
        context: payload.context,
        contentTone: payload.parameters.contentType.contentTone,
      });

      // Safely access the summary content
      if (summaryResult.ok) {
        articleContent += "\n\n" + summaryResult.output.summaryContent;
      } else {
        throw new Error(
          `Failed to generate summary: ${JSON.stringify(summaryResult)}`,
        );
      }
    }

    metadata.set("progress", 0.95);
    metadata.set("status", "Editing article");
    const editorResult = await editor.triggerAndWait({
      title: payload.title,
      context: payload.context,
      sections: payload.sections,
      parameters: payload.parameters,
      draft: articleContent,
    });
    metadata.set("progress", 1.0);
    if (editorResult.ok) {
      articleContent = editorResult.output;
    } else {
      throw new Error(
        `Failed to edit article: ${JSON.stringify(editorResult)}`,
      );
    }
    metadata.set("status", "Article generation completed");

    const article = await db
      .update(schema.articles)
      .set({
        content: articleContent,
        status: "completed",
      })
      .where(eq(schema.articles.id, payload.articleId))
      .returning();

    return { article };
  },
});
