#!/bin/sh
set -e

python manage.py migrate --noinput

if [ "$DJANGO_DEBUG" != "True" ]; then
    python manage.py collectstatic --noinput
fi

exec "$@"
