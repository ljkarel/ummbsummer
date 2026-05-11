FROM python:3.13-slim AS base

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

FROM base AS dev
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

FROM base AS prod
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["gunicorn", "ummbsummer.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]
