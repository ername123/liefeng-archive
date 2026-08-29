// 修复部分 Windows 电脑上 os.userInfo() 报 ENOMEM 导致 tsx / drizzle-kit 崩溃的问题。
// 这个脚本会在 npm install 之后自动运行，对 node_modules 里的相关文件做补丁。
const fs = require("fs");
const path = require("path");

function patchFile(file) {
  if (!fs.existsSync(file)) return false;
  let text = fs.readFileSync(file, "utf8");
  const before = text;
  text = text.replace(/userInfo\(\)\.username/g, '(process.env.USERNAME || process.env.USER || "user")');
  if (text !== before) {
    fs.writeFileSync(file, text, "utf8");
    return true;
  }
  return false;
}

function walk(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(cjs|mjs|js)$/.test(e.name)) out.push(p);
  }
}

const root = path.join(__dirname, "node_modules");
if (!fs.existsSync(root)) process.exit(0);

const targets = [];
walk(path.join(root, "tsx"), targets);
targets.push(path.join(root, "drizzle-kit", "bin.cjs"));

let count = 0;
for (const t of targets) {
  if (patchFile(t)) count++;
}
console.log("[patch-userinfo] patched files:", count);