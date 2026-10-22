#!/usr/bin/env bash
export PATH="$PATH:/mnt/c/Users/nickv/.dotnet/tools:/c/Users/nickv/.dotnet/tools"

if command -v node >/dev/null 2>&1; then
  node node_modules/next/dist/bin/next dev
elif command -v node.exe >/dev/null 2>&1; then
  node.exe node_modules/next/dist/bin/next dev
else
  echo "Error: Node.js not found in PATH."
  exit 1
fi

