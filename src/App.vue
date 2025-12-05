<template>
  <div id="app-wrapper">
    <!-- Header Section -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="main-title">
          <span class="title-icon">✨</span>
          Ray Tracing Simulator
          <span class="title-accent">2D</span>
        </h1>
        <p class="subtitle">Interactive Light Physics Visualization</p>
      </div>
    </header>

    <!-- Main Canvas & UI Area -->
    <div id="app-container">
      <CanvasContainer />
      <div id="ui-panel">
        <div class="panel-title">
          <h2>Controls</h2>
        </div>
        <SceneIOPanel />
        <SimulationControlPanel />
        <ToolPalette />
        <PropertyPanel />
      </div>
    </div>

    <!-- Info Sections -->
    <div id="project-info">
      <div class="info-content">
        <!-- Project Logistics Section -->
        <div class="info-section">
          <div class="section-header" @click="toggleLogistics">
            <h2>
              <span class="expand-icon">{{ isLogisticsExpanded ? '▼' : '▶' }}</span>
              CSCI 716 Logistics
            </h2>
          </div>
          <div v-show="isLogisticsExpanded" class="section-content">
            <h3>Authors</h3>
            <p>Bejamin Piro, Matt Pasetto, and Logan Endes</p>
            <h3>Problem Description</h3>
            <p>Our application portrays how light rays bounce in a closed system: showing bounces, reflections, and refractions of ray tracing with custom obstacles step-by-step.</p>
            <h3>Background Information</h3>
            <p>Our ray tracing simulator implements a 2D light system that models physics principles such as reflection, refraction, and total internal reflection. The core algorithm traces rays from light sources, or focal points, through a scene containing geometric obstacles with customizable material properties. All obstacles are able to have different values for absorptance, reflectivity, and the refractive index, where the absorptance is how much light the shape absorbs, reflectivity is how much light can bounce off of the object (think of matte vs. mirror), and the refractive index is how much light bends when going through an obstacle.</p>
            <p>We made a few key assumptions when designing this simulator:</p>
            <ul>
              <li>Rays travel in straight lines until intersecting with objects.</li>
              <li>Materials have uniform properties (reflectivity, refractive index, absorptance) across their surfaces.</li>
              <li>Light intensity decreases based on material absorptance at each interaction.</li>
              <li>The simulation operates in a 2D plane with air as the default medium, ignoring out-of-plane effects.</li>
            </ul>
            <h3>Pseudo-Code</h3>
            <!-- <div class="pseudo-code-section"> -->
              <pre>FUNCTION traceAll():
  // Build/rebuild BVH spatial acceleration structure if needed
  IF bvhDirty OR bvh is null:
      rebuildBVH()

  allSegments = []

  // For each focal point (light source) in the scene
  FOR EACH focalPoint IN sceneStore.focalPoints:
      segments = traceFocalPoint(focalPoint)
      allSegments.append(segments)

  RETURN allSegments  // These segments are then rendered/ANIMATED

FUNCTION traceFocalPoint(focalPoint):
  allSegments = []
  
  IF focalPoint.emitFromSurface:
      // Rays originate from the surface of the focal point
      rayData = focalPoint.getRayOriginsAndDirections()
      FOR EACH {origin, direction} IN rayData:
          startingMedium = findContainingObject(origin)
          ray = new Ray(origin, direction, intensity=1.0, generation=0)
          segments = traceRay(ray, focalPoint.rayLength, startingMedium)
          allSegments.append(segments)
  ELSE:
      // Rays originate from the center of the focal point
      startingMedium = findContainingObject(focalPoint.position)
      directions = focalPoint.getRayDirections()
      FOR EACH direction IN directions:
          ray = new Ray(focalPoint.position, direction, intensity=1.0, generation=0)
          segments = traceRay(ray, focalPoint.rayLength, startingMedium)
          allSegments.append(segments)
  
  RETURN allSegments

FUNCTION traceRay(ray, maxDistance, currentMedium):
  segments = []
  rayQueue = [{ray, medium: currentMedium, distance: maxDistance, 
              startPoint: ray.origin, segments, parent: null}]
  
  WHILE rayQueue is not empty:
      {currentRay, insideObject, remainingDistance, startPoint, 
      parentSegments, parentSegment} = rayQueue.dequeue()
      
      // Stop if ray intensity is too low
      IF currentRay.intensity < minIntensity:
          CONTINUE
      
      // Find closest intersection with scene objects or canvas boundary
      intersection = findClosestIntersection(currentRay, insideObject)
      canvasBoundaryDist = getCanvasBoundaryDistance(currentRay)
      
      // Determine what we hit first
      candidates = []
      IF intersection.hit:
          candidates.append({type: 'object' or 'target', 
                            distance: intersection.distance, data: intersection})
      IF canvasBoundaryDist != null:
          candidates.append({type: 'canvas', 
                            distance: canvasBoundaryDist, data: canvasBoundaryDist})
      
      IF candidates is empty:
          CONTINUE
      
      // Sort by distance and get closest hit
      closestHit = candidates.sortByDistance()[0]
      
      // Create ray segment based on what we hit
      IF closestHit.type == 'canvas':
          // Ray exits canvas - create final segment
          endPoint = currentRay.pointAt(closestHit.distance)
          segment = {start: startPoint, end: endPoint, 
                    intensity: currentRay.intensity, 
                    hitsTarget: false, parent: parentSegment, children: []}
          parentSegments.append(segment)  // ANIMATED: This segment is drawn
          
      ELSE IF closestHit.type == 'target':
          // Ray hits a target - mark entire path and stop
          segment = {start: startPoint, end: intersection.point,
                    intensity: currentRay.intensity,
                    hitsTarget: true, parent: parentSegment, children: []}
          parentSegments.append(segment)  // ANIMATED: Highlighted in red
          markPathToTarget(parentSegment)  // ANIMATED: All parent segments turn red
          
      ELSE IF closestHit.type == 'object':
          // Ray hits a geometric object
          segment = {start: startPoint, end: intersection.point,
                    intensity: currentRay.intensity,
                    hitsTarget: false, parent: parentSegment, children: []}
          parentSegments.append(segment)  // ANIMATED: This segment is drawn
          
          // Check if we can continue tracing
          IF intersection.distance >= remainingDistance:
              CONTINUE  // Exceeded max distance
          
          newRemainingDistance = remainingDistance - intersection.distance
          IF newRemainingDistance <= 0 OR currentRay.generation >= maxBounces:
              CONTINUE  // Out of distance or bounces
          
          // Calculate reflection and refraction rays
          nextRays = calculateNextRays(currentRay, intersection, insideObject)
          
          // Add reflected ray to queue
          IF nextRays.reflected:
              rayQueue.enqueue({
                  ray: nextRays.reflected,
                  medium: nextRays.reflectedMedium,
                  distance: newRemainingDistance,
                  startPoint: intersection.point,
                  segments: segment.children,  // Child segments
                  parent: segment
              })
          
          // Add refracted ray to queue
          IF nextRays.refracted:
              rayQueue.enqueue({
                  ray: nextRays.refracted,
                  medium: nextRays.refractedMedium,
                  distance: newRemainingDistance,
                  startPoint: intersection.point,
                  segments: segment.children,  // Child segments
                  parent: segment
              })
  
  RETURN segments  // All segments form a tree structure

FUNCTION calculateNextRays(ray, intersection, currentMedium):
  material = intersection.object.material
  
  // If material absorbs all light, no reflection/refraction
  IF material.absorptance > 0.999:
      RETURN {reflected: null, refracted: null, ...}
  
  // Determine refractive indices
  n1 = currentMedium ? currentMedium.material.refractiveIndex : airRefractiveIndex
  n2 = currentMedium ? airRefractiveIndex : material.refractiveIndex
  
  // Calculate reflection direction using law of reflection
  reflectedDir = reflect(ray.direction, intersection.normal)
  // Formula: R = I - 2(I·N)N
  
  // Calculate refraction direction using Snell's law
  refractedDir = refract(ray.direction, intersection.normal, n1, n2)
  // Returns null if total internal reflection occurs
  
  // Determine new medium
  newMedium = currentMedium ? null : intersection.object
  
  IF refractedDir:
      // Both reflection and refraction occur
      reflectedRay = ray.spawn(intersection.point, reflectedDir, 
                              (1 - absorptance) * reflectivity)
      refractedRay = ray.spawn(intersection.point, refractedDir,
                              (1 - absorptance) * (1 - reflectivity))
      RETURN {reflected: reflectedRay, refracted: refractedRay, ...}
  ELSE:
      // Total internal reflection - only reflection
      reflectedRay = ray.spawn(intersection.point, reflectedDir, 1 - absorptance)
      RETURN {reflected: reflectedRay, refracted: null, ...}

FUNCTION findClosestIntersection(ray, currentMedium):
  // If inside an object, check for exit intersection first
  exitIntersection = currentMedium ? 
      rayObjectIntersection(ray, currentMedium) : noHit()
  
  // Find intersection with other objects (using BVH or brute force)
  otherIntersection = useBVH ? 
      bvh.traverse(ray, currentMedium) : 
      findClosestIntersectionBruteForce(ray, currentMedium)
  
  // Return closest of exit and other intersections
  RETURN closest(exitIntersection, otherIntersection)

FUNCTION render(allSegments):
  // ANIMATED: Draw all ray segments
  FOR EACH segment IN allSegments:
      drawSegmentTree(segment, defaultColor, width)

FUNCTION drawSegmentTree(segment, color, width):
  // ANIMATED: Determine visual properties
  IF segment.hitsTarget:
      color = RED  // Highlight target paths
      alpha = 1.0
  ELSE:
      color = defaultColor
      alpha = sqrt(segment.intensity)  // Opacity based on intensity
  
  // ANIMATED: Draw line segment
  drawLine(segment.start, segment.end, color, alpha, width)
  
  // Recursively draw child segments (reflections/refractions)
  FOR EACH child IN segment.children:
      drawSegmentTree(child, color, width)
</pre>
                      
                <!-- <div class="pseudo-code-highlights"> -->
                  <h3>Animated Components</h3>
                  <ul>
                    <li><strong>Ray Segments:</strong> Each ray segment from origin to intersection point is drawn as a line on the canvas.</li>
                    <li><strong>Ray Intensity:</strong> The opacity of each ray segment is proportional to the square root of its intensity, creating a visual fade as light loses energy through absorption.</li>
                    <li><strong>Target Path Highlighting:</strong> When a ray hits a target object, the entire path from the origin to the target is highlighted in red.</li>
                    <li><strong>Reflection and Refraction:</strong> Child segments (reflected and refracted rays) are drawn recursively, showing how light splits at material boundaries.</li>
                    <li><strong>Real-time Updates:</strong> The entire ray tracing computation and rendering happens in real-time when:
                      <ul>
                        <li>Objects are added, moved, or deleted</li>
                        <li>Material properties change</li>
                        <li>Focal point properties change</li>
                        <li>Simulation settings change</li>
                      </ul>
                    </li>
                  </ul>
        <h3>Interesting Implementation Decisions</h3>
        <p>While implementing this simulator, we made some design decisions that may differ from similar tools.</p>
        <ul>
          <li><strong>Queue-Based Ray Tracing:</strong> Instead of just using recursive calls, rays are managed through a queue data structure. While the actual drawing of the rays still ends up using recursive calls, the queue structure allows finer control over termination conditions, and can help visualize the tracing step-by-step when debugging.</li>
          <li><strong>Total Internal Reflection Handling:</strong> The refraction calculation returns null when k < 0 in the refraction formula. In this case, only the reflected ray is spawned with full remaining intensity (minus absorption), correctly modeling the physical phenomenon where all light reflects when the critical angle is exceeded.</li>
          <li><strong>Segment Tree Structure:</strong> We stored ray paths as a tree of segments with parent-child relationships. Which allows for efficient path highlighting when a target is hit: the entire path from focal point to target can be marked by traversing up the parent chain, and it matches the branching nature of reflection and refraction.</li>
          <li><strong>Medium Tracking:</strong> We needed explicit medium state tracking; each ray carries a reference to the object it's currently inside, or null if it's in air. When a ray hits a surface, we have to check both for intersections with other objects and for exit intersections from the current medium, then compare distances to determine which happens first.</li>
        </ul>
      </div>
    </div>

        <!-- About Section -->
        <div class="info-section">
          <div class="section-header" @click="toggleAbout">
            <h2>
              <span class="expand-icon">{{ isAboutExpanded ? '▼' : '▶' }}</span>
              About This Project
            </h2>
          </div>
          <div v-show="isAboutExpanded" class="section-content">
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

        <!-- Functions Section -->
        <div class="info-section">
          <div class="section-header" @click="toggleFunctions">
            <h2>
              <span class="expand-icon">{{ isFunctionsExpanded ? '▼' : '▶' }}</span>
              How to Use
            </h2>
          </div>
          <div v-show="isFunctionsExpanded" class="section-content">
            <h3>Getting Started</h3>
            <ul>
              <li><strong>Add a Focal Point:</strong> Click "Add Focal Point" to create a light source that emits rays</li>
              <li><strong>Add Shapes:</strong> Use the dropdown to select and add geometric objects (rectangles, circles, triangles)</li>
              <li><strong>Add Targets:</strong> Place target markers to highlight specific ray paths</li>
            </ul>

            <h3>Editing Objects</h3>
            <ul>
              <li><strong>Select:</strong> Click on any object in the canvas to select it</li>
              <li><strong>Move:</strong> Click and drag objects to reposition them</li>
              <li><strong>Properties:</strong> Use the Property Panel to adjust position, rotation, colors, and material properties</li>
              <li><strong>Delete:</strong> Select an object and click the red ✕ button in the Property Panel</li>
            </ul>

            <h3>Ray Tracing Controls</h3>
            <ul>
              <li><strong>Max Bounces:</strong> Control how many times rays can reflect/refract (0-20)</li>
              <li><strong>Ray Width:</strong> Adjust the thickness of ray visualization</li>
              <li><strong>Ray Color:</strong> Customize the color of light rays</li>
              <li><strong>BVH Toggle:</strong> Enable/disable spatial acceleration for performance comparison</li>
            </ul>

            <h3>Scene Management</h3>
            <ul>
              <li><strong>Save Scene:</strong> Export your current scene as a JSON file</li>
              <li><strong>Load Scene:</strong> Import a previously saved scene</li>
              <li><strong>Clear All:</strong> Remove all objects and start fresh</li>
            </ul>
          </div>
        </div>

        <!-- Physics & Math Section -->
        <div class="info-section">
          <div class="section-header" @click="togglePhysics">
            <h2>
              <span class="expand-icon">{{ isPhysicsExpanded ? '▼' : '▶' }}</span>
              Physics & Math
            </h2>
          </div>
          <div v-show="isPhysicsExpanded" class="section-content">
            <h3>Reflection</h3>
            <p>
              Reflection is calculated using the law of reflection, where the angle of incidence equals the angle of reflection. This is the exact formula used in <code>LightCalculator.reflect()</code>.
            </p>
            <div class="formula-box">
              <div class="formula-title">Reflection Formula:</div>
              <code class="formula">R = I - 2(I · N)N</code>
              <div class="formula-explanation">
                <strong>Where:</strong><br>
                • <strong>R</strong> = Reflected ray direction<br>
                • <strong>I</strong> = Incident ray direction (normalized)<br>
                • <strong>N</strong> = Surface normal vector (normalized)<br>
                • <strong>I · N</strong> = Dot product of incident and normal
              </div>
            </div>

            <h3>Refraction (Snell's Law)</h3>
            <p>
              Refraction occurs when light passes through materials with different refractive indices. The simulator uses Snell's Law to calculate the refracted ray direction in <code>LightCalculator.refract()</code>.
            </p>
            <div class="formula-box">
              <div class="formula-title">Snell's Law:</div>
              <code class="formula">n₁ sin(θ₁) = n₂ sin(θ₂)</code>
              <div class="formula-explanation">
                <strong>Where:</strong><br>
                • <strong>n₁</strong> = Refractive index of first medium<br>
                • <strong>n₂</strong> = Refractive index of second medium<br>
                • <strong>θ₁</strong> = Angle of incidence<br>
                • <strong>θ₂</strong> = Angle of refraction
              </div>
            </div>

            <div class="formula-box">
              <div class="formula-title">Refracted Direction (Implementation):</div>
              <code class="formula">T = η·I + (η·cosθᵢ - √k)N</code>
              <div class="formula-explanation">
                <strong>Where:</strong><br>
                • <strong>T</strong> = Refracted ray direction<br>
                • <strong>η</strong> = n₁/n₂ (ratio of refractive indices)<br>
                • <strong>cosθᵢ</strong> = -(I · N) (cosine of incident angle)<br>
                • <strong>k</strong> = 1 - η²(1 - cosθᵢ²)<br>
                • If <strong>k < 0</strong>, total internal reflection occurs (returns null)
              </div>
            </div>

            <h3>Total Internal Reflection</h3>
            <p>
              When light travels from a denser to a less dense medium at a steep angle, total internal reflection occurs. This happens when k < 0 in the refraction formula.
            </p>
            <div class="formula-box">
              <div class="formula-title">Critical Angle:</div>
              <code class="formula">θc = arcsin(n₂/n₁)</code>
              <div class="formula-explanation">
                When the angle of incidence exceeds the critical angle, all light is reflected rather than refracted.
              </div>
            </div>

            <h3>Fresnel Reflectance (Optional)</h3>
            <p>
              The simulator includes Schlick's approximation for Fresnel reflectance in <code>LightCalculator.fresnelReflectance()</code>, which calculates physically accurate reflection amounts based on viewing angle.
            </p>
            <div class="formula-box">
              <div class="formula-title">Schlick's Approximation:</div>
              <code class="formula">R(θ) = R₀ + (1 - R₀)(1 - cos θ)⁵</code>
              <div class="formula-explanation">
                <strong>Where:</strong><br>
                • <strong>R₀</strong> = ((n₁ - n₂)/(n₁ + n₂))² (reflectance at normal incidence)<br>
                • <strong>θ</strong> = Angle of incidence<br>
                • Currently available but not actively used for ray splitting
              </div>
            </div>

            <h3>Material Properties</h3>
            <ul>
              <li><strong>Reflectivity (0-1):</strong> Determines the split between reflected and refracted rays. 0 = all light refracts, 1 = perfect mirror</li>
              <li><strong>Refractive Index (1.0-2.5):</strong> Higher values bend light more. Air = 1.0, Glass ≈ 1.5, Diamond ≈ 2.4</li>
              <li><strong>Absorptance (0-1):</strong> How much light is absorbed at each interaction. Higher values = faster intensity decay</li>
            </ul>

            <h3>Implementation Details</h3>
            <ul>
              <li>Ray intensity is multiplied by <code>(1 - absorptance)</code> at each bounce</li>
              <li>Rays split into reflected and refracted components based on material <code>reflectivity</code> property</li>
              <li>Simulation stops when intensity drops below <code>minIntensity</code> threshold (default: 0.01)</li>
              <li>BVH (Bounding Volume Hierarchy) uses Surface Area Heuristic for O(log n) intersection testing</li>
              <li>All formulas implemented in <code>src/simulation/LightCalculator.js</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CanvasContainer from './components/canvas/CanvasContainer.vue'
import SceneIOPanel from './components/panels/SceneIOPanel.vue'
import SimulationControlPanel from './components/panels/SimulationControlPanel.vue'
import ToolPalette from './components/panels/ToolPalette.vue'
import PropertyPanel from './components/panels/PropertyPanel.vue'

const isAboutExpanded = ref(false)
const isLogisticsExpanded = ref(false)
const isFunctionsExpanded = ref(false)
const isPhysicsExpanded = ref(false)

const toggleAbout = () => {
  isAboutExpanded.value = !isAboutExpanded.value
}

const toggleLogistics = () => {
  isLogisticsExpanded.value = !isLogisticsExpanded.value
}

const toggleFunctions = () => {
  isFunctionsExpanded.value = !isFunctionsExpanded.value
}

const togglePhysics = () => {
  isPhysicsExpanded.value = !isPhysicsExpanded.value
}
</script>

<style scoped>
#app-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Header Styles */
.app-header {
  background: linear-gradient(135deg, rgba(15, 12, 41, 0.95) 0%, rgba(48, 43, 99, 0.85) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem 2rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 2rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.title-accent {
  font-size: 1.2rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
  vertical-align: super;
  margin-left: -0.3rem;
}

.subtitle {
  margin: 0.5rem 0 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
  letter-spacing: 1px;
}

/* Main Container */
#app-container {
  display: flex;
  width: 100%;
  height: 70vh;
  min-height: 500px;
  max-height: 900px;
  background: rgba(20, 20, 35, 0.6);
  backdrop-filter: blur(10px);
  position: relative;
  margin: 1.5rem auto;
  max-width: 1600px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

#app-container > :first-child {
  flex: 1;
  min-width: 0;
  position: relative;
}

/* UI Panel */
#ui-panel {
  width: 340px;
  min-width: 340px;
  max-width: 400px;
  background: linear-gradient(180deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 35, 0.98) 100%);
  backdrop-filter: blur(20px);
  color: #ffffff;
  padding: 0;
  box-shadow: -4px 0 30px rgba(0, 0, 0, 0.4);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1000;
  max-height: 100%;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  padding: 1.5rem 1.25rem 1rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.panel-title h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

#ui-panel > :not(.panel-title) {
  padding: 0 1.25rem;
}

#ui-panel > *:first-child:not(.panel-title) {
  padding-top: 1.25rem;
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

/* Custom Scrollbar */
#ui-panel::-webkit-scrollbar {
  width: 8px;
}

#ui-panel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

#ui-panel::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

#ui-panel::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #7e92f5 0%, #8e5cb8 100%);
}

/* Project Info Section */
#project-info {
  flex: 1;
  background: linear-gradient(135deg, rgba(240, 242, 255, 0.98) 0%, rgba(250, 250, 255, 0.95) 100%);
  padding: 2rem 2rem 4rem;
  min-height: auto;
  backdrop-filter: blur(10px);
}

.info-content {
  max-width: 1200px;
  margin: 0 auto;
  color: #2d3748;
}

/* Info Section Card */
.info-section {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  margin-bottom: 1.5rem;
  overflow: hidden;
  border: 1px solid rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.info-section:hover {
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

.section-header {
  cursor: pointer;
  user-select: none;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%);
  transition: all 0.3s ease;
}

.section-header:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.08) 100%);
}

.section-header h2 {
  font-size: 1.75rem;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.expand-icon {
  font-size: 1.25rem;
  color: #667eea;
  transition: transform 0.3s ease;
  display: inline-block;
}

.section-content {
  padding: 0 2rem 2rem 2rem;
  animation: slideDown 0.4s ease-out;
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

.section-content h3 {
  font-size: 1.375rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  color: #4a5568;
  font-weight: 600;
}

.section-content h3:first-child {
  margin-top: 0;
}

.section-content p {
  font-size: 1.0625rem;
  line-height: 1.8;
  margin-bottom: 1.25rem;
  color: #4a5568;
}

.section-content ul {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-content ul:last-child {
  margin-bottom: 0;
}

.section-content ul li {
  font-size: 1rem;
  line-height: 1.6;
  padding: 0.875rem 0.875rem 0.875rem 2.75rem;
  position: relative;
  color: #4a5568;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.15);
  transition: all 0.3s ease;
}

.section-content ul li:hover {
  transform: translateX(5px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.12);
  border-color: rgba(102, 126, 234, 0.25);
}

.section-content ul li::before {
  content: "✦";
  position: absolute;
  left: 1rem;
  color: #667eea;
  font-weight: bold;
  font-size: 1.125rem;
}

.section-content ul li strong {
  color: #2d3748;
  font-weight: 600;
}

/* Formula Boxes */
.formula-box {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%);
  border: 2px solid rgba(102, 126, 234, 0.25);
  border-radius: 12px;
  padding: 1.25rem;
  margin: 1.25rem 0;
  backdrop-filter: blur(5px);
}

.formula-title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 0.75rem;
}

.formula {
  display: block;
  font-family: 'Courier New', 'Consolas', monospace;
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  background: rgba(255, 255, 255, 0.8);
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  margin: 0.75rem 0;
  text-align: center;
  letter-spacing: 0.5px;
}

.formula-explanation {
  font-size: 0.9375rem;
  line-height: 1.8;
  color: #4a5568;
  margin-top: 0.875rem;
}

.formula-explanation strong {
  color: #2d3748;
  font-weight: 600;
}

.section-content code:not(.formula) {
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: 'Courier New', 'Consolas', monospace;
  font-size: 0.9em;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 1024px) {
  #app-container {
    height: 60vh;
    margin: 1rem;
  }

  #ui-panel {
    width: 300px;
    min-width: 300px;
  }

  .main-title {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 1.5rem 1rem 1rem;
  }

  .main-title {
    font-size: 1.5rem;
    flex-direction: column;
    gap: 0.25rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }

  #app-container {
    flex-direction: column;
    height: auto;
    min-height: 400px;
    margin: 1rem 0.5rem;
    border-radius: 12px;
  }

  #app-container > :first-child {
    height: 400px;
  }

  #ui-panel {
    width: 100%;
    max-width: none;
    max-height: 50vh;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  #project-info {
    padding: 1.5rem 1rem 2rem;
  }

  .section-header {
    padding: 1.25rem 1.5rem;
  }

  .section-header h2 {
    font-size: 1.35rem;
  }

  .section-content {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }

  .section-content h3 {
    font-size: 1.15rem;
  }

  .section-content p {
    font-size: 0.9375rem;
  }

  .section-content ul li {
    padding: 0.75rem 0.75rem 0.75rem 2.25rem;
    font-size: 0.875rem;
  }

  .formula-box {
    padding: 1rem;
    margin: 1rem 0;
  }

  .formula-title {
    font-size: 0.9375rem;
  }

  .formula {
    font-size: 0.9375rem;
    padding: 0.75rem 0.875rem;
  }

  .formula-explanation {
    font-size: 0.875rem;
  }
}
</style>