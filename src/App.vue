
<template>
  <div id="app-container">
    <CanvasContainer />
    <div id="ui-panel">
      <h2>Ray Tracing Simulator</h2>
      <p>Canvas is ready!</p>
    </div>
  </div>
</template>

<script setup>
import CanvasContainer from './components/canvas/CanvasContainer.vue'
</script>

<style scoped>
#app-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

#ui-panel {
  width: 300px;
  background: #2a2a2a;
  color: #ffffff;
  padding: 20px;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
}

#ui-panel h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

#ui-panel p {
  margin: 0;
  font-size: 14px;
  color: #aaaaaa;
}
</style>