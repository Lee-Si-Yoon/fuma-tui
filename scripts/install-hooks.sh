#!/usr/bin/env bash
# Install git hooks for the docs repo.
# Run: bash scripts/install-hooks.sh
set -euo pipefail

HOOK_DIR="$(git rev-parse --git-dir)/hooks"
HOOK="$HOOK_DIR/pre-commit"

cat > "$HOOK" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

# Run from repo root.
cd "$(git rev-parse --show-toplevel)"

echo "→ Stamping frontmatter (author + timestamps)..."
pnpm exec tsx scripts/sync-frontmatter.ts

echo "→ Running frontmatter lint (required fields)..."
pnpm lint:frontmatter

echo "→ Running hierarchy lint (parent→child wikilinks)..."
pnpm lint:hierarchy
EOF

chmod +x "$HOOK"
echo "✓ Installed pre-commit hook → $HOOK"
