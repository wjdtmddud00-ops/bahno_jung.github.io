/**
 * 사진 사이트 템플릿 설치 마법사 (Windows / Mac 공통)
 * 실행: 프로젝트 루트에서 node install/install-wizard.js
 * 또는 설치하기.bat (Windows) / 설치하기.command (Mac) 더블클릭
 */

const fs = require("fs").promises;
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

const isWindows = process.platform === "win32";
const isMac = process.platform === "darwin";

// 설치 소스 = 이 스크립트가 있는 폴더의 상위 (템플릿 루트)
const INSTALLER_DIR = path.resolve(__dirname, "..");
const EXCLUDE_NAMES = new Set(["node_modules", ".git", "install"]);
const EXCLUDE_FILES = new Set(["설치하기.bat", "설치하기.command"]);

function ask(question, defaultVal = "") {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const def = defaultVal ? ` [${defaultVal}]` : "";
  return new Promise((resolve) => {
    rl.question(question + def + ": ", (answer) => {
      rl.close();
      resolve((answer || defaultVal || "").trim());
    });
  });
}

function checkNode() {
  const v = process.version;
  const major = parseInt(v.slice(1).split(".")[0], 10);
  if (major < 14) {
    console.error("Node.js 14 이상이 필요합니다. 현재: " + v);
    console.error("다운로드: https://nodejs.org");
    process.exit(1);
  }
}

async function copyRecursive(src, dest, rootSrc = src) {
  const stat = await fs.stat(src);
  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const e of entries) {
      const name = e.name;
      if (EXCLUDE_NAMES.has(name)) continue;
      await copyRecursive(path.join(src, name), path.join(dest, name), rootSrc);
    }
    return;
  }
  await fs.copyFile(src, dest);
}

function replaceSiteName(filePath, mainTitle, subtitle) {
  return fs.readFile(filePath, "utf8").then((content) => {
    const fullTitle = [mainTitle, subtitle].filter(Boolean).join(" ");
    const desc = `${mainTitle}의 사진 포트폴리오. 다양한 작품을 한눈에 감상해 보세요.`;
    let out = content
      .replace(/Jung In Hwan Photography/g, fullTitle)
      .replace(/>Jung In Hwan</g, ">" + mainTitle + "<")
      .replace(/>Photography</g, ">" + subtitle + "<")
      .replace(/Jung In Hwan의 사진 포트폴리오/g, desc);
    return fs.writeFile(filePath, out, "utf8");
  });
}

async function main() {
  console.log("\n========================================");
  console.log("  사진 사이트 템플릿 설치 마법사");
  console.log("========================================\n");

  checkNode();

  const defaultPath = path.join(INSTALLER_DIR, "my-photo-site");
  const installPath = await ask("설치할 경로 (폴더가 없으면 생성됩니다)", defaultPath);
  if (!installPath) {
    console.log("설치를 취소했습니다.");
    process.exit(0);
  }

  const mainTitle = await ask("사이트 로고 상단 텍스트 (예: JUNG IN HWAN)", "MY PHOTOGRAPHY");
  const subtitle = await ask("사이트 로고 하단 텍스트 (예: Photography, 비워두려면 Enter)", "Photography");

  console.log("\n설치 중...\n");

  const absPath = path.isAbsolute(installPath) ? installPath : path.join(process.cwd(), installPath);
  await fs.mkdir(absPath, { recursive: true });

  const entries = await fs.readdir(INSTALLER_DIR, { withFileTypes: true });
  for (const e of entries) {
    if (EXCLUDE_NAMES.has(e.name) || EXCLUDE_FILES.has(e.name)) continue;
    const src = path.join(INSTALLER_DIR, e.name);
    const dest = path.join(absPath, e.name);
    await copyRecursive(src, dest);
    console.log("  복사: " + e.name);
  }

  // 사이트 이름 반영
  const indexPath = path.join(absPath, "index.html");
  const collectionPath = path.join(absPath, "collection.html");
  try {
    await replaceSiteName(indexPath, mainTitle, subtitle);
    await replaceSiteName(collectionPath, mainTitle, subtitle);
    console.log("  사이트 이름 적용 완료.");
  } catch (err) {
    console.warn("  사이트 이름 치환 경고:", err.message);
  }

  // Node가 방금 설치된 경우 PATH에 없을 수 있으므로, node가 있는 폴더를 PATH 앞에 추가
  const nodeDir = path.dirname(process.execPath);
  const sep = process.platform === "win32" ? ";" : ":";
  const env = { ...process.env, PATH: nodeDir + sep + (process.env.PATH || "") };

  console.log("\n  npm install 실행 중...");
  try {
    execSync("npm install", { cwd: absPath, stdio: "inherit", shell: true, env });
  } catch (e) {
    console.warn("  npm install 실패. 설치 폴더에서 나중에 'npm install'을 실행하세요.");
  }

  console.log("\n========================================");
  console.log("  설치가 완료되었습니다.");
  console.log("========================================");
  console.log("  설치 경로: " + absPath);
  console.log("");
  console.log("  사용 방법:");
  if (isWindows) {
    console.log("  • 테스트 서버: '동기화-및-로컬서버.bat' 더블클릭");
    console.log("  • 푸시: '동기화-및-푸시.bat' 더블클릭");
  } else {
    console.log("  • 테스트 서버: 터미널에서 npm run serve");
    console.log("  • 푸시: 터미널에서 npm run sync");
  }
  console.log("  • 자세한 설명: 설치 폴더 안 '사용설명서.txt' 참고");
  console.log("");
}

main().catch((err) => {
  console.error("설치 오류:", err.message);
  process.exit(1);
});
