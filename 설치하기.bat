@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "NODE_EXE="
where node >nul 2>&1 && set "NODE_EXE=node"
if not defined NODE_EXE if exist "C:\Program Files\nodejs\node.exe" set "NODE_EXE=C:\Program Files\nodejs\node.exe"
if not defined NODE_EXE if exist "C:\Program Files (x86)\nodejs\node.exe" set "NODE_EXE=C:\Program Files (x86)\nodejs\node.exe"

if not defined NODE_EXE (
  echo.
  echo [Node.js 자동 설치]
  echo Node.js가 없어 설치를 진행합니다. 잠시 기다려 주세요.
  echo.
  powershell -NoProfile -ExecutionPolicy Bypass -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $url = 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi'; $out = Join-Path $env:TEMP 'node-install.msi'; Write-Host 'Node.js 다운로드 중...'; Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing; Write-Host 'Node.js 설치 중...'; Start-Process -FilePath 'msiexec.exe' -ArgumentList '/i', $out, '/quiet', '/norestart' -Wait; Write-Host '설치 완료.' }"
  if errorlevel 1 (
    echo Node.js 자동 설치에 실패했습니다. https://nodejs.org 에서 수동 설치 후 다시 실행하세요.
    start https://nodejs.org
    pause
    exit /b 1
  )
  set "NODE_EXE=C:\Program Files\nodejs\node.exe"
  if not exist "%NODE_EXE%" set "NODE_EXE=C:\Program Files (x86)\nodejs\node.exe"
  echo.
)

echo.
echo [사진 사이트 템플릿 설치 마법사]
echo.

"%NODE_EXE%" "%~dp0install\install-wizard.js"

echo.
pause
