# ---- builder (prod deps only) ----
FROM python:3.12-slim AS builder

WORKDIR /build

RUN pip install --upgrade pip uv

COPY pyproject.toml .
RUN uv pip install --system --no-cache-dir .

# ---- test (prod + dev deps) ----
FROM python:3.12-slim AS test

WORKDIR /app

RUN pip install --upgrade pip uv

COPY pyproject.toml .
RUN uv pip install --system --no-cache-dir ".[dev]"

COPY . .

CMD ["pytest", "tests/", "-v"]

# ---- final (prod) ----
FROM python:3.12-slim AS final

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
