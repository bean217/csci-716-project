<template>
  <div class="scene-io-panel">
    <div class="panel-header" @click="isExpanded = !isExpanded">
      <h3>{{ isExpanded ? '▼' : '▶' }} Scene Management</h3>
    </div>

    <div v-show="isExpanded" class="panel-content">
      <!-- Export Section -->
      <div class="io-section">
        <button @click="exportScene" class="io-btn export-btn">
          💾 Save Scene
        </button>
        <p class="hint">Download current scene as JSON file</p>
      </div>

      <!-- Import Section -->
      <div class="io-section">
        <input
            ref="fileInput"
            type="file"
            accept=".json"
            @change="handleFileSelect"
            style="display: none"
        />
        <button @click="triggerFileInput" class="io-btn import-btn">
          📂 Load Scene
        </button>
        <p class="hint">Load scene from JSON file</p>
      </div>

      <!-- Clear Scene -->
      <div class="io-section">
        <button @click="clearScene" class="io-btn clear-btn">
          🗑️ Clear All
        </button>
        <p class="hint">Remove all objects from scene</p>
      </div>

      <!-- Status Message -->
      <div v-if="statusMessage" class="status-message" :class="statusType">
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSceneStore } from '@/stores/sceneStore'

const sceneStore = useSceneStore()
const fileInput = ref(null)
const statusMessage = ref('')
const statusType = ref('') // 'success' or 'error'
const isExpanded = ref(false)

/**
 * Export the current scene as JSON file
 */
const exportScene = () => {
  try {
    // Get scene data
    const sceneData = sceneStore.exportScene()

    // Add metadata
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      scene: sceneData
    }

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2)

    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `scene-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showStatus('Scene exported successfully!', 'success')
  } catch (error) {
    console.error('Export error:', error)
    showStatus('Failed to export scene', 'error')
  }
}

/**
 * Trigger the hidden file input
 */
const triggerFileInput = () => {
  fileInput.value.click()
}

/**
 * Handle file selection
 */
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const jsonData = JSON.parse(e.target.result)

      // Validate structure
      if (!jsonData.scene) {
        throw new Error('Invalid scene file format')
      }

      // Import the scene
      sceneStore.importScene(jsonData.scene)
      showStatus('Scene loaded successfully!', 'success')
    } catch (error) {
      console.error('Import error:', error)
      showStatus('Failed to load scene: ' + error.message, 'error')
    }
  }

  reader.onerror = () => {
    showStatus('Failed to read file', 'error')
  }

  reader.readAsText(file)

  // Reset input
  event.target.value = ''
}

/**
 * Clear the entire scene
 */
const clearScene = () => {
  if (confirm('Are you sure you want to clear the entire scene? This cannot be undone.')) {
    sceneStore.clearScene()
    showStatus('Scene cleared', 'success')
  }
}

/**
 * Show a status message
 */
const showStatus = (message, type) => {
  statusMessage.value = message
  statusType.value = type

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    statusMessage.value = ''
    statusType.value = ''
  }, 3000)
}
</script>

<style scoped>
.scene-io-panel {
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

.io-section {
  margin-bottom: 16px;
}

.io-section:last-of-type {
  margin-bottom: 8px;
}

.io-btn {
  width: 100%;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #ffffff;
}

.export-btn {
  background: #4a9eff;
}

.export-btn:hover {
  background: #6bb3ff;
}

.import-btn {
  background: #50c878;
}

.import-btn:hover {
  background: #6fd992;
}

.clear-btn {
  background: #ff6b6b;
}

.clear-btn:hover {
  background: #ff8787;
}

.hint {
  font-size: 12px;
  color: #888;
  margin-top: 6px;
  margin-bottom: 0;
}

.status-message {
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  margin-top: 12px;
}

.status-message.success {
  background: rgba(80, 200, 120, 0.2);
  color: #50c878;
  border: 1px solid rgba(80, 200, 120, 0.3);
}

.status-message.error {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
}
</style>