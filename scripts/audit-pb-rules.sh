#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BOLD='\033[1m'
RESET='\033[0m'

PB_URL="${PB_URL:-http://localhost:8090}"

if [ -z "${PB_EMAIL:-}" ]; then
  read -rp "Admin email: " PB_EMAIL
fi
if [ -z "${PB_PASSWORD:-}" ]; then
  read -rsp "Admin password: " PB_PASSWORD
  echo
fi

echo
echo -e "${BOLD}Connecting to $PB_URL...${RESET}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$PB_URL/api/collections/_superusers/auth-with-password" \
  -H "Content-Type: application/json" \
  -d "{\"identity\":\"$PB_EMAIL\",\"password\":\"$PB_PASSWORD\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
  echo -e "${RED}Authentication failed (HTTP $HTTP_CODE)${RESET}"
  echo "$BODY" | jq -r '.message // "Unknown error"'
  exit 1
fi

TOKEN=$(echo "$BODY" | jq -r '.token // .data.token')
echo -e "${GREEN}✓ Authenticated${RESET}"
echo

COLLECTIONS=$(curl -s "$PB_URL/api/collections?perPage=200" \
  -H "Authorization: $TOKEN")

TOTAL=$(echo "$COLLECTIONS" | jq '.totalItems')
echo -e "${BOLD}Auditing $TOTAL collections...${RESET}"
echo "────────────────────────────────────────────────────"

OPEN_ISSUES=0
WARN_ISSUES=0

while IFS= read -r col; do
  NAME=$(echo "$col" | jq -r '.name')
  TYPE=$(echo "$col" | jq -r '.type')
  HAS_ISSUE=0

  LINES=()
  for RULE in listRule viewRule createRule updateRule deleteRule; do
    VALUE=$(echo "$col" | jq -r ".$RULE")

    if [ "$VALUE" = "" ]; then
      LINES+=("  ${RED}✗ $RULE: open — allows everyone (empty rule)${RESET}")
      OPEN_ISSUES=$((OPEN_ISSUES + 1))
      HAS_ISSUE=1
    elif [ "$VALUE" = "null" ]; then
      LINES+=("  ${GREEN}✓ $RULE: locked (admin only)${RESET}")
    elif echo "$VALUE" | grep -q "@request.auth"; then
      LINES+=("  ${GREEN}✓ $RULE: $VALUE${RESET}")
    else
      LINES+=("  ${YELLOW}⚠ $RULE: $VALUE (no auth check — verify this is intentional)${RESET}")
      WARN_ISSUES=$((WARN_ISSUES + 1))
      HAS_ISSUE=1
    fi
  done

  # Only print collections that have at least one issue, unless -v flag is set
  if [ "$HAS_ISSUE" -eq 1 ] || [ "${VERBOSE:-0}" = "1" ]; then
    echo
    if [ "$HAS_ISSUE" -eq 1 ]; then
      echo -e "${BOLD}${RED}$NAME${RESET} ${BOLD}(${TYPE})${RESET}"
    else
      echo -e "${BOLD}$NAME${RESET} (${TYPE})"
    fi
    for line in "${LINES[@]}"; do
      echo -e "$line"
    done
  fi
done < <(echo "$COLLECTIONS" | jq -c '.items[]')

echo
echo "────────────────────────────────────────────────────"
TOTAL_ISSUES=$((OPEN_ISSUES + WARN_ISSUES))

if [ "$TOTAL_ISSUES" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✓ All $TOTAL collections look good${RESET}"
else
  [ "$OPEN_ISSUES" -gt 0 ] && echo -e "${RED}${BOLD}✗ $OPEN_ISSUES open rule(s) — allow unauthenticated access${RESET}"
  [ "$WARN_ISSUES" -gt 0 ] && echo -e "${YELLOW}${BOLD}⚠ $WARN_ISSUES rule(s) without auth check — review manually${RESET}"
  echo
  echo -e "Fix open rules in the PocketBase admin UI: ${BOLD}$PB_URL/_/${RESET}"
fi

echo
echo -e "Tip: run with ${BOLD}VERBOSE=1 $0${RESET} to show all collections including clean ones."
