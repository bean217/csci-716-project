<template>
  <div id="app-wrapper">
    <div id="app-container">
      <CanvasContainer />
      <div id="ui-panel">
        <h2>Ray Tracing Simulator</h2>
        <SceneIOPanel />
        <SimulationControlPanel />
        <ToolPalette />
        <PropertyPanel />
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
          <li>Save and load scenes as JSON files</li>
          <li>Optimized with spatial acceleration structures (KD-trees, BVH)</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import CanvasContainer from './components/canvas/CanvasContainer.vue'
import SceneIOPanel from './components/panels/SceneIOPanel.vue'
import SimulationControlPanel from './components/panels/SimulationControlPanel.vue'
import ToolPalette from './components/panels/ToolPalette.vue'
import PropertyPanel from './components/panels/PropertyPanel.vue'
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
  height: 70vh;
  min-height: 500px;
  max-height: 900px;
  background: #1a1a1a;
  position: relative;
}

#app-container > :first-child {
  flex: 1;
  min-width: 0;
  position: relative;
}

#ui-panel {
  width: 320px;
  min-width: 320px;
  max-width: 400px;
  background: #2a2a2a;
  color: #ffffff;
  padding: 20px;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1000;
  max-height: 100%;
}

#ui-panel h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 16px;
  border-bottom: 1px solid #444;
  text-align: center;
  flex-shrink: 0;
}

/* Ensure all panels can be scrolled to */
#ui-panel > * {
  flex-shrink: 0;
}

/* Override PropertyPanel's max-height to allow proper scrolling */
#ui-panel :deep(.property-panel) {
  max-height: none !important;
  overflow-y: visible !important;
}

/* Prevent other panels from shrinking */
#ui-panel :deep(.scene-io-panel),
#ui-panel :deep(.simulation-control-panel),
#ui-panel :deep(.tool-palette) {
  flex-shrink: 0;
}

#project-info {
  flex: 1;
  background: #f5f5f5;
  padding: 60px 20px;
  min-height: 300px;
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

@media (max-width: 1024px) {
  #app-container {
    height: 60vh;
  }

  #ui-panel {
    width: 280px;
    min-width: 280px;
  }
}

@media (max-width: 768px) {
  #app-container {
    flex-direction: column;
    height: auto;
    min-height: 400px;
  }

  #app-container > :first-child {
    height: 400px;
  }

  #ui-panel {
    width: 100%;
    max-width: none;
    max-height: 50vh;
  }
}
</style>