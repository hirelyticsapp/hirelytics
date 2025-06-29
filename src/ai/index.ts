import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

// Define supported AI providers as a type
export type AIProvider = 'openai' | 'google';

type AIClientOptions = Omit<Parameters<typeof generateText>[0], 'model'>;

type GoogleModelId = Parameters<typeof google>[0];
type OpenAIModelId = Parameters<typeof openai>[0];

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type LooseToStrict<T> = T extends any ? (string extends T ? never : T) : never;

export type GoogleModels = LooseToStrict<GoogleModelId>;
export type OpenAIModels = LooseToStrict<OpenAIModelId>;

// Define a unified model type that supports both providers
export type AIModel =
  | { provider: 'openai'; model: OpenAIModels }
  | { provider: 'google'; model: GoogleModels };

// Default models for each provider
export const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: 'gpt-4o',
  google: 'gemini-2.0-flash-lite',
};

/**
 * Makes an API call to the specified AI provider with the chosen model
 * @param options The AI client configuration options
 * @returns A Promise resolving to the AI client response
 */
export async function callAI(options: {
  provider: AIProvider;
  model?: string;
  options?: AIClientOptions;
}) {
  const { provider, model, options: clientOptions } = options;
  // Choose the model (use default if not provided)
  const selectedModel = model || DEFAULT_MODELS[provider];
  const selectedProvider = provider ?? 'google';
  try {
    switch (selectedProvider) {
      case 'openai':
        return await generateText({
          model: openai(selectedModel as OpenAIModels),
          ...clientOptions,
        });

      case 'google':
        return await generateText({
          model: google(selectedModel as GoogleModels),
          ...clientOptions,
        });
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error creating AI client for ${provider}:`, error);
    throw error;
  }
}
