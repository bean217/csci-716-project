<template>
  <div class="scene-io-panel">
    <h3>Scene Management</h3>

    <!-- Export Section -->
    <div class="io-section">
      <h4>Export Scene</h4>
      <button @click="exportScene" class="io-btn export-btn">
        💾 Save Scene
      </button>
      <p class="hint">Download current scene as JSON file</p>
    </div>

    <!-- Import Section -->
    <div class="io-section">
      <h4>Import Scene</h4>
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
      <h4>Clear Scene</h4>
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
</template>

<script setup>
import { ref } from 'vue'
import { useSceneStore } from '@/stores/sceneStore'

const sceneStore = useSceneStore()
const fileInput = ref(null)
const statusMessage = ref('')
const statusType = ref('') // 'success' or 'error'

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
 * Trigger file input click
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

      // Validate format
      if (!jsonData.scene) {
        throw new Error('Invalid scene file format')
      }

      // Import scene
      sceneStore.importScene(jsonData.scene)

      showStatus('Scene loaded successfully!', 'success')
    } catch (error) {
      console.error('Import error:', error)
      showStatus('Failed to load scene: ' + error.message, 'error')
    }

    // Reset file input
    event.target.value = ''
  }

  reader.onerror = () => {
    showStatus('Failed to read file', 'error')
    event.target.value = ''
  }

  reader.readAsText(file)
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
 * Show status message
 */
const showStatus = (message, type) => {
  statusMessage.value = message
  statusType.value = type

  // Clear after 3 seconds
  setTimeout(() => {
    statusMessage.value = ''
    statusType.value = ''
  }, 3000)
}
</script>

<style scoped>
.scene-io-panel {
  padding: 16px;
  background: #2a2a2a;
  border-radius: 8px;
  margin-bottom: 16px;
}

.scene-io-panel h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #ffffff;
}

.io-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #444;
}

.io-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.io-section h4 {
  font-size: 13px;
  font-weight: 600;
  color: #aaaaaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.io-btn {
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 6px;
}

.export-btn {
  background: #4a9eff;
  color: #ffffff;
}

.export-btn:hover {
  background: #6bb3ff;
}

.import-btn {
  background: #2ecc71;
  color: #ffffff;
}

.import-btn:hover {
  background: #27ae60;
}

.clear-btn {
  background: #e74c3c;
  color: #ffffff;
}

.clear-btn:hover {
  background: #c0392b;
}

.hint {
  font-size: 11px;
  color: #888;
  margin: 0;
  font-style: italic;
}

.status-message {
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  margin-top: 12px;
  animation: slideIn 0.3s ease-out;
}

.status-message.success {
  background: #27ae60;
  color: #ffffff;
}

.status-message.error {
  background: #e74c3c;
  color: #ffffff;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>