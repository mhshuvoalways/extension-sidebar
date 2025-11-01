import OpenAI from "openai";
import { detectLanguage, languageNameMap } from "./detectLanguage";

interface TranslationOptions {
  sourceLanguage: string; // 'auto' for auto-detect, or a specific language
  targetLanguage: string;
}

interface TranslationParams {
  openai: OpenAI;
  text: string;
  options: TranslationOptions;
  openaiModel: string;
  temperature?: number;
  maxTokens?: number;
}

const TranslateText = async ({
  openai,
  text,
  options,
  openaiModel,
  temperature = 0.3, // Lower temperature for more accurate translations
  maxTokens,
}: TranslationParams): Promise<string> => {
  // Detect source language if set to 'auto'
  const sourceLanguage =
    options.sourceLanguage === "auto"
      ? detectLanguage(text)
      : languageNameMap[options.sourceLanguage];

  // Ensure target language is valid
  if (!languageNameMap[options.targetLanguage]) {
    throw new Error("Invalid target language");
  }

  const targetLanguage = languageNameMap[options.targetLanguage];

  console.log("sourceLanguage:", sourceLanguage);
  console.log("targetLanguage:", targetLanguage);

  // Split the text into chunks
  const chunkSize = 1000; // Adjust this value based on your needs
  const textChunks = splitTextIntoChunks(text, chunkSize);

  // Translate each chunk
  const translatedChunks = await Promise.all(
    textChunks.map(async (chunk) => {
      const calculatedMaxTokens: number =
        maxTokens || Math.min(chunk.split(" ").length * 2, 1000);

      const completion = await openai.chat.completions.create({
        model: openaiModel,
        messages: [
          {
            role: "system",
            content: `You are an advanced AI language translator. Your task is to accurately translate text from ${sourceLanguage} to ${targetLanguage}, preserving the meaning and style of the original text as much as possible.

            Key objectives:
            1. Provide an accurate and fluent translation.
            2. Maintain the original text style, including formality, tone, and structure.
            3. Preserve idiomatic expressions and cultural nuances when possible, or provide suitable equivalents in the target language.
            4. Ensure proper grammar, spelling, and punctuation in the target language.
            5. If certain terms are untranslatable or require explanation, provide a brief note in parentheses.`,
          },
          {
            role: "user",
            content: `Please translate the following text from ${sourceLanguage} to ${targetLanguage}:

            ${chunk}

            Guidelines:
            1. Translate the text accurately, preserving the original meaning and intent.
            2. Maintain the style of the original text (formal, casual, technical, etc.).
            3. If there are culture-specific references or idioms, translate them appropriately or provide explanations if necessary.
            4. Ensure the translation reads naturally in the target language.

            Please provide the translation now:`,
          },
        ],
        temperature: temperature,
        max_tokens: calculatedMaxTokens,
      });
      console.log("translated:", completion.choices[0].message.content);

      return completion.choices[0].message.content || "";
    })
  );

  // Join the translated chunks
  return translatedChunks.join(" ");
};

// Helper function to split text into chunks
function splitTextIntoChunks(text: string, chunkSize: number): string[] {
  const words = text.split(" ");
  const chunks = [];
  let currentChunk = "";

  for (const word of words) {
    if (currentChunk.length + word.length + 1 <= chunkSize) {
      currentChunk += (currentChunk ? " " : "") + word;
    } else {
      chunks.push(currentChunk);
      currentChunk = word;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export default TranslateText;
