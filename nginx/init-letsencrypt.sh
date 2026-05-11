#!/bin/bash
# Run this script once on first deploy to bootstrap Let's Encrypt certificates.
# After certs are issued, use the normal `docker compose up` workflow.
#
# Usage: ./nginx/init-letsencrypt.sh

set -e

DOMAIN="ummbsummer.com"
EMAIL="lukas.karel@astrinbio.com"
STAGING=0  # Set to 1 to use Let's Encrypt staging (no rate limits, for testing)

DATA_PATH="./certbot"

if [ -d "$DATA_PATH/conf/live/$DOMAIN" ]; then
    echo "Certificates already exist for $DOMAIN. Nothing to do."
    exit 0
fi

echo "### Downloading recommended TLS parameters..."
mkdir -p "$DATA_PATH/conf"
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf \
    > "$DATA_PATH/conf/options-ssl-nginx.conf"
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem \
    > "$DATA_PATH/conf/ssl-dhparams.pem"

echo "### Creating dummy certificate for $DOMAIN..."
mkdir -p "$DATA_PATH/conf/live/$DOMAIN"
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm --entrypoint "\
    openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
        -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
        -out    '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
        -subj '/CN=localhost'" certbot

echo "### Starting nginx with dummy certificate..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --detach --wait nginx

echo "### Deleting dummy certificate..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm --entrypoint "\
    rm -rf /etc/letsencrypt/live/$DOMAIN && \
    rm -rf /etc/letsencrypt/archive/$DOMAIN && \
    rm -rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

STAGING_ARG=""
if [ "$STAGING" = "1" ]; then
    STAGING_ARG="--staging"
fi

echo "### Requesting Let's Encrypt certificate for $DOMAIN..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
        $STAGING_ARG \
        --email $EMAIL \
        -d $DOMAIN \
        --rsa-key-size 4096 \
        --agree-tos \
        --force-renewal" certbot

echo "### Reloading nginx..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec nginx nginx -s reload

echo "### Done. Certificates issued for $DOMAIN."
