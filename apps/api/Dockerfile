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

RUN groupadd --gid 1000 appuser && \
    useradd --uid 1000 --gid appuser --shell /usr/sbin/nologin appuser

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY --chown=appuser:appuser . .
COPY --chmod=755 entrypoint.sh /app/entrypoint.sh

USER appuser

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
