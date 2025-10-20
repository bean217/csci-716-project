<template>
  <div class="triangle-properties">
    <div class="property-group">
      <label>Side 1 (Base)</label>
      <input
          type="number"
          :value="object.side1"
          @input="updateSide1(parseFloat($event.target.value))"
          min="1"
          step="1"
      />
    </div>

    <div class="property-group">
      <label>Side 2 (Left)</label>
      <input
          type="number"
          :value="object.side2"
          @input="updateSide2(parseFloat($event.target.value))"
          min="1"
          step="1"
      />
    </div>

    <div class="property-group">
      <label>Side 3 (Right)</label>
      <input
          type="number"
          :value="object.side3"
          @input="updateSide3(parseFloat($event.target.value))"
          min="1"
          step="1"
      />
    </div>

    <div v-if="!object.isValidTriangle()" class="warning">
      ⚠ Warning: Triangle inequality violated
    </div>
  </div>
</template>

<script setup>
import { useSceneStore } from '@/stores/sceneStore'

const props = defineProps({
  object: {
    type: Object,
    required: true
  }
})

const sceneStore = useSceneStore()

const updateSide1 = (value) => {
  if (isNaN(value) || value <= 0) return
  sceneStore.updateObject(props.object.id, { side1: value })
}

const updateSide2 = (value) => {
  if (isNaN(value) || value <= 0) return
  sceneStore.updateObject(props.object.id, { side2: value })
}

const updateSide3 = (value) => {
  if (isNaN(value) || value <= 0) return
  sceneStore.updateObject(props.object.id, { side3: value })
}
</script>

<style scoped>
.triangle-properties {
  /* Inherits styles from parent PropertyPanel */
}

.property-group {
  margin-bottom: 16px;
}

.property-group label {
  display: block;
  font-size: 13px;
  color: #cccccc;
  margin-bottom: 6px;
}

.property-group input[type="number"] {
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

.warning {
  padding: 8px 12px;
  background: #ff9800;
  color: #000;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
}
</style>