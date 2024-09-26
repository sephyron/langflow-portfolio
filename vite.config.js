
import { defineConfig, loadEnv } from 'vite';
    
    export default defineConfig(({ command, mode }) => {
      const env = loadEnv(mode, process.cwd(), '');
      return {
        define: {
          'process.env.ANTHROPIC_API_KEY': JSON.stringify(env.ANTHROPIC_API_KEY),
        },
        // Add this optimizeDeps property
        optimizeDeps: {
          include: ['@langchain/anthropic'] 
        }
      };
    });

