{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `impl/09-task8-db-setup.md`\
```markdown\
# Task 8: SQLAlchemy Database Setup\
\
## Files Created\
- `src/dcr/store/__init__.py`\
- `src/dcr/store/db.py`\
- `tests/store/__init__.py`\
- `tests/store/test_db.py`\
\
## Implementation\
\
```python\
class Base(DeclarativeBase):\
    """Single declarative base for all ORM models."""\
\
def make_engine(db_url: str = "sqlite:///dcr.db") -> Engine:\
    echo = os.environ.get("SQLALCHEMY_ECHO") == "1"\
    return create_engine(db_url, echo=echo, future=True)\
\
def make_session_factory(engine: Engine):\
    return sessionmaker(bind=engine, expire_on_commit=False, future=True)\
```\
\
## Design Decisions\
- SQLite for dev/MVP\
- Postgres swap is connection-string change: `"postgresql://..."`\
- `expire_on_commit=False` \'97 callers can use returned ORM objects after commit without re-querying\
- `SQLALCHEMY_ECHO=1` env var for debugging\
\
## Tests (4 tests)\
- Engine creation with SQLite :memory: works\
- Session factory yields usable session\
- Base is DeclarativeBase subclass\
- create_all runs without error on empty metadata\
\
Run: `uv run pytest tests/store/test_db.py -v` \uc0\u8594  Expected: 4 PASS\
```\
}