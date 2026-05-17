{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `spec/21-success-criteria.md`\
```markdown\
# Success Criteria for "MVP Done"\
\
All must hold:\
\
1. **Hallucination rate < 1%** per category and overall on golden dataset (release gate)\
2. **Recall \uc0\u8805  80%** per category against golden dataset\
3. **Abstention precision \uc0\u8805  70%** (when we abstain, it's actually ambiguous)\
4. **End-to-end p95 latency \uc0\u8804  30s per clause**\
5. **Determinism replay 100% pass** on 50-finding sample\
6. **Provider conformance suite passes** on `AnthropicProvider` and `StubLocalProvider`\
7. **Cost \uc0\u8804  $5\'9615 per typical 50-clause critical-section analysis** (finalize during M7)\
\
Any failure \uc0\u8594  iterate, don't ship.\
```\
}