#!/usr/bin/env bash
# Puts _08_TheSlience on GitHub with one commit and one tag per released version,
# so the repository history mirrors versions/ (v0.4.0, v0.5.0, v0.6.0).
# Run once, from inside this folder:   bash publish_to_github.sh
set -euo pipefail
cd "$(dirname "$0")"

REPO_NAME="${1:-petals-time}"
VISIBILITY="${2:-private}"          # private or public

if [ -d .git ]; then
  echo "This folder is already a git repository. Nothing to set up; use git add / commit / push as usual."
  exit 1
fi
if ! git config user.name >/dev/null || ! git config user.email >/dev/null; then
  echo "Set your git identity first:"
  echo '  git config --global user.name  "Your Name"'
  echo '  git config --global user.email "you@example.com"   (use the email on your GitHub account)'
  exit 1
fi

git init -q -b main

git add .gitignore .nojekyll PETALS_TIME_SPEC.md references versions/0.4.0
git commit -q -m "PETALS / TIME 0.4.0: first WebGL2 renderer"
git tag -a v0.4.0 -m "Renderer 0.4.0"

git add versions/0.5.0
git commit -q -m "PETALS / TIME 0.5.0: gladiolus family and family selector"
git tag -a v0.5.0 -m "Renderer 0.5.0"

git add -A
git commit -q -m "PETALS / TIME 0.6.0: birthday and birth time form the seed; version router, docs"
git tag -a v0.6.0 -m "Renderer 0.6.0"

echo "Local repository ready:"
git log --oneline --decorate

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  gh repo create "$REPO_NAME" --"$VISIBILITY" --source=. --remote=origin --push
  git push -q origin --tags
  OWNER="$(gh api user -q .login)"
  echo "Pushed to GitHub: https://github.com/$OWNER/$REPO_NAME"

  # Turn on GitHub Pages (main branch, root folder) and print demo links.
  if gh api --method POST "repos/$OWNER/$REPO_NAME/pages" -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1; then
    SITE="https://$OWNER.github.io/$REPO_NAME/"
    echo
    echo "GitHub Pages is building. In about a minute the demo is live at:"
    echo "  $SITE"
    echo
    echo "Demo links (press Play or the space bar once open):"
    echo "  Gladiolus, seed G3, Now         ${SITE}#seed=G3&family=2&age=7301&v=0.6.0"
    echo "  Same organism, -20 years        ${SITE}#seed=G3&family=2&age=1&v=0.6.0"
    echo "  Same organism, +20 years        ${SITE}#seed=G3&family=2&age=14601&v=0.6.0"
    echo "  Birthday seed, 2000-01-01 00:00 ${SITE}#birth=2000-01-01T00:00&family=2&age=7301&v=0.6.0"
    echo "  Fibre x-ray, seed T5            ${SITE}#seed=T5&family=4&age=7301&v=0.6.0"
    echo "  Mixed family, seed K1           ${SITE}#seed=K1&family=-1&age=7301&v=0.6.0"
    echo "  First renderer, 0.4.0           ${SITE}#seed=K1&age=7301&v=0.4.0"
  else
    echo
    echo "Pages could not be switched on automatically. On a free plan the repository must be public:"
    echo "  bash publish_to_github.sh $REPO_NAME public   (on a fresh copy), or change visibility in Settings,"
    echo "then Settings -> Pages -> Deploy from a branch -> main, / (root)."
  fi
else
  echo
  echo "GitHub CLI not found or not logged in. Finish in two steps:"
  echo "  1. Create an EMPTY repository named $REPO_NAME at https://github.com/new (no README, no license)."
  echo "  2. Run:"
  echo "     git remote add origin https://github.com/YOUR-USERNAME/$REPO_NAME.git"
  echo "     git push -u origin main --tags"
  echo "  3. Settings -> Pages -> Deploy from a branch -> main, / (root)."
  echo "     Demo: https://YOUR-USERNAME.github.io/$REPO_NAME/#seed=G3&family=2&age=7301&v=0.6.0"
fi
