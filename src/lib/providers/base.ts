export type ChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string };

export type CompletionRequest = {
  messages: ChatMessage[];
  /** Most providers honor "json_object" or similar. Implementations are free to ignore. */
  responseFormat?: "json_object" | "text";
  /** Hard cap on output tokens; provider may further cap. */
  maxTokens?: number;
};

export type CompletionResponse = {
  text: string;
  modelId: string;
};

export interface ModelProvider {
  readonly id: string;
  readonly modelId: string;
  complete(req: CompletionRequest): Promise<CompletionResponse>;
}
