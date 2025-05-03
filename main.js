const c = "css-prefix";
let n = figma.clientStorage.getAsync(c).then((t) => t || "").catch(() => "");
figma.showUI(__html__, { width: 240, height: 180 });
figma.codegen.on("generate", async (t) => {
  const e = t.node, i = await n, s = f(e, i);
  return [
    {
      title: i ? `CSS with prefix: ${i}` : "CSS",
      language: "CSS",
      code: s
    }
  ];
});
figma.ui.onmessage = async (t) => {
  if (t.type === "apply-prefix") {
    const e = t.prefix || "";
    await figma.clientStorage.setAsync(c, e), n = Promise.resolve(e), figma.closePlugin(`プレフィックス "${e}" が設定されました`);
  }
};
n.then((t) => {
  figma.ui.postMessage({
    type: "init",
    savedPrefix: t
  });
});
function f(t, e) {
  const i = {};
  if ("fills" in t && t.fills && t.fills.length > 0) {
    const r = t.fills[0];
    r.type === "SOLID" && (i.backgroundColor = o(r.color, r.opacity));
  }
  if ("strokes" in t && t.strokes && t.strokes.length > 0) {
    const r = t.strokes[0];
    r.type === "SOLID" && (i.borderColor = o(r.color, r.opacity), "strokeWeight" in t && (i.borderWidth = `${t.strokeWeight}px`, i.borderStyle = "solid"));
  }
  "cornerRadius" in t && t.cornerRadius !== void 0 && (i.borderRadius = `${t.cornerRadius}px`), "opacity" in t && (i.opacity = t.opacity.toString()), "width" in t && "height" in t && (i.width = `${Math.round(t.width)}px`, i.height = `${Math.round(t.height)}px`);
  let s = "";
  for (const [r, a] of Object.entries(i))
    if (a.includes("var(--")) {
      const g = e ? a.replace(/var\(--([^,]+)(,\s*[^)]+)?\)/g, `var(--${e}-$1$2)`) : a;
      s += `${r}: ${g};
`;
    } else
      s += `${r}: ${a};
`;
  return s;
}
function o(t, e = 1) {
  const i = Math.round(t.r * 255), s = Math.round(t.g * 255), r = Math.round(t.b * 255);
  return e === 1 ? `#${i.toString(16).padStart(2, "0")}${s.toString(16).padStart(2, "0")}${r.toString(16).padStart(2, "0")}` : `rgba(${i}, ${s}, ${r}, ${e})`;
}
