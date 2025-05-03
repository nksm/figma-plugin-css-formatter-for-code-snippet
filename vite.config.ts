import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: './dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'main.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    // Figmaプラグイン開発に必要な設定
    lib: {
      entry: resolve(__dirname, 'main.ts'),
      formats: ['es'],
      fileName: 'main',
    },
    // CSSを分離せず、JSに埋め込む
    cssCodeSplit: false,
    // ソースマップを生成
    sourcemap: process.env.NODE_ENV !== 'production',
    // minifyしない（デバッグをしやすくするため）
    minify: process.env.NODE_ENV === 'production',
  },
  // HTMLファイルをそのまま出力先にコピー
  publicDir: false,
});