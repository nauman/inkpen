#!/usr/bin/env bash
# Set a GitHub Actions secret via stdin only.
#
# Guard against this footgun:
#
#   VAR='rubygems_xxx' gh secret set RUBYGEMS_API_KEY --body "$VAR" -R repo
#
# The parent shell expands $VAR BEFORE the inline assignment takes
# effect, so $VAR is unset/empty and the secret gets set to "".
# `gh secret list` shows the entry exists (with the right name and
# timestamp), but the workflow consuming it gets an empty string,
# fails obscurely, and you spend 10 minutes wondering what's wrong.
#
# This wrapper refuses --body and reads the secret value from stdin.
# Document lesson + guard added 2026-05-16 after the 0.8.0 release
# fight (see 01-inventlist/docs/agents/inkpen.agent.md "Lessons
# learned" → "Shell single-line env-var prefix doesn't expand").
#
# Usage:
#   echo -n "rubygems_xxx" | scripts/set-secret.sh RUBYGEMS_API_KEY [-R nauman/inkpen]
#   printf '%s' "$(security find-generic-password -s rubygems -w)" \
#     | scripts/set-secret.sh RUBYGEMS_API_KEY -R nauman/inkpen
#
# After setting, the script verifies by listing the secret (name only,
# value not exposed). A confirmation timestamp means the secret is set
# (but does not prove the value is non-empty — see Lesson 2 in the
# agent doc).

set -euo pipefail

if [ "$#" -lt 1 ]; then
  cat >&2 <<'EOF'
usage: scripts/set-secret.sh SECRET_NAME [-R owner/repo]

The value MUST be supplied on stdin. Do not use --body; it is rejected.

example:
  printf '%s' "$TOKEN" | scripts/set-secret.sh RUBYGEMS_API_KEY -R nauman/inkpen
EOF
  exit 1
fi

# Refuse --body anywhere in args
for arg in "$@"; do
  case "$arg" in
    --body|--body=*|--body-file|--body-file=*)
      echo "error: --body / --body-file are disallowed; pipe the value on stdin instead" >&2
      echo "       (this guard exists because shell single-line env-var prefixes don't" >&2
      echo "        expand for the same command — see docs/agents/inkpen.agent.md Lesson 1)" >&2
      exit 2
      ;;
  esac
done

# Refuse a tty on stdin — caller forgot to pipe a value
if [ -t 0 ]; then
  echo "error: no value piped on stdin" >&2
  echo "       did you forget the pipe? example:" >&2
  echo "       printf '%s' \"\$TOKEN\" | scripts/set-secret.sh $* " >&2
  exit 3
fi

# Read once into a variable so we can length-check before pushing
value=$(cat)

if [ -z "$value" ]; then
  echo "error: stdin was empty — refusing to set $1 to an empty string" >&2
  echo "       (this is exactly the bug this script exists to prevent)" >&2
  exit 4
fi

# Length check: helpful sanity (rubygems tokens are 60+ chars)
echo "set-secret: piping ${#value} bytes to gh secret set $*" >&2

printf '%s' "$value" | gh secret set "$@"

echo "set-secret: verifying via gh secret list…" >&2
gh secret list "${@:2}" | grep -F "$1" || {
  echo "error: secret $1 was not listed after set" >&2
  exit 5
}

echo "set-secret: ok" >&2
