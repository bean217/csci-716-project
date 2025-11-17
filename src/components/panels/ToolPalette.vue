<template>
  <div class="tool-palette">
    <h3>Add Focal Point</h3>
    <button @click="addFocalPoint" class="focal-point-btn">
      + Add Focal Point
    </button>

    <h3>Add Target</h3>
    <button @click="addTarget" class="target-btn">
      + Add Target
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
import { ref } from 'vue';
import { useSceneStore } from '@/stores/sceneStore';
import Rectangle from '@/geometry/Rectangle';
import Square from '@/geometry/Square';
import Ellipse from '@/geometry/Ellipse';
import Circle from '@/geometry/Circle';
import Triangle from '@/geometry/Triangle';
import EquilateralTriangle from '@/geometry/EquilateralTriangle';
import FocalPoint from '@/geometry/FocalPoint';
import Target from '@/geometry/Target';

const sceneStore = useSceneStore();
const selectedShape = ref('');

// Default positions for new shapes (center of a typical canvas)
const getDefaultPosition = () => ({
  x: 400,
  y: 300
});

const addFocalPoint = () => {
  const position = getDefaultPosition()
  const focalPoint = new FocalPoint({
    x: position.x,
    y: position.y,
    rayCount: 32,
    rayLength: 1000
  });

  sceneStore.addObject(focalPoint, true);
  console.log('Created FocalPoint');
};

const addTarget = () => {
  const position = getDefaultPosition();
  const target = new Target({
    x: position.x,
    y: position.y,
    size: 30
  });

  sceneStore.addObject(target, true);
  console.log('Created Target');
};

const handleShapeSelection = () => {
  const shapeType = selectedShape.value;

  if (!shapeType) return;

  const position = getDefaultPosition();
  let newObject = null;

  switch (shapeType) {
    case 'Rectangle':
      newObject = new Rectangle({
        x: position.x,
        y: position.y,
        width: 100,
        height: 60
      });
      break;

    case 'Square':
      newObject = new Square({
        x: position.x,
        y: position.y,
        sideLength: 80
      });
      break;

    case 'Ellipse':
      newObject = new Ellipse({
        x: position.x,
        y: position.y,
        rx: 60,
        ry: 40
      });
      break;

    case 'Circle':
      newObject = new Circle({
        x: position.x,
        y: position.y,
        radius: 50
      });
      break;

    case 'Triangle':
      newObject = new Triangle({
        x: position.x,
        y: position.y,
        side1: 60,
        side2: 60,
        side3: 60
      });
      break;

    case 'EquilateralTriangle':
      newObject = new EquilateralTriangle({
        x: position.x,
        y: position.y,
        sideLength: 60
      });
      break;
  }

  if (newObject) {
    sceneStore.addObject(newObject, true);
    console.log(`Created ${shapeType}`);
  }

  // Reset dropdown to placeholder
  selectedShape.value = '';
}
</script>

<style scoped>
.tool-palette {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tool-palette h3 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tool-palette h3:not(:first-child) {
  margin-top: 1.25rem;
}

.focal-point-btn,
.target-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.focal-point-btn::before,
.target-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.focal-point-btn:hover::before,
.target-btn:hover::before {
  left: 100%;
}

.focal-point-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.focal-point-btn:active {
  transform: translateY(0);
}

.target-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}

.target-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
}

.target-btn:active {
  transform: translateY(0);
}

.shape-dropdown {
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: rgba(30, 30, 50, 0.6);
  color: #ffffff;
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 10px;
  font-size: 0.875rem;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.shape-dropdown:hover {
  border-color: rgba(102, 126, 234, 0.6);
  background: rgba(30, 30, 50, 0.8);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.shape-dropdown:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.shape-dropdown option {
  background: #1a1a2e;
  color: #ffffff;
  padding: 0.5rem;
}

.shape-dropdown optgroup {
  background: rgba(20, 20, 35, 0.95);
  color: #aaaaaa;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>