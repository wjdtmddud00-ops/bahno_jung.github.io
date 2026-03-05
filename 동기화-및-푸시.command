#!/bin/bash

set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

echo
echo "[푸시] 컬렉션 동기화 후 Git 푸시..."
echo

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js가 설치되어 있지 않거나 PATH에 없습니다."
  echo "   설치 후 다시 실행해 주세요: https://nodejs.org"
  echo
  read -r -p "엔터를 누르면 창을 닫습니다..."
  exit 1
fi

node sync-and-push.js

echo
read -r -p "엔터를 누르면 창을 닫습니다..."
