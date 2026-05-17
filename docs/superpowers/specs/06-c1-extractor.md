{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ## `spec/06-c1-extractor.md`\
```markdown\
# Component C1 \'97 Extractor\
\
## Role\
First pass of the two-pass pipeline. Proposes risk findings from clause text + concepts + regulatory snippets.\
\
## Input\
- Assembled prompt (clause text + concepts + top-K reg snippets + taxonomy + rule library + abstention protocol)\
\
## Output\
- Structured JSON conforming to the risk-finding schema\
- Enforced via constrained decoding (tool-use on Anthropic; `response_format` on OpenAI-compatible; Outlines/xgrammar on local)\
\
## Behavior\
- Zero prose outside the schema\
- If mandatory fields cannot be filled, sets `abstention=true` with `abstention_reason`\
\
## Retry Policy\
- 1 retry on schema validation failure with parse error appended\
- Second failure \uc0\u8594  automatic abstention\
\
## System Prompt\
- Versioned: `prompts/extractor.v1.md`\
- Every finding's audit row references the version\
\
## Model\
- **Production:** Claude Opus 4.7 (via AnthropicProvider)\
- **Temperature:** 0.0 (determinism contract)\
```\
}