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
        this.app.stage.addChild(this.container);   // Add on top layer

        // Ray tracer
        this.rayTracer = new RayTracer(sceneStore, {
            maxBounces: simulationStore.maxBounces,
            minIntensity: simulationStore.minIntensity,
            canvasWidth: app.screen.width,
            canvasHeight: app.screen.height
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

        // Trace all rays (returns segment trees)
        const allSegments = this.rayTracer.traceAll();

        // Render each path
        const color = this.hexToNumber(this.simulationStore.rayColor);
        const alpha = this.simulationStore.rayOpacity;
        const width = this.simulationStore.rayWidth;

        allSegments.forEach(segment => {
            this.drawSegmentTree(segment, color, alpha, width);
        });
    }

    /**
     * Draw a ray segment tree recursively
     */
    drawSegmentTree(segment, color, alpha, width) {
        // Draw this segment
        this.rayGraphics.moveTo(segment.start.x, segment.start.y);
        this.rayGraphics.lineTo(segment.end.x, segment.end.y);
        this.rayGraphics.stroke({
            width: width,
            color: color,
            alphaL: alpha
        });

        // Draw all children
        if (segment.children && segment.children.length > 0) {
            segment.children.forEach(child => {
                this.drawSegmentTree(child, color, alpha, width);
            });
        }
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