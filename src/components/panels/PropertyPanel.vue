<template>
  <div class="property-panel">
    <div v-if="!selectedObject" class="no-selection">
      <p>No object selected</p>
      <p class="hint">Select a shape from the dropdown above or click on a shape in the canvas</p>
    </div>

    <div v-else class="properties">
      <div class="panel-header">
        <h3>{{ selectedObject.type }} Properties</h3>
        <button @click="deleteObject" class="delete-btn" title="Delete object">
          ✕
        </button>
      </div>

      <!-- Position & Transform Section -->
      <section class="property-section">
        <h4>Position & Transform</h4>

        <div class="property-group">
          <label>X Position</label>
          <input
              type="number"
              :value="selectedObject.position.x"
              @input="updateProperty('x', parseFloat($event.target.value))"
              step="1"
          />
        </div>

        <div class="property-group">
          <label>Y Position</label>
          <input
              type="number"
              :value="selectedObject.position.y"
              @input="updateProperty('y', parseFloat($event.target.value))"
              step="1"
          />
        </div>

        <div class="property-group">
          <label>Rotation (degrees)</label>
          <input
              type="number"
              :value="rotationDegrees"
              @input="updateRotation(parseFloat($event.target.value))"
              step="1"
              min="0"
              max="360"
          />
        </div>
      </section>

      <!-- Colors Section -->
      <section class="property-section">
        <h4>Colors</h4>

        <div class="property-group color-group">
          <label>Edge Color</label>
          <div class="color-input-wrapper">
            <input
                type="color"
                :value="selectedObject.edgeColor"
                @input="updateProperty('edgeColor', $event.target.value)"
                class="color-picker"
            />
            <input
                type="text"
                :value="selectedObject.edgeColor"
                @input="updateProperty('edgeColor', $event.target.value)"
                class="color-text"
                placeholder="#ffffff"
            />
          </div>
        </div>

        <div class="property-group color-group">
          <label>Fill Color</label>
          <div class="color-input-wrapper">
            <input
                type="color"
                :value="selectedObject.fillColor"
                @input="updateProperty('fillColor', $event.target.value)"
                class="color-picker"
            />
            <input
                type="text"
                :value="selectedObject.fillColor"
                @input="updateProperty('fillColor', $event.target.value)"
                class="color-text"
                placeholder="#666666"
            />
          </div>
        </div>
      </section>

      <!-- Shape-Specific Properties -->
      <section class="property-section">
        <h4>Shape Properties</h4>

        <!-- Rectangle Properties -->
        <template v-if="selectedObject.type === 'Rectangle'">
          <RectangleProperties :object="selectedObject" />
        </template>

        <!-- Square Properties -->
        <template v-else-if="selectedObject.type === 'Square'">
          <SquareProperties :object="selectedObject" />
        </template>

        <!-- Ellipse Properties -->
        <template v-else-if="selectedObject.type === 'Ellipse'">
          <EllipseProperties :object="selectedObject" />
        </template>

        <!-- Circle Properties -->
        <template v-else-if="selectedObject.type === 'Circle'">
          <CircleProperties :object="selectedObject" />
        </template>

        <!-- Triangle Properties -->
        <template v-else-if="selectedObject.type === 'Triangle'">
          <TriangleProperties :object="selectedObject" />
        </template>

        <!-- Equilateral Triangle Properties -->
        <template v-else-if="selectedObject.type === 'EquilateralTriangle'">
          <EquilateralTriangleProperties :object="selectedObject" />
        </template>

        <!-- Focal Point Properties -->
        <template v-else-if="selectedObject.type === 'FocalPoint'">
          <FocalPointProperties :object="selectedObject" />
        </template>

        <!-- Placeholder for other shapes -->
        <template v-else>
          <p class="placeholder-text">Shape-specific properties will appear here</p>
        </template>
      </section>

      <!-- Material Properties Section -->
      <section class="property-section" v-if="selectedObject.type !== 'FocalPoint'">
        <h4>Material Properties</h4>

        <div class="property-group">
          <label>
            Reflectivity
            <span class="property-value">{{ selectedObject.material.reflectivity.toFixed(2) }}</span>
          </label>
          <input
              type="range"
              :value="selectedObject.material.reflectivity"
              @input="updateProperty('reflectivity', parseFloat($event.target.value))"
              min="0"
              max="1"
              step="0.01"
              class="slider"
          />
          <div class="range-labels">
            <span>0.0</span>
            <span>1.0</span>
          </div>
        </div>

        <div class="property-group">
          <label>
            Refractive Index
            <span class="property-value">{{ selectedObject.material.refractiveIndex.toFixed(2) }}</span>
          </label>
          <input
              type="range"
              :value="selectedObject.material.refractiveIndex"
              @input="updateProperty('refractiveIndex', parseFloat($event.target.value))"
              min="1.0"
              max="2.5"
              step="0.01"
              class="slider"
          />
          <div class="range-labels">
            <span>1.0 (Air)</span>
            <span>2.5 (Diamond)</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSceneStore } from '@/stores/sceneStore';
import RectangleProperties from './shape-properties/RectangleProperties.vue';
import SquareProperties from './shape-properties/SquareProperties.vue';
import EllipseProperties from './shape-properties/EllipseProperties.vue';
import CircleProperties from './shape-properties/CircleProperties.vue';
import TriangleProperties from './shape-properties/TriangleProperties.vue';
import EquilateralTriangleProperties from './shape-properties/EquilateralTriangleProperties.vue';
import FocalPointProperties from './shape-properties/FocalPointProperties.vue';

const sceneStore = useSceneStore();

const selectedObject = computed(() => sceneStore.selectedObject);

const rotationDegrees = computed(() => {
  if (!selectedObject.value) return 0;
  return Math.round(selectedObject.value.getRotationDegrees());
})

const updateProperty = (property, value) => {
  if (!selectedObject.value) return;
  // Trigger reactivity by updating through the store
  sceneStore.updateSelectedObject({ [property]: value });
}

const updateRotation = (degrees) => {
  if (!selectedObject.value) return;

  // Normalize degrees to 0-360 range
  const normalized = ((degrees % 360) + 360) % 360;
  const radians = normalized * (Math.PI / 180);
  sceneStore.updateSelectedObject({ rotation: radians });
}

const deleteObject = () => {
  if (selectedObject.value) {
    sceneStore.removeSelectedObject();
  }
}
</script>

<style scoped>
.property-panel {
  flex: 1;
  overflow-y: auto;
}

.no-selection {
  padding: 20px;
  text-align: center;
  color: #888;
}

.no-selection p {
  margin: 8px 0;
  font-size: 14px;
}

.no-selection .hint {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.properties {
  padding-bottom: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #444;
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.delete-btn {
  background: #d32f2f;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.delete-btn:hover {
  background: #b71c1c;
}

.property-section {
  margin-bottom: 24px;
}

.property-section h4 {
  font-size: 13px;
  font-weight: 600;
  color: #aaaaaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.property-group {
  margin-bottom: 16px;
}

.property-group label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #cccccc;
  margin-bottom: 6px;
}

.property-value {
  font-weight: 600;
  color: #4a9eff;
}

.property-group input[type="number"],
.property-group input[type="text"] {
  width: 100%;
  padding: 8px 10px;
  background: #333;
  color: #ffffff;
  border: 1px solid #555;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.property-group input:focus {
  border-color: #4a9eff;
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
}

.color-group .color-input-wrapper {
  display: flex;
  gap: 8px;
}

.color-picker {
  width: 50px;
  height: 36px;
  padding: 2px;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  cursor: pointer;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 2px;
}

.color-text {
  flex: 1;
}

.slider {
  width: 100%;
  height: 6px;
  background: #444;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
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

.placeholder-text {
  font-size: 13px;
  color: #666;
  font-style: italic;
}
</style>