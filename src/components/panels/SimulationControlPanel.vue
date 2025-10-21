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
  padding: 12px;
  background: #2a2a2a;
  border-radius: 8px;
  margin-bottom: 16px;
}

.panel-header {
  cursor: pointer;
  user-select: none;
  padding: 4px 0;
}

.panel-header:hover h3 {
  color: #6bb3ff;
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  transition: color 0.2s;
}

.panel-content {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #444;
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
  background: #555;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #4a9eff;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  background: #6bb3ff;
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #4a9eff;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}

.slider::-moz-range-thumb:hover {
  background: #6bb3ff;
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