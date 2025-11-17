<template>
  <div class="simulation-control-panel">
    <div class="panel-header" @click="isExpanded = !isExpanded">
      <h3>{{ isExpanded ? '▼' : '▶' }} Ray Tracing Settings</h3>
    </div>

    <div v-show="isExpanded" class="panel-content">

      <!-- Toggle Rays -->
      <div class="property-group">
        <label class="checkbox-label">
          <input
              type="checkbox"
              :checked="simulationStore.showRays"
              @change="simulationStore.toggleRays()"
          />
          <span>Show Rays</span>
        </label>
      </div>

      <!-- Toggle BVH -->
      <div class="property-group">
        <label class="checkbox-label">
          <input
              type="checkbox"
              :checked="simulationStore.useBVH"
              @change="simulationStore.toggleBVH()"
          />
          <span>Use BVH</span>
        </label>
      </div>

      <template v-if="simulationStore.showRays">
        <!-- Max Bounces -->
        <div class="property-group">
          <label>
            Max Bounces
            <span class="property-value">{{ simulationStore.maxBounces }}</span>
          </label>
          <input
              type="range"
              :value="simulationStore.maxBounces"
              @input="simulationStore.setMaxBounces(parseInt($event.target.value))"
              min="0"
              max="20"
              step="1"
              class="slider"
          />
          <div class="range-labels">
            <span>0</span>
            <span>20</span>
          </div>
        </div>

        <!-- Ray Width -->
        <div class="property-group">
          <label>
            Ray Width
            <span class="property-value">{{ simulationStore.rayWidth.toFixed(1) }}</span>
          </label>
          <input
              type="range"
              :value="simulationStore.rayWidth"
              @input="simulationStore.setRayWidth(parseFloat($event.target.value))"
              min="0.5"
              max="5"
              step="0.5"
              class="slider"
          />
          <div class="range-labels">
            <span>0.5</span>
            <span>5.0</span>
          </div>
        </div>

        <!-- Ray Color -->
        <div class="property-group color-group">
          <label>Ray Color</label>
          <div class="color-input-wrapper">
            <input
                type="color"
                :value="simulationStore.rayColor"
                @input="simulationStore.setRayColor($event.target.value)"
                class="color-picker"
            />
            <input
                type="text"
                :value="simulationStore.rayColor"
                @input="simulationStore.setRayColor($event.target.value)"
                class="color-text"
                placeholder="#00ff00"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSimulationStore } from '@/stores/simulationStore'

const simulationStore = useSimulationStore()
const isExpanded = ref(false)
</script>

<style scoped>
.simulation-control-panel {
  padding: 0.875rem;
  background: rgba(30, 30, 50, 0.4);
  border-radius: 12px;
  margin-bottom: 1.25rem;
  border: 1px solid rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.simulation-control-panel:hover {
  background: rgba(30, 30, 50, 0.5);
  border-color: rgba(102, 126, 234, 0.3);
}

.panel-header {
  cursor: pointer;
  user-select: none;
  padding: 0.25rem 0;
  transition: all 0.3s ease;
}

.panel-header:hover h3 {
  background: linear-gradient(135deg, #7e92f5 0%, #8e5cb8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.panel-header h3 {
  font-size: 0.9375rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  transition: all 0.3s ease;
}

.panel-content {
  margin-top: 0.875rem;
  padding-top: 0.875rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.property-group {
  margin-bottom: 16px;
}

.property-group label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #cccccc;
  margin-bottom: 6px;
}

.property-value {
  color: #4a9eff;
  font-weight: 600;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label span {
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
}

.slider {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
  position: relative;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.6);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.6);
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #888;
  margin-top: 4px;
}

.color-group {
  margin-bottom: 8px;
}

.color-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-picker {
  width: 60px;
  height: 36px;
  border: 1px solid #555;
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 2px;
}

.color-picker::-webkit-color-swatch {
  border-radius: 2px;
  border: none;
}

.color-text {
  flex: 1;
  padding: 8px 10px;
  background: #333;
  color: #ffffff;
  border: 1px solid #555;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  outline: none;
  transition: border-color 0.2s;
}

.color-text:focus {
  border-color: #4a9eff;
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
}

.hint {
  font-size: 12px;
  color: #888;
  margin: 0;
  font-style: italic;
}
</style>