{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `impl/02-task1-project-init.md`\
```markdown\
# Task 1: Project Initialization + Sanity Test\
\
## Files Created\
- `pyproject.toml`\
- `.python-version`\
- `src/dcr/__init__.py`\
- `tests/__init__.py`\
- `tests/conftest.py`\
- `tests/test_sanity.py`\
\
## Step 1: Failing Test\
```python\
# tests/test_sanity.py\
import dcr\
\
def test_package_imports():\
    assert dcr.__version__ == "0.1.0"\
```\
\
Run: `uv run pytest tests/test_sanity.py -v` \uc0\u8594  Expected FAIL: ModuleNotFoundError\
\
## Step 2: Implementation\
\
### `.python-version`\
```\
3.12\
```\
\
### `pyproject.toml`\
```toml\
[project]\
name = "dcr"\
version = "0.1.0"\
description = "Defense Contract Reviewer \'97 per-clause risk + explainability engine (Sub-project C)"\
requires-python = ">=3.12"\
dependencies = [\
    "pydantic>=2.7",\
    "sqlalchemy>=2.0",\
    "anthropic>=0.40",\
]\
\
[project.optional-dependencies]\
dev = [\
    "pytest>=8.0",\
    "pytest-cov>=5.0",\
    "ruff>=0.5",\
    "mypy>=1.10",\
]\
\
[build-system]\
requires = ["hatchling"]\
build-backend = "hatchling.build"\
\
[tool.hatch.build.targets.wheel]\
packages = ["src/dcr"]\
\
[tool.pytest.ini_options]\
testpaths = ["tests"]\
addopts = "-ra --strict-markers"\
markers = [\
    "integration: hits real external services (e.g., Anthropic API); skipped by default",\
]\
\
[tool.ruff]\
line-length = 100\
target-version = "py312"\
\
[tool.mypy]\
python_version = "3.12"\
strict = true\
files = ["src/dcr"]\
```\
\
### `src/dcr/__init__.py`\
```python\
__version__ = "0.1.0"\
```\
\
### `tests/__init__.py` (empty)\
```python\
```\
\
### `tests/conftest.py`\
```python\
"""Shared pytest fixtures."""\
```\
\
## Step 3: Verify\
```bash\
uv sync --extra dev\
uv run pytest tests/test_sanity.py -v\
```\
Expected: PASS \'97 `test_package_imports PASSED`\
```\
\
---
\f1\fs26 \
}