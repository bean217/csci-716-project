/**
 * file: src/pixi/renderers/RayRenderer.js
 * desc: Defines rendering logic for light rays.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 20 October 2025
 */

import * as PIXI from 'pixi.js';
import { watch } from 'vue';
import RayTracer from '@/simulation/RayTracer.js';

/**
 * RayRenderer - Renders ray paths from the ray tracer
 */
export default class RayRenderer {
    constructor(app, sceneStore, simulationStore) {
        this.app = app;
        this.sceneStore = sceneStore;
        this.simulationStore = simulationStore;

        // Container for rays (rendered below shapes)
        this.container = new PIXI.Container();
        this.app.stage.addChildAt(this.container, 0);   // Add at bottom layer

        // Ray tracer
        this.rayTracer = new RayTracer(sceneStore, {
            maxBounces: simulationStore.maxBounces,
            minIntensity: simulationStore.minIntensity
        });

        // Graphics for rays
        this.rayGraphics = new PIXI.Graphics();
        this.container.addChild(this.rayGraphics);

        // Setup watchers
        this.setupWatchers();

        // Initial render
        this.render();
    }

    /**
     * Setup Vue watchers
     */
    setupWatchers() {
        // Watch for changes to objects
        watch(
            () => this.sceneStore.objects,
            () => this.render(),
            { deep: true }
        );

        // Watch for changes to focal points
        watch(
            () => this.sceneStore.focalPoints,
            () => this.render(),
            { deep: true }
        );

        // Watch for simulation settings changes
        watch(
            () => [
                this.simulationStore.showRays,
                this.simulationStore.maxBounces,
                this.simulationStore.minIntensity,
                this.simulationStore.rayOpacity,
                this.simulationStore.rayColor,
                this.simulationStore.rayWidth
            ],
            () => this.render()
        )
    }

    /**
     * Render all rays
     */
    render() {
        this.rayGraphics.clear();

        if (!this.simulationStore.showRays) {
            return;
        }

        // Update ray tracer settings
        this.rayTracer.settings.maxBounces = this.simulationStore.maxBounces;
        this.rayTracer.settings.minIntensity = this.simulationStore.minIntensity;

        // Trace all rays
        const allPaths = this.rayTracer.traceAll();

        // Render each path
        const color = this.hexToNumber(this.simulationStore.rayColor);
        const alpha = this.simulationStore.rayOpacity;
        const width = this.simulationStore.rayWidth;

        allPaths.forEach(path => {
            this.drawPath(path, color, alpha, width);
        });
    }

    /**
     * Draw a ray path
     */
    drawPath(path, color, alpha, width) {
        if (path.length < 2) return;

        // Start path
        this.rayGraphics.moveTo(path[0].x, path[0].y);

        // Draw lines to each point
        for (let i = 1; i < path.length; i++) {
            this.rayGraphics.lineTo(path[i].x, path[i].y);
        }

        // Apply stroke
        this.rayGraphics.stroke({
            width: width,
            color: color,
            alpha: alpha
        });
    }

    /**
     * // TODO: This is duplicated from GeometryRenderer.js. Maybe put it into a utils file?
     * Convert hex color string to number
     */
    hexToNumber(hex) {
        if (hex.startsWith('#')) {
            hex = hex.substring(1);
        }
        return parseInt(hex, 16);
    }

    /**
     * Destroy renderer
     */
    destroy() {
        this.container.removeChild(this.rayGraphics);
        this.rayGraphics.destroy();
        this.app.stage.removeChild(this.container);
        this.container.destroy();
    }
}