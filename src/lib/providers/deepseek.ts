import OpenAI from "openai";
import type { ModelProvider, CompletionRequest, CompletionResponse } from "./base";

export class DeepSeekProvider implements ModelProvider {
  readonly id = "deepseek";
  readonly modelId = "deepseek-chat";
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com",
    });
  }

  async complete(req: CompletionRequest): Promise<CompletionResponse> {
    const maxRetries = 1;
    let lastErr: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const resp = await this.client.chat.completions.create({
          model: this.modelId,
          messages: req.messages,
          temperature: 0,
          max_tokens: req.maxTokens ?? 2000,
          response_format: req.responseFormat === "json_object" ? { type: "json_object" } : undefined,
        });
        const text = resp.choices[0]?.message?.content ?? "";
        return { text, modelId: this.modelId };
      } catch (e) {
        lastErr = e;
        const delay = attempt === 0 ? 200 : 800;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw lastErr;
  }
}
