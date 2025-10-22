/**
 * file: src/pixi/PixiApp.js
 * desc: Main PixiJS application with responsive resizing
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 22 October 2025
 */

import * as PIXI from 'pixi.js'
import GeometryRenderer from '@/pixi/renderers/GeometryRenderer.js';
import RayRenderer from '@/pixi/renderers/RayRenderer.js';
import InteractionManager from '@/pixi/interactions/InteractionManager.js';

export default class PixiApp {
    constructor(container, sceneStore = null, simulationStore = null) {
        this.container = container
        this.app = null;
        this.sceneStore = sceneStore;
        this.simulationStore = simulationStore;

        // Renderers
        this.geometryRenderer = null;
        this.rayRenderer = null;
        this.interactionManager = null;

        // Resize handling
        this.resizeObserver = null;
        this.resizeTimeout = null;
    }

    async init(container) {
        // Create PIXI Application (async in PixiJS 7+)
        this.app = new PIXI.Application()

        await this.app.init({
            width: container.clientWidth,
            height: container.clientHeight,
            backgroundColor: 0x1a1a1a,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        })

        // Append canvas to container
        container.appendChild(this.app.canvas)

        // Handle window resize
        // this.handleResize = this.handleResize.bind(this)
        // window.addEventListener('resize', this.handleResize)

        // Initialize renderers if stores are provided
        if (this.sceneStore && this.simulationStore) {
            // Geometry renderer (top layer)
            this.geometryRenderer = new GeometryRenderer(this.app, this.sceneStore);
            // Ray renderer(bottom layer)
            this.rayRenderer = new RayRenderer(this.app, this.sceneStore, this.simulationStore);
            // Interaction manager
            this.interactionManager = new InteractionManager(this.app, this.sceneStore);
        }

        // Setup resize handling
        this.setupResizeHandling();
    }

    /**
     * Setup responsive resize handling using Resize observer
     */
    setupResizeHandling() {
        // Use ResizeObserver for better performance than window resize
        this.resizeObserver = new ResizeObserver(entries => {
            // Debounce resize to avoid too many updates
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    this.handleResize(width, height);
                }
            }, 100);    // 100ms debounce
        });

        this.resizeObserver.observe(this.container);

        // Also listen to window resize as fallback
        this.boundHandleWindowResize = this.handleWindowResize.bind(this);
        window.addEventListener('resize', this.boundHandleWindowResize);
    }

    /**
     * Handle window resize event (fallback)
     */
    handleWindowResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;
            this.handleResize(width, height);
        }, 100);    // 100ms debounce
    }

    /**
     * Handle resize of the canvas
     * @param {number} width - New width
     * @param {number} height - New height
     */
    handleResize(width, height) {
        if (!this.app || width <= 0 || height <= 0) return;

        console.log(`Resizing canvas to ${width}x${height}`);

        // Resize the renderer
        this.app.renderer.resize(width, height);

        // Update ray tracer canvas boundaries
        if (this.rayRenderer && this.rayRenderer.rayTracer) {
            this.rayRenderer.rayTracer.settings.canvasWidth = width;
            this.rayRenderer.rayTracer.settings.canvasHeight = height;

            // Re-render rays with new boundaries
            if (this.simulationStore.showRays) {
                this.rayRenderer.render();
            }
        }

        // Re-render geometry
        if (this.geometryRenderer) {
            this.geometryRenderer.renderAll();
        }
    }

    /**
     * Destroy the application and clean up
     */
    destroy() {
        // Clear resize timeout
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }

        // Disconnect resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        // Remove window resize listener
        if (this.boundHandleWindowResize) {
            window.removeEventListener('resize', this.boundHandleWindowResize);
        }

        // Destroy managers and renderers
        if (this.interactionManager) {
            this.interactionManager.destroy();
        }

        if (this.rayRenderer) {
            this.rayRenderer.destroy();
        }

        if (this.geometryRenderer) {
            this.geometryRenderer.destroy();
        }

        // Destroy PixiJS app
        if (this.app) {
            this.app.destroy(true, { children: true, texture: true });
        }
    }
}
