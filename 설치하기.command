#!/bin/bash
cd "$(dirname "$0")"

# Node 설치 여부 확인 (PATH + 일반 설치 경로)
get_node() {
  if command -v node &> /dev/null; then
    command -v node
    return
  fi
  for p in /usr/local/bin/node /opt/homebrew/bin/node; do
    [[ -x "$p" ]] && echo "$p" && return
  done
  return 1
}

NODE_EXE=$(get_node)

if [[ -z "$NODE_EXE" ]]; then
  echo ""
  echo "[Node.js 자동 설치]"
  echo ""

  if command -v brew &> /dev/null; then
    echo "Homebrew로 Node.js 설치 중..."
    if brew install node 2>/dev/null; then
      NODE_EXE=$(get_node)
    fi
  fi

  if [[ -z "$NODE_EXE" ]]; then
    echo "Node.js가 없습니다. 공식 설치 파일을 여세요."
    NODE_VER="v20.18.0"
    ARCH=$(uname -m)
    if [[ "$ARCH" == "arm64" ]]; then
      PKG="node-${NODE_VER}-darwin-arm64.pkg"
    else
      PKG="node-${NODE_VER}-darwin-x64.pkg"
    fi
    URL="https://nodejs.org/dist/${NODE_VER}/${PKG}"
    OUT="/tmp/${PKG}"
    if curl -sL -o "$OUT" "$URL" 2>/dev/null; then
      open "$OUT"
      echo "설치 창에서 진행한 뒤, 이 스크립트(설치하기.command)를 다시 실행하세요."
    else
      echo "다운로드 실패. https://nodejs.org 에서 설치한 뒤 다시 실행하세요."
      open "https://nodejs.org" 2>/dev/null || true
    fi
    echo ""
    read -p "계속하려면 Enter를 누르세요."
    exit 1
  fi
fi

echo ""
echo "[사진 사이트 템플릿 설치 마법사]"
echo ""

"$NODE_EXE" "install/install-wizard.js"

echo ""
read -p "계속하려면 Enter를 누르세요."
