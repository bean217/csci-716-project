<template>
  <div id="app-wrapper">
    <div id="app-container">
      <CanvasContainer />
      <div id="ui-panel">
        <h2>Ray Tracing Simulator</h2>
        <p>Canvas is ready!</p>
      </div>
    </div>

    <div id="project-info">
      <div class="info-content">
        <h2>About This Project</h2>
        <p>
          This is an interactive 2D ray-tracing visualization tool that demonstrates how light behaves
          in a closed system with obstacles and walls. Explore reflection, refraction, and total internal
          reflection in an intuitive, educational sandbox environment.
        </p>
        <h3>Features</h3>
        <ul>
          <li>Place a focal point to emit rays in all directions</li>
          <li>Create geometric objects (rectangles, triangles, ellipses)</li>
          <li>Adjust material properties (reflectivity, refractive index)</li>
          <li>Trace light paths from target objects back to the focal point</li>
          <li>Optimized with spatial acceleration structures (KD-trees, BVH)</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import CanvasContainer from './components/canvas/CanvasContainer.vue'
</script>

<style scoped>
#app-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#app-container {
  display: flex;
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 90vh;
  background: #1a1a1a;
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

#project-info {
  flex: 1;
  background: #f5f5f5;
  padding: 60px 20px;
}

.info-content {
  max-width: 1200px;
  margin: 0 auto;
  color: #333;
}

.info-content h2 {
  font-size: 32px;
  margin-bottom: 20px;
  color: #1a1a1a;
}

.info-content h3 {
  font-size: 24px;
  margin-top: 30px;
  margin-bottom: 15px;
  color: #2a2a2a;
}

.info-content p {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
  color: #555;
}

.info-content ul {
  list-style: none;
  padding: 0;
}

.info-content ul li {
  font-size: 16px;
  line-height: 1.8;
  padding-left: 25px;
  position: relative;
  color: #555;
}

.info-content ul li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: #4a9eff;
  font-weight: bold;
}
</style>