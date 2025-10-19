<template>
  <div id="canvas-container" ref="canvasContainer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useSceneStore } from '@/stores/sceneStore';
import PixiApp from '@/pixi/core/PixiApp.js';

const canvasContainer = ref(null);
const sceneStore = useSceneStore();
let pixiApp = null;

onMounted(async () => {
  // Initialize PixiJS application
  pixiApp = new PixiApp(canvasContainer.value, sceneStore);
  await pixiApp.init(canvasContainer.value)
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