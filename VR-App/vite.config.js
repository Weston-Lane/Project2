import { defineConfig } from 'vite'

// Notice we added ({ command }) here!
export default defineConfig(({ command }) => {
  if (command === 'build') {
    // This runs when you push to GitHub Pages
    return {
      base: '/Project2/', 
    }
  } else {
    // This runs when you type 'npm run dev' locally
    return {
      base: '/', 
    }
  }
})