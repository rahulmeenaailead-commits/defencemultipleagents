import type { ModelProvider } from "./base";
import { StubProvider } from "./stub";
import { DeepSeekProvider } from "./deepseek";

export function getProvider(): ModelProvider {
  const key = process.env.DEEPSEEK_API_KEY;
  if (key && key.trim().length > 0) {
    return new DeepSeekProvider(key);
  }
  return new StubProvider();
}

export type { ModelProvider } from "./base";
