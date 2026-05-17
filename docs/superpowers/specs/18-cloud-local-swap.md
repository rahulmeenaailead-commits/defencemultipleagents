{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `spec/18-cloud-local-swap.md`\
```markdown\
# Provider Abstraction \'97 Cloud \uc0\u8594  Local Swap (Goal 2)\
\
## Goal\
Switch from cloud to local model after MVP testing for DoD data-residency compliance. Must be a **configuration change**, not a refactor.\
\
## Goal-2 Cutover Playbook\
\
1. Select local model (Llama 3.3 70B Instruct or Qwen 2.5 72B at MVP scale)\
2. Deploy vLLM in customer environment (on-prem GPU or air-gapped VM)\
3. Implement `LocalProvider` against vLLM endpoint with constrained generation\
4. Pass full provider conformance suite (merge gate)\
5. Flip config: `MODEL_PROVIDER=local`\
6. Re-run eval harness; hallucination rate < 1% must hold\
   - If not: tune prompts, upgrade local model, or surface to customer\
7. Customer cutover\
\
## Hybrid Modes (supported by config)\
- Cloud Extractor + local Verifier\
- Local Extractor + cloud Verifier\
- Dual-cloud (MVP default)\
- Dual-local (Goal-2 endpoint)\
\
## Conformance Suite Guarantee\
Every `ModelProvider` implementation must pass `tests/providers/conformance/`. New providers don't merge without passing.\
```\
}