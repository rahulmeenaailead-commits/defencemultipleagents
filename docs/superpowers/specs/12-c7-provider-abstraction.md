{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 \
### `spec/12-c7-provider-abstraction.md`\
```markdown\
# Component C7 \'97 Model Provider Abstraction (Goal 2 Hinge)\
\
Every LLM call in Sub-project C goes through this single interface.\
\
## Protocol\
```python\
class ModelProvider(Protocol):\
    def complete(\
        self,\
        system_prompt: str,\
        user_prompt: str,\
        response_schema: dict,\
        max_tokens: int,\
        temperature: float = 0.0,\
        cache_prefix_id: str | None = None,\
    ) -> ProviderResponse: ...\
\
class ProviderResponse(TypedDict):\
    parsed: dict\
    raw_text: str\
    model_id: str\
    model_version: str\
    input_tokens: int\
    output_tokens: int\
    cached_tokens: int\
    latency_ms: int\
    cost_usd: float | None       # None for local\
    provider_name: str\
```\
\
## Implementations\
\
| Provider | When | Notes |\
|---|---|---|\
| `AnthropicProvider` | MVP, pilots, test | Claude Opus 4.7 Extractor, Sonnet 4.6 Verifier; prompt caching |\
| `StubLocalProvider` | Always (test fixture) | Proves interface is provider-agnostic |\
| `LocalProvider` | Goal-2 cutover | vLLM endpoint + Outlines/xgrammar constrained generation |\
| `OpenAICompatibleProvider` | Optional | Azure OpenAI / on-prem gateways |\
\
## Five Disciplines Keeping the Swap a Config Change\
\
1. No provider-specific types leak out of `providers/`\
2. Schema enforcement is provider responsibility, not caller responsibility\
3. Determinism (temperature=0.0) is a contract honored by every provider\
4. Prompts are provider-agnostic (plain English; no model-specific framing)\
5. Conformance test suite is a merge gate for new providers\
```\
}