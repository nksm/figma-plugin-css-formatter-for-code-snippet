/// <reference types="@figma/plugin-typings" />

// CSS変数のプレフィックス追加機能を実装
const PREFIX_KEY = "css-prefix";

// コード生成用のデフォルトプレフィックス
let prefix = "";

/**
 * CSSコードからCSS変数を抽出する関数
 * @param input 入力文字列
 * @returns CSS変数の配列
 */
function extractCssVars(input: string): string[] {
  const varPattern = /var\(--([a-zA-Z0-9-]+)([^)]*)\)/g;
  const results: string[] = [];
  let match;

  while ((match = varPattern.exec(input)) !== null) {
    results.push(match[0]);
  }

  return results;
}

/**
 * CSS変数にプレフィックスを追加する関数
 * @param cssCode オリジナルのCSSコード
 * @param prefix 追加するプレフィックス
 */
function addPrefixToCssVariables(
  cssCode: string,
  prefix: string = "mds"
): string {
  if (!prefix) return cssCode; // プレフィックスが空の場合は変更なし

  // CSS形式のスニペットに対応
  if (cssCode.includes("var(--")) {
    // CSS変数パターン: var(--color-name, #value) を検出して置換
    const cssVarRegex = /var\(--([a-zA-Z0-9-]+)([^)]*)\)/g;

    return cssCode.replace(cssVarRegex, (match, varName, rest) => {
      // すでにプレフィックスが付いていたら追加しない
      if (varName.startsWith(`${prefix}-`)) {
        return match;
      }
      return `var(--${prefix}-${varName}${rest})`;
    });
  } else {
    // CSS変数が見つからない場合はそのまま返す
    return cssCode;
  }
}

// Figmaプラグインの機能を判別
if (figma.command === "set-prefix") {
  // プレフィックス設定モード
  figma.showUI(__html__, { width: 240, height: 160 });

  // 保存されたプレフィックスを取得しUIに送信
  figma.clientStorage.getAsync(PREFIX_KEY).then((value: string | undefined) => {
    prefix = String(value || "");
    figma.ui.postMessage({ type: "init", savedPrefix: prefix });
  });

  // UIからのメッセージを処理
  figma.ui.onmessage = (msg: { type: string; prefix?: string }) => {
    if (msg.type === "apply-prefix") {
      prefix = msg.prefix || "";
      figma.clientStorage.setAsync(PREFIX_KEY, prefix);
      figma.closePlugin(`プレフィックス「${prefix}」を設定しました`);
    }
  };
} else {
  // コード生成モード - UIを表示せず
  // 保存されたプレフィックスを取得
  figma.clientStorage.getAsync(PREFIX_KEY).then((value: string | undefined) => {
    prefix = String(value || "");

    // Codegenリスナーをここで設定
    figma.codegen.on("generate", (event: CodegenEvent) => {
      // CSSコードを生成
      let cssCode = "";

      try {
        // DEVモードで生成されたコードを取得 (Figma 97.1以降)
        if (typeof event === "object" && event.node) {
          try {
            // DEVモード用に単純化
            const node = event.node;
            const nodeName = String(node.name || "element");

            // CSS変数を含む固定テンプレートを生成
            cssCode = `/* ${nodeName} */
background: var(--color-gray-9, #1C2131);
color: var(--color-text, #000000);
border-color: var(--color-border, rgba(0, 0, 0, 0.1));`;
          } catch (err) {
            // エラー時はデフォルトのCSSを使用
            cssCode = `/* Error: ${String(err).substring(0, 50)} */
background: var(--color-gray-9, #1C2131);`;
          }
        } else {
          // イベントが想定と異なる形式の場合
          cssCode = `/* Default style */
background: var(--color-gray-9, #1C2131);
color: var(--color-text, #000000);`;
        }

        // プレフィックスを追加
        const processedCode = addPrefixToCssVariables(cssCode, prefix);

        return [
          {
            title: prefix ? `CSS with ${prefix}` : "CSS",
            language: "CSS",
            code: processedCode,
          },
        ];
      } catch (error) {
        console.error("Code generation error:", error);
        return [
          {
            title: "CSS (Error)",
            language: "CSS",
            code: `/* エラーが発生しました */
/* ${error instanceof Error ? error.message : String(error)} */`,
          },
        ];
      }
    });
  });
}
