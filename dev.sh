#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
    kill "${LARAVEL_PID:-}" "${WEB_PID:-}" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

(
    cd "$ROOT_DIR/laravel"
    php artisan serve --host=127.0.0.1 --port=8000
) &
LARAVEL_PID=$!

(
    cd "$ROOT_DIR/web"
    npm run dev -- --host 127.0.0.1 --port 5173
) &
WEB_PID=$!

wait "$WEB_PID"
WEB_EXIT_CODE=$?

cleanup
exit "$WEB_EXIT_CODE"