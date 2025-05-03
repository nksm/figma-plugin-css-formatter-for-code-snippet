# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発コマンド

- `npm run build`: TypeScriptをコンパイルする
- `npm run watch`: 変更を監視しながらTypeScriptをコンパイルする
- `npm run lint`: ESLintを使用してコードを検証する
- `npm run lint:fix`: ESLintを使用してコードを自動修正する

## コードスタイル

- **TypeScript**: 厳格なタイプチェック（`strict: true`）を使用
- **命名規則**: キャメルケース（camelCase）を使用
- **インデント**: 2スペース
- **ESLint設定**: `eslint:recommended`, `@typescript-eslint/recommended`, `@figma/figma-plugins/recommended`に従う
- **未使用変数**: `_`で始まる変数名は無視される
- **エラー処理**: Figma APIからのエラーは適切に処理する
- **コメント**: コード意図を明確に説明する
- **インポート**: 関連するインポートをグループ化し、アルファベット順に整理する

## Figmaプラグイン固有のガイド

- プラグインコードは`code.ts`で管理し、UIは`ui.html`で定義する
- Figma APIへのアクセスは`figma`グローバルオブジェクトを通じて行う
- プラグインのメタデータは`manifest.json`で管理する
- コードジェネレーターの機能は`figma.codegen.on('generate', ...)`を通じて実装する