import type {
  QuestionAssistInput,
  QuestionAssistProvider,
  QuestionAssistResult,
} from "@/lib/ai/types";

type OpenAiResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

export class OpenAiQuestionAssistProvider implements QuestionAssistProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly baseUrl: string,
  ) {}

  async provideSecondOpinion(
    input: QuestionAssistInput,
  ): Promise<QuestionAssistResult> {
    const response = await fetch(
      `${this.baseUrl.replace(/\/$/, "")}/responses`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          store: false,
          reasoning: { effort: "low" },
          max_output_tokens: 450,
          instructions:
            "You are a medical study coach giving a second opinion on a practice question. Help the learner reason through the presentation without revealing or implying the correct answer. Do not name an answer option, do not use option letters, and do not say which diagnosis or action is correct. Briefly identify the clinical domain, the discriminating findings, useful mechanisms or differentials to consider, and two self-check questions. State that this is educational support, not medical advice.",
          input: [
            `Question:\n${input.stem}`,
            input.keyPhrases.length
              ? `Author-designated key phrases:\n${input.keyPhrases.join("; ")}`
              : "No author-designated key phrases are available.",
          ].join("\n\n"),
        }),
        signal: AbortSignal.timeout(25_000),
      },
    );

    if (!response.ok) throw new Error("AI provider request failed.");
    const result = (await response.json()) as OpenAiResponse;
    const text =
      result.output_text?.trim() ??
      result.output
        ?.flatMap((item) => item.content ?? [])
        .find((item) => item.type === "output_text")
        ?.text?.trim();
    if (!text) throw new Error("AI provider returned no usable text.");
    return { text, provider: "openai", model: this.model };
  }
}
