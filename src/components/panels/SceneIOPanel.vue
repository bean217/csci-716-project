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
  padding: 0.875rem;
  background: rgba(30, 30, 50, 0.4);
  border-radius: 12px;
  margin-bottom: 1.25rem;
  border: 1px solid rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.scene-io-panel:hover {
  background: rgba(30, 30, 50, 0.5);
  border-color: rgba(102, 126, 234, 0.3);
}

.panel-header {
  cursor: pointer;
  user-select: none;
  padding: 0.25rem 0;
  transition: all 0.3s ease;
}

.panel-header:hover h3 {
  background: linear-gradient(135deg, #7e92f5 0%, #8e5cb8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.panel-header h3 {
  font-size: 0.9375rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  transition: all 0.3s ease;
}

.panel-content {
  margin-top: 0.875rem;
  padding-top: 0.875rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideDown 0.3s ease-out;
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

.io-section {
  margin-bottom: 1rem;
}

.io-section:last-of-type {
  margin-bottom: 0.5rem;
}

.io-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

.io-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.io-btn:hover::before {
  left: 100%;
}

.export-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.export-btn:active {
  transform: translateY(0);
}

.import-btn {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  box-shadow: 0 4px 12px rgba(56, 239, 125, 0.3);
}

.import-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(56, 239, 125, 0.4);
}

.import-btn:active {
  transform: translateY(0);
}

.clear-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}

.clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
}

.clear-btn:active {
  transform: translateY(0);
}

.hint {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.375rem;
  margin-bottom: 0;
  font-style: italic;
}

.status-message {
  padding: 0.75rem 0.875rem;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 500;
  margin-top: 0.875rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.status-message.success {
  background: rgba(56, 239, 125, 0.15);
  color: #38ef7d;
  border: 1px solid rgba(56, 239, 125, 0.3);
  box-shadow: 0 4px 12px rgba(56, 239, 125, 0.1);
}

.status-message.error {
  background: rgba(245, 87, 108, 0.15);
  color: #f5576c;
  border: 1px solid rgba(245, 87, 108, 0.3);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.1);
}
</style>