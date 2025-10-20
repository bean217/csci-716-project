<template>
  <div class="tool-palette">
    <h3>Add Focal Point</h3>
    <button @click="addFocalPoint" class="focal-point-btn">
      + Add Focal Point
    </button>

    <h3>Add Shape</h3>
    <select v-model="selectedShape" @change="handleShapeSelection" class="shape-dropdown">
      <option value="" disabled>Select a shape...</option>

      <optgroup label="Rectangles">
        <option value="Rectangle">Rectangle</option>
        <option value="Square">Square</option>
      </optgroup>

      <optgroup label="Ellipses">
        <option value="Ellipse">Ellipse</option>
        <option value="Circle">Circle</option>
      </optgroup>

      <optgroup label="Triangles">
        <option value="Triangle">Triangle</option>
        <option value="EquilateralTriangle">Equilateral Triangle</option>
      </optgroup>
    </select>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSceneStore } from '@/stores/sceneStore'
import Rectangle from '@/geometry/Rectangle'
import Square from '@/geometry/Square'
import Ellipse from '@/geometry/Ellipse'
import Circle from '@/geometry/Circle'
import Triangle from '@/geometry/Triangle'
import EquilateralTriangle from '@/geometry/EquilateralTriangle'
import FocalPoint from '@/geometry/FocalPoint'

const sceneStore = useSceneStore()
const selectedShape = ref('')

// Default positions for new shapes (center of a typical canvas)
const getDefaultPosition = () => ({
  x: 400,
  y: 300
})

const addFocalPoint = () => {
  const position = getDefaultPosition()
  const focalPoint = new FocalPoint({
    x: position.x,
    y: position.y,
    rayCount: 32,
    rayLength: 1000
  })

  sceneStore.addObject(focalPoint, true)
  console.log('Created FocalPoint')
}

const handleShapeSelection = () => {
  const shapeType = selectedShape.value

  if (!shapeType) return

  const position = getDefaultPosition()
  let newObject = null

  switch (shapeType) {
    case 'Rectangle':
      newObject = new Rectangle({
        x: position.x,
        y: position.y,
        width: 100,
        height: 60
      })
      break

    case 'Square':
      newObject = new Square({
        x: position.x,
        y: position.y,
        sideLength: 80
      })
      break

    case 'Ellipse':
      newObject = new Ellipse({
        x: position.x,
        y: position.y,
        rx: 60,
        ry: 40
      })
      break

    case 'Circle':
      newObject = new Circle({
        x: position.x,
        y: position.y,
        radius: 50
      })
      break

    case 'Triangle':
      newObject = new Triangle({
        x: position.x,
        y: position.y,
        side1: 60,
        side2: 60,
        side3: 60
      })
      break

    case 'EquilateralTriangle':
      newObject = new EquilateralTriangle({
        x: position.x,
        y: position.y,
        sideLength: 60
      })
      break
  }

  if (newObject) {
    sceneStore.addObject(newObject, true)
    console.log(`Created ${shapeType}`)
  }

  // Reset dropdown to placeholder
  selectedShape.value = ''
}
</script>

<style scoped>
.tool-palette {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #444;
}

.tool-palette h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #ffffff;
}

.tool-palette h3:not(:first-child) {
  margin-top: 20px;
}

.focal-point-btn {
  width: 100%;
  padding: 10px 12px;
  background: #4a9eff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 8px;
}

.focal-point-btn:hover {
  background: #6bb3ff;
  font-weight: 600;
  margin-bottom: 8px;
  color: #ffffff;
}

.shape-dropdown {
  width: 100%;
  padding: 8px 12px;
  background: #333;
  color: #ffffff;
  border: 1px solid #555;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.shape-dropdown:hover {
  border-color: #4a9eff;
}

.shape-dropdown:focus {
  border-color: #4a9eff;
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
}

.shape-dropdown option {
  background: #333;
  color: #ffffff;
  padding: 8px;
}

.shape-dropdown optgroup {
  background: #2a2a2a;
  color: #aaaaaa;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>