#!/bin/bash
# Run this script once on first deploy to bootstrap Let's Encrypt certificates.
# After certs are issued, use the normal `docker compose up` workflow.
#
# Usage: ./nginx/init-letsencrypt.sh

set -e

DOMAIN="ummbsummer.com"
EMAIL="lukas.karel@astrinbio.com"
STAGING=0  # Set to 1 to use Let's Encrypt staging (no rate limits, for testing)

if docker compose --profile prod run --rm \
    --entrypoint "test -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem" certbot; then
    echo "Certificates already exist for $DOMAIN. Nothing to do."
    exit 0
fi

echo "### Creating dummy certificate for $DOMAIN..."
docker compose --profile prod run --rm --entrypoint "\
    mkdir -p /etc/letsencrypt/live/$DOMAIN && \
    openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
        -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
        -out    '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
        -subj '/CN=localhost'" certbot

echo "### Starting nginx with dummy certificate..."
docker compose --profile prod up --detach --wait --build nginx

echo "### Deleting dummy certificate..."
docker compose --profile prod run --rm --entrypoint "\
    rm -rf /etc/letsencrypt/live/$DOMAIN && \
    rm -rf /etc/letsencrypt/archive/$DOMAIN && \
    rm -rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

STAGING_ARG=""
if [ "$STAGING" = "1" ]; then
    STAGING_ARG="--staging"
fi

echo "### Requesting Let's Encrypt certificate for $DOMAIN..."
docker compose --profile prod run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
        $STAGING_ARG \
        --email $EMAIL \
        -d $DOMAIN \
        --agree-tos \
        --force-renewal" certbot

echo "### Reloading nginx..."
docker compose --profile prod exec nginx nginx -s reload

echo "### Done. Certificates issued for $DOMAIN."
