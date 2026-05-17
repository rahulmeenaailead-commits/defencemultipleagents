{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `impl/07-task6-anthropic-provider.md`\
```markdown\
# Task 6: AnthropicProvider (with mocked unit tests)\
\
## File Created\
- `src/dcr/providers/anthropic_provider.py`\
\
## Key Implementation\
\
```python\
PRICING_PER_MTOK = \{\
    "claude-opus-4-7": \{"input": 15.00, "output": 75.00, "cache_read": 1.50\},\
    "claude-sonnet-4-6": \{"input": 3.00, "output": 15.00, "cache_read": 0.30\},\
    "claude-haiku-4-5-20251001": \{"input": 1.00, "output": 5.00, "cache_read": 0.10\},\
\}\
\
class AnthropicProvider:\
    def __init__(self, model_id="claude-opus-4-7", api_key=None):\
        self.model_id = model_id\
        self.name = f"anthropic:\{model_id\}"\
        self._client = Anthropic(api_key=api_key or os.environ.get("ANTHROPIC_API_KEY"))\
\
    def complete(self, system_prompt, user_prompt, response_schema, max_tokens,\
                 temperature=0.0, cache_prefix_id=None) -> ProviderResponse:\
        # Uses tool_use for schema enforcement\
        # tool_choice forces "submit_finding" tool\
        # Extracts parsed from tool_use.input\
        # Calculates cost from PRICING_PER_MTOK\
        # Raises ProviderError if no tool_use block\
```\
\
## Design Decisions\
- **Schema enforcement:** tool_use + tool_choice (most reliable JSON-shape enforcement from Claude)\
- **Cost calculation:** per-model rate table; unknown models return None\
- **model_version:** set to Anthropic's message ID for reproducibility\
\
## Tests (6 tests, all mocked)\
- Returns parsed from tool_use block\
- Calls Anthropic with tool_use for schema enforcement\
- Cost calculation for Opus (1M input + 1M output)\
- Cost calculation with cache reads\
- cost_usd returns None for unknown model\
- Raises ProviderError when no tool_use block\
\
Run: `uv run pytest tests/providers/test_anthropic_provider.py -v` \uc0\u8594  Expected: 6 PASS\
```\
}