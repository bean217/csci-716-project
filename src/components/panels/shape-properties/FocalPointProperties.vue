<template>
  <div class="focal-point-properties">
    <div class="property-group">
      <label>Ray Count</label>
      <input
          type="number"
          :value="object.rayCount"
          @input="updateRayCount(parseFloat($event.target.value))"
          min="1"
          max="360"
          step="1"
      />
      <p class="hint">Number of rays to emit (1-360)</p>
    </div>

    <div class="property-group">
      <label>Ray Length</label>
      <input
          type="number"
          :value="object.rayLength"
          @input="updateRayLength(parseFloat($event.target.value))"
          min="1"
          step="10"
      />
      <p class="hint">Maximum length of each ray</p>
    </div>

    <div class="property-group">
      <label>Visual Radius</label>
      <input
          type="number"
          :value="object.radius"
          @input="updateRadius(parseFloat($event.target.value))"
          min="1"
          max="50"
          step="1"
      />
      <p class="hint">Display size of focal point</p>
    </div>

    <div class="property-group">
      <label class="checkbox-label">
        <input
            type="checkbox"
            :checked="object.emitFromSurface"
            @change="updateEmitFromSurface($event.target.checked)"
        />
        <span>Emit from Surface</span>
      </label>
      <p class="hint">If enabled, rays emit from surface; otherwise from center</p>
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
});

const sceneStore = useSceneStore();

const updateRayCount = (value) => {
  if (isNaN(value) || value < 1) return
  sceneStore.updateObject(props.object.id, { rayCount: value })
};

const updateRayLength = (value) => {
  if (isNaN(value) || value <= 0) return
  sceneStore.updateObject(props.object.id, { rayLength: value })
};

const updateRadius = (value) => {
  if (isNaN(value) || value <= 0) return
  sceneStore.updateObject(props.object.id, { radius: value })
};

const updateEmitFromSurface = (value) => {
  sceneStore.updateObject(props.object.id, { emitFromSurface: value });
};
</script>

<style scoped>
.focal-point-properties {
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

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  margin-bottom: 0;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.hint {
  font-size: 11px;
  color: #888;
  margin-top: 4px;
}
</style>