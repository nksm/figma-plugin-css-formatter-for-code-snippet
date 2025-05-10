// ここで最小限の機能を実装
const PREFIX_KEY = 'css-prefix';

// コード生成用のデフォルトプレフィックス
let prefix = 'app';

// Figmaプラグインの機能を判別
if (figma.command === 'set-prefix') {
  // プレフィックス設定モード
  figma.showUI(__html__, { width: 240, height: 160 });
  
  // 保存されたプレフィックスを取得しUIに送信
  figma.clientStorage.getAsync(PREFIX_KEY).then(value => {
    prefix = String(value || '');
    figma.ui.postMessage({ type: 'init', savedPrefix: prefix });
  });
  
  // UIからのメッセージを処理
  figma.ui.onmessage = msg => {
    if (msg.type === 'apply-prefix') {
      prefix = msg.prefix || '';
      figma.clientStorage.setAsync(PREFIX_KEY, prefix);
      figma.closePlugin('プレフィックスを設定しました');
    }
  };
} else {
  // コード生成モード - UIを表示せず
  // 保存されたプレフィックスを取得
  figma.clientStorage.getAsync(PREFIX_KEY).then(value => {
    prefix = String(value || '');
    
    // Codegenリスナーをここで設定
    figma.codegen.on('generate', (event) => {
      // 非常にシンプルな変数置換のみ実行
      let code = `/* ${event.node.name} スタイル */
.element {
  color: var(--${prefix ? prefix + '-' : ''}color, #000000);
}`;

      return [{
        title: prefix ? `CSS (${prefix})` : 'CSS',
        language: 'CSS',
        code: code
      }];
    });
  });
}