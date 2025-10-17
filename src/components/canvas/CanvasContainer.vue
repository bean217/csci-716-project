<template>
  <div id="canvas-container" ref="canvasContainer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import PixiApp from '@/pixi/core/PixiApp.js'

const canvasContainer = ref(null)
let pixiApp = null

onMounted(() => {
  // Initialize PixiJS application
  pixiApp = new PixiApp(canvasContainer.value)
})

onUnmounted(() => {
  // Clean up PixiJS when component unmounts
  if (pixiApp) {
    pixiApp.destroy()
  }
})
</script>

<style scoped>
#canvas-container {
  flex: 1;
  position: relative;
  background: #1a1a1a;
}
</style>