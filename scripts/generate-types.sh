#!/bin/sh

source .env

npx pocketbase-typegen --url $POCKETBASE_URL --email $POCKETBASE_ADMIN_EMAIL --password $POCKETBASE_ADMIN_PASSWORD --out ./shared/types/pocketbase.ts