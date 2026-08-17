import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Optimize React Fast Refresh
      fastRefresh: true,
      // Enable SWC for faster compilation
      jsxRuntime: 'automatic'
    })
  ],
  
  build: {
    // Performance optimizations
    target: 'es2020', // Modern browsers for better optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          // Routing
          'router': ['react-router-dom'],
          // Icons and UI
          'ui-vendor': ['lucide-react'],
          // Utilities
          'utils': ['axios']
        },
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '') : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `media/[name]-[hash][extname]`;
          } else if (/\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i.test(assetInfo.name)) {
            return `img/[name]-[hash][extname]`;
          } else if (ext === 'css') {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Use esbuild for faster builds
    minify: 'esbuild',
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Reduce bundle size
    reportCompressedSize: false
  },
  
  // Optimize dev server
  server: {
    hmr: {
      overlay: false, // Reduce HMR overhead
      port: 24678 // Custom HMR port
    },
    // Enable file system caching
    fs: {
      cachedChecks: false
    }
  },
  
  // Enable CSS optimization
  css: {
    devSourcemap: false, // Disable CSS sourcemaps for better performance
    modules: {
      localsConvention: 'camelCase'
    }
  },
  
  // Optimize asset handling
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif', '**/*.webp'],
  
  // Define environment variables
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react'
    ],
    // Pre-bundle these dependencies for faster dev server startup
    force: false
  },
  
  // Enable experimental features for better performance
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `${filename}` };
      } else {
        return { relative: true };
      }
    }
  }
})