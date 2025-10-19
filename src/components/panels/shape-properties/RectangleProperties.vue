<template>
  <div class="rectangle-properties">
    <div class="property-group">
      <label>Width</label>
      <input
          type="number"
          :value="object.width"
          @input="updateWidth(parseFloat($event.target.value))"
          min="1"
          step="1"
      />
    </div>

    <div class="property-group">
      <label>Height</label>
      <input
          type="number"
          :value="object.height"
          @input="updateHeight(parseFloat($event.target.value))"
          min="1"
          step="1"
      />
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

const updateWidth = (value) => {
  if (isNaN(value) || value <= 0) return
  sceneStore.updateObject(props.object.id, { width: value })
}

const updateHeight = (value) => {
  if (isNaN(value) || value <= 0) return
  sceneStore.updateObject(props.object.id, { height: value })
}
</script>

<style scoped>
.rectangle-properties {
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
</style>