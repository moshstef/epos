#!/bin/bash
# Auto-format files with Prettier after Edit/Write
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only format files Prettier handles
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md)
    cd "$CLAUDE_PROJECT_DIR" && npx prettier --write "$FILE_PATH" 2>/dev/null
    ;;
esac

exit 0
