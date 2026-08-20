import { getServerEnv } from "@/lib/env";
import { OpenAiQuestionAssistProvider } from "@/lib/ai/openai-provider";
import {
  AiProviderNotConfiguredError,
  type QuestionAssistProvider,
} from "@/lib/ai/types";

export function createQuestionAssistProvider(): QuestionAssistProvider {
  const env = getServerEnv();
  if (env.AI_PROVIDER === "openai" && env.OPENAI_API_KEY)
    return new OpenAiQuestionAssistProvider(
      env.OPENAI_API_KEY,
      env.OPENAI_MODEL,
      env.OPENAI_BASE_URL,
    );
  throw new AiProviderNotConfiguredError(
    "AI assistance has not been configured.",
  );
}
