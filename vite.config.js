import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      'react-dom/client': path.resolve(__dirname, 'js/vendor/react-dom-shim.js'),
      'react/jsx-runtime': path.resolve(__dirname, 'js/vendor/jsx-runtime-shim.js'),
      'react': path.resolve(__dirname, 'js/vendor/react-shim.js'),
      'motion/react': path.resolve(__dirname, 'js/vendor/motion-shim.js'),
    },
  },
});
