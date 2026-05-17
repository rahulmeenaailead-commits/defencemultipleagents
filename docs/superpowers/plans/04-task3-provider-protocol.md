{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `impl/04-task3-provider-protocol.md`\
```markdown\
# Task 3: Provider Protocol + ProviderResponse + ProviderError\
\
## Files Created\
- `src/dcr/providers/__init__.py`\
- `src/dcr/providers/base.py`\
- `tests/providers/__init__.py`\
- `tests/providers/test_base.py`\
\
## Key Types\
\
```python\
class ProviderError(Exception):\
    """Raised by provider implementations on unrecoverable failures."""\
\
class ProviderResponse(BaseModel):\
    model_config = ConfigDict(extra="forbid")\
    parsed: dict\
    raw_text: str\
    model_id: str\
    model_version: str\
    input_tokens: int\
    output_tokens: int\
    cached_tokens: int = 0\
    latency_ms: int\
    cost_usd: float | None  # None for local providers\
    provider_name: str\
\
@runtime_checkable\
class ModelProvider(Protocol):\
    name: str\
\
    def complete(\
        self,\
        system_prompt: str,\
        user_prompt: str,\
        response_schema: dict,\
        max_tokens: int,\
        temperature: float = 0.0,\
        cache_prefix_id: str | None = None,\
    ) -> ProviderResponse: ...\
```\
\
## Tests (6 tests)\
- ProviderResponse requires all audit fields\
- cost_usd may be None\
- Rejects missing provider_name\
- ProviderError is Exception subclass\
- ModelProvider is runtime-checkable protocol\
- Non-conforming class is not a provider\
\
Run: `uv run pytest tests/providers/test_base.py -v` \uc0\u8594  Expected: 6 PASS\
```\
}