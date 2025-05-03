interface PluginMessage {
  type: string;
  prefix?: string;
}

// プレフィックスの保存用キー
const STORAGE_KEY = 'css-prefix';

// 保存されたプレフィックスを取得
let currentPrefix = figma.clientStorage.getAsync(STORAGE_KEY)
  .then(prefix => (prefix as string) || '')
  .catch(() => '');

// UIのショースペースを設定
figma.showUI(__html__, { width: 240, height: 180 });

// codegenイベントのリスナー
figma.codegen.on('generate', async (event) => {
  const node = event.node;
  const prefix = await currentPrefix;
  
  // CSSコードを生成
  const css = generateCSSWithPrefix(node, prefix);
  
  return [
    {
      title: prefix ? `CSS with prefix: ${prefix}` : 'CSS',
      language: 'CSS',
      code: css,
    },
  ];
});

// UIからのメッセージ処理
figma.ui.onmessage = async (message: PluginMessage) => {
  if (message.type === 'apply-prefix') {
    const newPrefix = message.prefix || '';
    
    // プレフィックスを保存
    await figma.clientStorage.setAsync(STORAGE_KEY, newPrefix);
    currentPrefix = Promise.resolve(newPrefix);
    
    // UIを閉じる
    figma.closePlugin(`プレフィックス "${newPrefix}" が設定されました`);
  }
};

// 起動時に保存済みプレフィックスをUIに送信
currentPrefix.then(savedPrefix => {
  figma.ui.postMessage({
    type: 'init',
    savedPrefix,
  });
});

/**
 * ノードからCSSを生成し、CSS変数にプレフィックスを追加する
 */
function generateCSSWithPrefix(node: SceneNode, prefix: string): string {
  // 基本的なCSSプロパティを取得
  const styles: Record<string, string> = {};
  
  // 各種スタイルプロパティを追加
  if ('fills' in node && node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
    // 背景色の処理
    const fill = node.fills[0] as Paint;
    if (fill.type === 'SOLID') {
      styles.backgroundColor = rgbaToHex(fill.color, fill.opacity || 1);
    }
  }
  
  if ('strokes' in node && node.strokes && Array.isArray(node.strokes) && node.strokes.length > 0) {
    // ボーダーの処理
    const stroke = node.strokes[0] as Paint;
    if (stroke.type === 'SOLID') {
      styles.borderColor = rgbaToHex(stroke.color, stroke.opacity || 1);
      
      if ('strokeWeight' in node) {
        styles.borderWidth = `${node.strokeWeight}px`;
        styles.borderStyle = 'solid';
      }
    }
  }
  
  if ('cornerRadius' in node && node.cornerRadius !== undefined) {
    // 角丸の処理
    styles.borderRadius = `${node.cornerRadius}px`;
  }
  
  // その他のスタイル
  if ('opacity' in node) {
    styles.opacity = String(node.opacity);
  }
  
  if ('width' in node && 'height' in node) {
    styles.width = `${Math.round(node.width)}px`;
    styles.height = `${Math.round(node.height)}px`;
  }
  
  // CSS変数にプレフィックスを追加
  let css = '';
  
  // Object.entriesを使用
  const styleEntries = Object.entries(styles);
  for (const [property, value] of styleEntries) {
    if (value.includes('var(--')) {
      // CSS変数にプレフィックスを追加
      const newValue = prefix 
        ? value.replace(/var\(--([^,]+)(,\s*[^)]+)?\)/g, `var(--${prefix}-$1$2)`)
        : value;
      css += `${property}: ${newValue};\n`;
    } else {
      css += `${property}: ${value};\n`;
    }
  }
  
  return css;
}

/**
 * RGB値からHex形式に変換
 */
function rgbaToHex(color: RGB, opacity: number = 1): string {
  // RGBの値を0-255の範囲に変換
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  
  // 透明度が1の場合はHex形式で返す
  if (opacity === 1) {
    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');
    return `#${rHex}${gHex}${bHex}`;
  }
  
  // 透明度が設定されている場合はCSS変数として返す
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}