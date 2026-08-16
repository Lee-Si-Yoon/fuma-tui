#!/usr/bin/env bash
# One-time local setup.
#
# Installs: Node deps, git pre-commit hook, Vale, glossary-authoring skill.
#
# Usage:
#   bash scripts/setup.sh         # full setup
#   bash scripts/setup.sh --check # verify prerequisites, exit 1 if missing
#
# Prerequisites: pnpm >= 9, Node >= 20
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

CHECK_ONLY=false
[[ "${1:-}" == "--check" ]] && CHECK_ONLY=true

ok()   { printf "  \033[32m✓\033[0m %s\n" "$1"; }
miss() { printf "  \033[31m✗\033[0m %s\n" "$1"; FAILURES=$((FAILURES + 1)); }
warn() { printf "  \033[33m⚠\033[0m %s\n" "$1"; }
step() { printf "\n\033[1m→ %s\033[0m\n" "$1"; }

FAILURES=0

# 1. Node deps
step "Node dependencies"
if [[ "$CHECK_ONLY" == true ]]; then
	[[ -d node_modules ]] && ok "node_modules exists" || miss "run \`pnpm install\`"
else
	pnpm install
	ok "pnpm install complete"
fi

# 2. Git hooks
step "Git pre-commit hook"
HOOK="$(git rev-parse --git-dir)/hooks/pre-commit"
if [[ "$CHECK_ONLY" == true ]]; then
	[[ -x "$HOOK" ]] && grep -q "sync-frontmatter" "$HOOK" 2>/dev/null && ok "installed" || miss "run \`bash scripts/install-hooks.sh\`"
else
	bash scripts/install-hooks.sh
fi

# 3. Vale
step "Vale prose linter"
if command -v vale &>/dev/null; then
	ok "vale $(vale --version 2>/dev/null | head -1)"
elif [[ "$CHECK_ONLY" == true ]]; then
	miss "vale not found"
else
	warn "vale not found, installing..."
	if command -v brew &>/dev/null; then
		brew install vale
	else
		VALE_VER="3.12.0"
		ARCH="$(uname -m)"
		case "$ARCH" in
			x86_64)       ARCH="64-bit" ;;
			aarch64|arm64) ARCH="arm64" ;;
		esac
		URL="https://github.com/errata-ai/vale/releases/download/v${VALE_VER}/vale_${VALE_VER}_Linux_${ARCH}.zip"
		curl -sL "$URL" -o /tmp/vale.zip
		unzip -o /tmp/vale.zip -d /tmp/vale_bin >/dev/null 2>&1
		sudo mv /tmp/vale_bin/vale /usr/local/bin/vale
		chmod +x /usr/local/bin/vale
		rm -f /tmp/vale.zip && rm -rf /tmp/vale_bin
	fi
	command -v vale &>/dev/null && ok "vale installed" || miss "install manually from https://vale.sh"
fi

# 4. glossary-authoring skill
step "glossary-authoring skill"
SKILL_DIR="$(git rev-parse --show-toplevel)/skills/glossary-authoring"
if [[ "$CHECK_ONLY" == true ]]; then
	npx skills list 2>/dev/null | grep -q "glossary-authoring" && ok "installed" || miss "run \`npx skills add $SKILL_DIR\`"
else
	npx skills add "$SKILL_DIR" -y && ok "glossary-authoring installed" || warn "skipped (npx skills not available)"
fi

# 5. Summary
step "Tools available"
for tool in pnpm node biome rumdl vale; do
	if command -v "$tool" &>/dev/null; then
		ok "$tool"
	elif npx "$tool" --version &>/dev/null 2>&1; then
		ok "$tool (via npx)"
	else
		miss "$tool"
	fi
done

if [[ "$CHECK_ONLY" == true ]]; then
	if [[ "$FAILURES" -gt 0 ]]; then
		echo -e "\n\033[31m✗ $FAILURES prerequisite(s) missing. Run \`bash scripts/setup.sh\` to fix.\033[0m"
		exit 1
	fi
	echo -e "\n\033[32m✓ All prerequisites satisfied.\033[0m"
else
	echo -e "\n\033[1mSetup complete.\033[0m"
	echo "  pnpm lint:all     # run every linter + typecheck in one pass"
	echo "  pnpm dev          # start dev server"
fi
