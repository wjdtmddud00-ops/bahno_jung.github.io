/**
 * WALL / collections 변경 감지 → images.json 생성/갱신 → git commit & push
 * 프로젝트 루트에서 실행: node sync-and-push.js
 */

const path = require("path");
const { execSync } = require("child_process");
const { runSync } = require("./sync-local.js");

const ROOT = path.resolve(__dirname);

function run(cmd, cwd = ROOT) {
  execSync(cmd, { cwd, stdio: "inherit", shell: true });
}

function getText(cmd, cwd = ROOT) {
  return execSync(cmd, { cwd, encoding: "utf8", shell: true }).trim();
}

function hasUnpushedCommits() {
  try {
    // upstream이 없는 경우 rev-parse에서 예외 발생
    getText("git rev-parse --abbrev-ref --symbolic-full-name @{u}");
    const ahead = Number.parseInt(getText("git rev-list --count @{u}..HEAD"), 10);
    return Number.isFinite(ahead) && ahead > 0;
  } catch {
    return false;
  }
}

runSync()
  .then(() => {
    try {
      const status = getText("git status --porcelain");
      const hasChanges = Boolean(status);
      const hasAhead = hasUnpushedCommits();

      if (!hasChanges && !hasAhead) {
        console.log("\n📤 커밋할 변경/푸시할 커밋 없음. 푸시 생략.");
        return;
      }

      console.log("\n📤 Git 커밋 및 푸시...");
      if (hasChanges) {
        run("git add -A");
        run('git commit -m "chore: collections 동기화"');
      } else {
        console.log("   커밋할 파일 변경은 없지만, 미푸시 커밋을 푸시합니다.");
      }
      run("git push");
      console.log("\n✅ 동기화 및 푸시 완료. 사이트가 곧 반영됩니다.");
    } catch (e) {
      if (e.message && e.message.includes("has no upstream branch")) {
        console.log(
          "\n⚠ upstream 브랜치가 없습니다. 한 번만 아래 명령을 실행하세요:\n   git push --set-upstream origin main"
        );
        return;
      }
      if (e.status === 128 || (e.message && e.message.includes("not a git repository"))) {
        console.log("\n⚠ 이 폴더는 Git 저장소가 아니거나 원격이 없어 푸시를 건너뜁니다.");
      } else {
        throw e;
      }
    }
  })
  .catch((err) => {
    console.error("❌ 오류:", err.message);
    process.exit(1);
  });
