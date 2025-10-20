/**
 * file: src/pixi/renderers/GeometryRenderer.js
 * desc: Defines rendering logic for an entire scene.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 19 October 2025
 */

import * as PIXI from "pixi.js";
import { watch } from 'vue';

/**
 * Geometry Renderer - Renders geometric objects from the scene store
 */
export default class GeometryRenderer {
    constructor(app, sceneStore) {

        this.app = app;
        this.sceneStore = sceneStore;

        // Container for all geometric objects
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);

        // Map of object IDs to PIXI Graphics objects
        this.graphics = new Map();

        // Watch for changes in the scene store
        this.setupWatchers();

        // Initial render
        this.renderAll();
    }

    /**
     * Setup Vue watchers for reactive rendering
     */
    setupWatchers() {
        // Watch for changes to the objects array
        watch(
            () => this.sceneStore.objects,
            () => {
                this.renderAll();
            },
            { deep: true }
        );

        // Watch for selection changes
        watch(
            () => this.sceneStore.selectedObjectId,
            () => {
                this.renderAll();
            }
        )
    }

    /**
     * Render all objects in the scene
     */
    renderAll() {
        // Clear existing graphics
        this.clearAll();

        // Render each object in the scene store
        this.sceneStore.objects.forEach(obj => {
            this.renderObject(obj);
        });
    }

    /**
     * Clear all currently rendered graphics
     */
    clearAll() {
        this.graphics.forEach(graphic => {
            this.container.removeChild(graphic);
            graphic.destroy();
        });
        this.graphics.clear();
    }

    /**
     * Render a single geometric object
     */
    renderObject(obj) {
        const graphic = new PIXI.Graphics();

        // Determine if this object is selected
        const isSelected = obj.id === this.sceneStore.selectedObjectId;

        // Draw based on object type
        switch (obj.type) {
            case 'Rectangle':
            case 'Square':
                this.drawRectangle(graphic, obj, isSelected);
                break;
            case 'Ellipse':
            case 'Circle':
                this.drawEllipse(graphic, obj, isSelected);
                break;
            case 'Triangle':
            case 'EquilateralTriangle':
                this.drawTriangle(graphic, obj, isSelected);
                break;
            default:
                console.warn(`Unknown object type: ${obj.type}`);
        }

        // Add graphic to container and map
        this.container.addChild(graphic);
        this.graphics.set(obj.id, graphic);
    }

    /**
     * Draw a rectangle
     */
    drawRectangle(graphic, obj, isSelected) {
        const vertices = obj.getVertices();

        // Draw fill
        const points = [];
        vertices.forEach(v => {
            points.push(v.x, v.y);
        });

        // Draw filled polygon
        graphic.poly(points);
        graphic.fill({
            color: this.hexToNumber(obj.fillColor),
            alpha: 1
        });

        // Draw stroke (need to draw the path again)
        graphic.poly(points);
        graphic.stroke({
            width: isSelected ? 3 : 2,
            color: this.hexToNumber(obj.edgeColor),
            alpha: 1
        });

        // Drawn selection highlight
        if (isSelected) {
            this.drawSelectionHighlight(graphic, vertices);
        }
    }

    /**
     * Draw an ellipse
     */
    drawEllipse(graphic, obj, isSelected) {
        const vertices = obj.getVertices(32);
        // Convert vertices to flat array
        const points = [];
        vertices.forEach(v => {
            points.push(v.x, v.y);
        });

        // Draw filled polygon
        graphic.poly(points);
        graphic.fill({
            color: this.hexToNumber(obj.fillColor),
            alpha: 1
        })

        // Draw stroke
        graphic.poly(points);
        graphic.stroke({
            width: isSelected ? 3 : 2,
            color: this.hexToNumber(obj.edgeColor),
            alpha: 1
        });

        // Draw selection highlight
        if (isSelected) {
            this.drawSelectionHighlight(graphic, vertices);
        }
    }

    /**
     * Draw triangle
     */
    drawTriangle(graphic, obj, isSelected) {
        const vertices = obj.getVertices()

        // Convert vertices to flat array
        const points = []
        vertices.forEach(v => {
            points.push(v.x, v.y)
        })

        // Draw filled polygon
        graphic.poly(points)
        graphic.fill({
            color: this.hexToNumber(obj.fillColor),
            alpha: 1
        })

        // Draw stroke
        graphic.poly(points)
        graphic.stroke({
            width: isSelected ? 3 : 2,
            color: this.hexToNumber(obj.edgeColor),
            alpha: 1
        })

        // Draw selection highlight
        if (isSelected) {
            this.drawSelectionHighlight(graphic, vertices)
        }
    }

    /**
     * Draw selection highlight around object
     */
    drawSelectionHighlight(graphic, vertices) {
        // Draw selection handles as vertices
        vertices.forEach(vertex => {
           graphic.circle(vertex.x, vertex.y, 5);
           graphic.fill(0x4a9eff);
        });

        // Draw bounding box
        const xs = vertices.map(v => v.x);
        const ys = vertices.map(v => v.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        graphic.rect(minX - 5, minY - 5, maxX - minX + 10, maxY - minY + 10);
        graphic.stroke({
            width: 1,
            colorL: 0x4a9eff,
            alpha: 0.5
        });

    }

    /**
     * Convert hex color string to number
     */
    hexToNumber(hex) {
        // Remove # if present
        if (hex.startsWith('#')) {
            hex = hex.substring(1);
        }
        return parseInt(hex, 16);
    }

    /**
     * Destroy renderer and clear up
     */
    destroy() {
        this.clearAll();
        this.app.stage.removeChild(this.container);
        this.container.destroy();
    }
}