// Renders icon.svg to PNGs at many sizes (via headless Chromium), then assembles
// a Windows .ico and a macOS .icns by hand (both support embedded PNG images).
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const SVG = fs.readFileSync(path.join(__dirname, "icon.svg"), "utf8");
const OUT = path.join(__dirname, "..", "launcher");
const SIZES = [16, 24, 32, 48, 64, 128, 256, 512, 1024];

async function renderPngs() {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const pngs = {};
  for (const s of SIZES) {
    const html = `<!doctype html><meta charset=utf8><style>
      html,body{margin:0;padding:0;background:transparent}
      svg{display:block;width:${s}px;height:${s}px}</style>${SVG}`;
    await page.setViewportSize({ width: s, height: s });
    await page.setContent(html, { waitUntil: "networkidle" });
    pngs[s] = await page.locator("svg").screenshot({ omitBackground: true });
  }
  await browser.close();
  return pngs;
}

function buildIco(pngs, sizes) {
  const imgs = sizes.map(s => ({ s, data: pngs[s] }));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(imgs.length, 4);
  const dir = Buffer.alloc(16 * imgs.length);
  let offset = 6 + dir.length;
  imgs.forEach((img, i) => {
    const o = i * 16;
    dir.writeUInt8(img.s >= 256 ? 0 : img.s, o);       // width (0 = 256)
    dir.writeUInt8(img.s >= 256 ? 0 : img.s, o + 1);   // height
    dir.writeUInt8(0, o + 2); dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4); dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(img.data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += img.data.length;
  });
  return Buffer.concat([header, dir, ...imgs.map(i => i.data)]);
}

function buildIcns(pngs) {
  // OSType -> px (PNG-encoded icon chunks supported by modern macOS)
  const map = { ic11: 32, ic12: 64, ic07: 128, ic08: 256, ic09: 512, ic10: 1024 };
  const chunks = [];
  for (const [type, s] of Object.entries(map)) {
    const data = pngs[s];
    const head = Buffer.alloc(8);
    head.write(type, 0, "ascii");
    head.writeUInt32BE(data.length + 8, 4);
    chunks.push(Buffer.concat([head, data]));
  }
  const body = Buffer.concat(chunks);
  const fileHead = Buffer.alloc(8);
  fileHead.write("icns", 0, "ascii");
  fileHead.writeUInt32BE(body.length + 8, 4);
  return Buffer.concat([fileHead, body]);
}

(async () => {
  const pngs = await renderPngs();
  fs.writeFileSync(path.join(OUT, "icon.png"), pngs[512]);
  fs.writeFileSync(path.join(OUT, "icon.ico"), buildIco(pngs, [16, 24, 32, 48, 64, 128, 256]));
  fs.writeFileSync(path.join(OUT, "icon.icns"), buildIcns(pngs));
  console.log("wrote launcher/icon.png, icon.ico, icon.icns");
  console.log("ico bytes:", fs.statSync(path.join(OUT, "icon.ico")).size);
  console.log("icns bytes:", fs.statSync(path.join(OUT, "icon.icns")).size);
})();
