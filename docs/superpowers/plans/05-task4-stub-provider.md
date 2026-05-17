{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 \
### `impl/05-task4-stub-provider.md`\
```markdown\
# Task 4: StubLocalProvider\
\
## File Created\
- `src/dcr/providers/stub_local.py`\
\
## Key Behavior\
```python\
class StubLocalProvider:\
    name = "stub_local"\
\
    def __init__(self, canned_responses_by_user_prompt: dict[str, dict | str] | None = None):\
        self._canned = canned_responses_by_user_prompt or \{\}\
\
    def complete(self, system_prompt, user_prompt, response_schema, max_tokens,\
                 temperature=0.0, cache_prefix_id=None) -> ProviderResponse:\
        # Known prompt \uc0\u8594  return canned response\
        # Unknown prompt \uc0\u8594  default voluntary-abstention\
        # "__RAISE__" sentinel \uc0\u8594  ProviderError (for error-path tests)\
```\
\
## Features\
- Fixture-driven: returns canned responses keyed by `user_prompt`\
- Unknown prompts \uc0\u8594  default abstention: `\{abstention: True, abstention_reason: "model_voluntary", confidence: 0.0, clause_id: "unknown"\}`\
- `"__RAISE__"` sentinel \uc0\u8594  forces ProviderError\
- Populates all audit fields (model_id="stub-local", model_version="stub-v1", tokens based on word-splits, latency measured)\
- Deterministic: same input \uc0\u8594  same output\
\
## Tests (6 tests)\
- Returns canned response for known prompt\
- Unknown prompt returns default abstention\
- Determinism: same input \uc0\u8594  same output\
- Populates all audit fields\
- Raises ProviderError when configured\
- name attribute = "stub_local"\
```\
\
---
\f1\fs26 \
}