{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `impl/03-task2-risk-schema.md`\
```markdown\
# Task 2: Risk-Finding Schema (Pydantic Models)\
\
## Files Created\
- `src/dcr/schema/__init__.py`\
- `src/dcr/schema/risk_finding.py`\
- `tests/schema/__init__.py`\
- `tests/schema/test_risk_finding.py`\
\
## Key Models\
\
### Enums\
```python\
class Severity(str, Enum):\
    LOW = "low"\
    MED = "med"\
    HIGH = "high"\
    CRITICAL = "critical"\
\
class Likelihood(str, Enum):\
    LOW = "low"\
    MED = "med"\
    HIGH = "high"\
\
class Negotiability(str, Enum):\
    EASY = "easy"\
    HARD = "hard"\
    FIXED_BY_STATUTE = "fixed-by-statute"\
\
class Urgency(str, Enum):\
    BEFORE_SIGNATURE = "before_signature"\
    WITHIN_30_DAYS = "within_30_days"\
    AT_NEXT_MOD = "at_next_mod"\
\
class AbstentionReason(str, Enum):\
    LOW_SELF_CONFIDENCE = "low_self_confidence"\
    MODEL_VOLUNTARY = "model_voluntary"\
    SCHEMA_VALIDATION_FAILED = "schema_validation_failed"\
    INVENTED_OR_PARAPHRASED_EVIDENCE = "invented_or_paraphrased_evidence"\
    MISSING_REQUIRED_REG_CITATION = "missing_required_reg_citation"\
    UNGROUNDED_REG_CITATION = "ungrounded_reg_citation"\
    REG_VERSION_MISMATCH = "reg_version_mismatch"\
    HIGH_SEVERITY_LOW_CONFIDENCE = "high_severity_low_confidence"\
    CATEGORY_DISAGREEMENT = "category_disagreement"\
```\
\
### Core Models\
```python\
class TextSpan(BaseModel):\
    model_config = ConfigDict(extra="forbid")\
    quote: str\
    char_start: int = Field(..., ge=0)\
    char_end: int = Field(..., ge=0)\
    page: int = Field(..., ge=0)\
    section: str\
\
class RegulatoryCitation(BaseModel):\
    model_config = ConfigDict(extra="forbid")\
    reg_id: str\
    section: str\
    version_date: str\
    version_hash: str\
\
class Evidence(BaseModel):\
    model_config = ConfigDict(extra="forbid")\
    text_spans: list[TextSpan] = Field(..., min_length=1)\
    regulatory_citations: list[RegulatoryCitation] = Field(default_factory=list)\
    reasoning: str\
\
class Action(BaseModel):\
    model_config = ConfigDict(extra="forbid")\
    plain_language: str\
    redline_suggestion: str\
    urgency: Urgency\
\
class Finding(BaseModel):\
    model_config = ConfigDict(extra="forbid")\
    clause_id: str\
    category_id: int = Field(..., ge=1, le=15)\
    rule_id: str\
    severity: Severity\
    likelihood: Likelihood\
    negotiability: Negotiability\
    composite_score: int = Field(..., ge=0, le=100)\
    evidence: Evidence\
    action: Action\
    confidence: float = Field(..., ge=0.0, le=1.0)\
    abstention: Literal[False] = False\
    abstention_reason: None = None\
\
class AbstainedFinding(BaseModel):\
    model_config = ConfigDict(extra="forbid")\
    clause_id: str\
    abstention: Literal[True] = True\
    abstention_reason: AbstentionReason\
    confidence: float = Field(..., ge=0.0, le=1.0)\
    raw_draft: dict | None = None\
```\
\
## Tests (10 tests)\
- Valid finding parses correctly\
- Finding requires \uc0\u8805 1 text_span\
- category_id must be 1\'9615\
- composite_score must be 0\'96100\
- confidence must be 0\'961\
- severity is closed enum\
- AbstainedFinding parses correctly\
- abstention_reason is closed enum\
- JSON schema export includes required fields\
- regulatory_citations defaults to empty list\
\
Run: `uv run pytest tests/schema/test_risk_finding.py -v` \uc0\u8594  Expected: 10 PASS\
```\
}