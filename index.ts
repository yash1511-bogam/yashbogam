import {
  createCliRenderer,
  BoxRenderable,
  TextRenderable,
  ASCIIFontRenderable,
  t,
  bold,
  fg,
  dim,
  type KeyEvent,
} from "@opentui/core";
import { spawn } from "child_process";
import { platform } from "os";
import { resolve } from "path";

const projects = [
  { name: "Retrace", desc: "Execution replay engine for AI agents — record, replay & fork runs", url: "https://retraceai.tech" },
  { name: "TrustLoop", desc: "Incident operations platform for AI product teams", url: "https://trustloop.yashbogam.me" },
];

let selectedIdx = 0;
let animDone = false;

const hexColors = [
  "#0e4490", "#0988ca", "#2cc6e3", "#6ce4d1", "#b3d49b", "#ea9e55", "#fd581b",
];

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(i: number, total: number): string {
  const t = total <= 1 ? 0 : i / (total - 1);
  const seg = t * (hexColors.length - 1);
  const lo = Math.floor(seg);
  const hi = Math.min(lo + 1, hexColors.length - 1);
  const f = seg - lo;
  const a = hexToRgb(hexColors[lo]!);
  const b = hexToRgb(hexColors[hi]!);
  const noise = () => Math.floor(Math.random() * 30) - 15;
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(Math.round(a[0]! + (b[0]! - a[0]!) * f) + noise());
  const g = clamp(Math.round(a[1]! + (b[1]! - a[1]!) * f) + noise());
  const bl = clamp(Math.round(a[2]! + (b[2]! - a[2]!) * f) + noise());
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
}

const renderer = await createCliRenderer({
  exitOnCtrlC: false,
  useMouse: false,
  enableMouseMovement: false,
});

function openUrl(url: string) {
  if (!url) return;
  const cmd = platform() === "darwin" ? "open" : "xdg-open";
  spawn(cmd, [url], { detached: true, stdio: "ignore" }).unref();
}

const main = new BoxRenderable(renderer, {
  id: "main",
  width: "100%",
  height: "100%",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 0,
  paddingY: 1,
});
renderer.root.add(main);

const word1 = "YASHWANTH";
const word2 = "BOGAM";

const nameTopRow = new BoxRenderable(renderer, {
  id: "name-top-row",
  flexDirection: "row",
  justifyContent: "center",
});
main.add(nameTopRow);

const nameBottomRow = new BoxRenderable(renderer, {
  id: "name-bottom-row",
  flexDirection: "row",
  justifyContent: "center",
  marginBottom: 1,
});
main.add(nameBottomRow);

const topLetters: ASCIIFontRenderable[] = [];
const bottomLetters: ASCIIFontRenderable[] = [];

for (let i = 0; i < word1.length; i++) {
  const letter = new ASCIIFontRenderable(renderer, {
    id: `lt-${i}`,
    text: "",
    font: "block",
    color: lerpColor(i, word1.length),
  });
  nameTopRow.add(letter);
  topLetters.push(letter);
}

for (let i = 0; i < word2.length; i++) {
  const letter = new ASCIIFontRenderable(renderer, {
    id: `lb-${i}`,
    text: "",
    font: "block",
    color: lerpColor(i, word2.length),
  });
  nameBottomRow.add(letter);
  bottomLetters.push(letter);
}

const tagline = new TextRenderable(renderer, {
  id: "tagline",
  content: t`${bold(fg("#FAB005")("AI Product Builder"))} ${fg("#495057")("·")} ${bold(fg("#FAB005")("Prompt Engineer"))} ${fg("#495057")("·")} ${bold(fg("#FAB005")("No-Code/AI Developer"))}`,
  visible: false,
});
main.add(tagline);

const location = new TextRenderable(renderer, {
  id: "location",
  content: "Hyderabad, India  ·  github.com/yash1511-bogam",
  fg: "#868E96",
  visible: false,
});
main.add(location);

const spacer = new TextRenderable(renderer, {
  id: "spacer",
  content: " ",
  visible: false,
});
main.add(spacer);

const projHeader = new TextRenderable(renderer, {
  id: "proj-hdr",
  content: t`${bold(fg("#4DABF7")("━━━ PROJECTS ━━━"))}  ${dim("↑↓ navigate · Enter open · R resume · Y portfolio · q quit")}`,
  visible: false,
});
main.add(projHeader);

const projContainer = new BoxRenderable(renderer, {
  id: "proj-list",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  flexGrow: 1,
  flexShrink: 1,
  gap: 0,
  visible: false,
});
main.add(projContainer);

let projCards: BoxRenderable[] = [];

function renderProjects() {
  projCards.forEach(c => c.destroyRecursively());
  projCards = [];
  projects.forEach((proj, i) => {
    const selected = i === selectedIdx;
    const card = new BoxRenderable(renderer, {
      id: `proj-${i}`,
      flexDirection: "column",
      width: "80%",
      flexShrink: 1,
      border: false,
      paddingX: 2,
      paddingY: 0,
    });
    card.add(
      new TextRenderable(renderer, {
        id: `proj-${i}-name`,
        content: selected
          ? t`${fg("#4DABF7")("▸")} ${bold(fg("#4DABF7")(proj.name))}  ${dim(proj.desc)}`
          : t`  ${fg("#CED4DA")(proj.name)}`,
      }),
    );
    projContainer.add(card);
    projCards.push(card);
  });
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function typewriterAnim() {
  for (let i = 0; i < word1.length; i++) {
    topLetters[i]!.text = word1[i]!;
    await sleep(150);
  }
  await sleep(200);
  for (let i = 0; i < word2.length; i++) {
    bottomLetters[i]!.text = word2[i]!;
    await sleep(150);
  }
  await sleep(300);
  animDone = true;
  tagline.visible = true;
  location.visible = true;
  spacer.visible = true;
  projHeader.visible = true;
  projContainer.visible = true;
  adjustLayout(renderer.width, renderer.height);
}

renderer.keyInput.on("keypress", (key: KeyEvent) => {
  if (key.name === "q" && !key.ctrl && !key.meta) {
    renderer.destroy();
    process.exit(0);
  }
  if (!animDone) return;
  const seq = (key as any).sequence || "";
  if (key.name === "up" && seq === "\x1b[A" && selectedIdx > 0) { selectedIdx--; renderProjects(); }
  if (key.name === "down" && seq === "\x1b[B" && selectedIdx < projects.length - 1) { selectedIdx++; renderProjects(); }
  if (key.name === "return") openUrl(projects[selectedIdx]!.url);
  if (key.name === "r") openUrl("file://" + resolve(import.meta.dir, "resume.html"));
  if (key.name === "y") openUrl("https://yashbogam.me");
});

function adjustLayout(width: number, height: number) {
  const small = width < 80;
  const shortHeight = height < 25;

  const font: "tiny" | "block" = small ? "tiny" : "block";
  topLetters.forEach(l => { l.font = font; });
  bottomLetters.forEach(l => { l.font = font; });

  nameTopRow.visible = !shortHeight || !animDone;
  nameBottomRow.visible = !shortHeight || !animDone;

  if (animDone) renderProjects();
}

renderer.on("resize", (width: number, height: number) => {
  adjustLayout(width, height);
});

typewriterAnim();
