#!/usr/bin/env sh
# NEXT — repo hygiene: validate /services/* layout against the Go backend doctrine.
# Read-only. Exits non-zero on layout violations. Safe to run any time.
#
# Required structure for each Go service directory under /services/:
#   cmd/server/
#   internal/api/        OR  internal/handler/   (api preferred)
#   internal/domain/
#   internal/store/
#   migrations/          (optional but recommended; if present must contain *.up.sql + *.down.sql pairs)
#
# Optional but expected for event-emitting services:
#   internal/eventbus/
#   internal/consumer/
#   proto/<domain>/v<N>/
#
# Approved exceptions live in scripts/hygiene/service-exceptions.txt
# (one service name per line — these dirs are skipped).

set -eu

SERVICES_DIR="services"
EXCEPTIONS_FILE="scripts/hygiene/service-exceptions.txt"

if [ ! -d "$SERVICES_DIR" ]; then
    echo "X $SERVICES_DIR/ does not exist"
    exit 1
fi

exceptions=""
if [ -f "$EXCEPTIONS_FILE" ]; then
    exceptions=$(grep -v '^[[:space:]]*#' "$EXCEPTIONS_FILE" | grep -v '^[[:space:]]*$' || true)
fi

is_exception() {
    name=$1
    [ -z "$exceptions" ] && return 1
    printf '%s\n' "$exceptions" | grep -Fxq "$name"
}

violations=0
checked=0

for svc_path in "$SERVICES_DIR"/*/; do
    [ -d "$svc_path" ] || continue
    svc=$(basename "$svc_path")

    case "$svc" in
        node_modules|.*) continue ;;
    esac

    if is_exception "$svc"; then
        echo "-> skip (exception): $svc"
        continue
    fi

    checked=$((checked + 1))
    missing=""

    [ -d "${svc_path}cmd/server" ] || missing="$missing cmd/server"

    if [ ! -d "${svc_path}internal/api" ] && [ ! -d "${svc_path}internal/handler" ]; then
        missing="$missing internal/api"
    fi

    [ -d "${svc_path}internal/domain" ] || missing="$missing internal/domain"
    [ -d "${svc_path}internal/store" ]  || missing="$missing internal/store"

    # migrations: if dir exists, every *.up.sql must have a matching *.down.sql
    if [ -d "${svc_path}migrations" ]; then
        for up in "${svc_path}migrations"/*.up.sql; do
            [ -e "$up" ] || continue
            down=$(printf '%s' "$up" | sed 's/\.up\.sql$/.down.sql/')
            if [ ! -f "$down" ]; then
                echo "X $svc: migration missing companion: $(basename "$up") -> $(basename "$down")"
                violations=$((violations + 1))
            fi
        done
    fi

    if [ -n "$missing" ]; then
        echo "X $svc: missing required dirs:$missing"
        violations=$((violations + 1))
    fi
done

echo ""
echo "Scanned: $checked services, violations: $violations"

if [ "$violations" -gt 0 ]; then
    echo ""
    echo "Approved layout doctrine: see docs/git/generated-code-policy.md and"
    echo "the Go Backend Directive in .github/instructions/."
    echo "If a service legitimately deviates, add its name to:"
    echo "  $EXCEPTIONS_FILE"
    exit 1
fi

exit 0
