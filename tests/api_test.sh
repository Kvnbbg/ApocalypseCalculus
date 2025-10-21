#!/bin/bash
set -e
API_URL="http://localhost:8080/index.php"
for level in 1 6 12; do
  echo "Testing level $level..."
  out=$(curl -s -X POST "$API_URL" -H 'Content-Type: application/json' -d "{\"action\":\"getOperation\",\"level\":$level}")
  if command -v jq >/dev/null 2>&1; then
    echo "$out" | jq .
  else
    echo "$out"
  fi
done