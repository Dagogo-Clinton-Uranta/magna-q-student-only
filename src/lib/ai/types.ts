export type QuestionAssistInput = {
  stem: string;
  keyPhrases: string[];
};

export type QuestionAssistResult = {
  text: string;
  provider: string;
  model: string;
};

export interface QuestionAssistProvider {
  provideSecondOpinion(
    input: QuestionAssistInput,
  ): Promise<QuestionAssistResult>;
}

export class AiProviderNotConfiguredError extends Error {}
