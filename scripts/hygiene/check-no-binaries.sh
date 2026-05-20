#!/usr/bin/env sh
# NEXT — repo hygiene: refuse to commit binary/archive artifacts.
# Runs in the husky pre-commit hook against staged additions only.
# Read-only; emits a non-zero exit and a human-readable report on violations.

set -eu

# Extensions we never want committed. Add to this list as new artifacts appear.
BLOCKED_EXTENSIONS_REGEX='\.(exe|dll|so|dylib|bin|zip|tar|gz|tgz|7z|rar|class|jar|wasm|node|o|a|lib|pdb|dmg|iso|mp4|mov|webm|mp3|psd|sketch)$'

# Soft size threshold (bytes). Files larger than this in staged additions get flagged.
SIZE_WARN_BYTES=${SIZE_WARN_BYTES:-1048576}  # 1 MiB

staged_added=$(git diff --cached --name-only --diff-filter=AM 2>/dev/null || true)

if [ -z "$staged_added" ]; then
    exit 0
fi

rm -f .git/.hygiene-violations .git/.hygiene-warnings

echo "$staged_added" | while IFS= read -r path; do
    [ -z "$path" ] && continue
    [ ! -f "$path" ] && continue

    lower=$(printf '%s' "$path" | tr '[:upper:]' '[:lower:]')

    if printf '%s' "$lower" | grep -Eq "$BLOCKED_EXTENSIONS_REGEX"; then
        printf 'BLOCKED  %s\n' "$path" >> .git/.hygiene-violations
    fi

    # Use wc -c for portable byte size on git-bash / *nix.
    size=$(wc -c < "$path" 2>/dev/null | tr -d ' ' || echo 0)
    if [ "${size:-0}" -gt "$SIZE_WARN_BYTES" ]; then
        printf 'LARGE    %s  (%s bytes)\n' "$path" "$size" >> .git/.hygiene-warnings
    fi
done

rc=0

if [ -s .git/.hygiene-violations ]; then
    echo ""
    echo "X Repo hygiene: blocked binary/archive files in staged commit:"
    echo ""
    sed 's/^/    /' .git/.hygiene-violations
    echo ""
    echo "  These extensions are forbidden by NEXT repo policy:"
    echo "    exe, dll, so, dylib, bin, zip, tar, gz, tgz, 7z, rar,"
    echo "    class, jar, wasm, node, o, a, lib, pdb, dmg, iso,"
    echo "    mp4, mov, webm, mp3, psd, sketch"
    echo ""
    echo "  If you genuinely need to commit one of these, escalate to Claude"
    echo "  (architecture branch owner) and add an explicit .gitignore"
    echo "  exception with a tracked review note."
    echo ""
    rc=1
fi

if [ -s .git/.hygiene-warnings ]; then
    echo ""
    echo "! Repo hygiene: large files staged (>${SIZE_WARN_BYTES} bytes):"
    echo ""
    sed 's/^/    /' .git/.hygiene-warnings
    echo ""
    echo "  Large files are not blocked, but verify they are not build"
    echo "  output, fixtures bloat, or accidentally captured logs."
    echo ""
fi

rm -f .git/.hygiene-violations .git/.hygiene-warnings

exit $rc
