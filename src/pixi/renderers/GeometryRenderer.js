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

        // Watch for changes to focal points
        watch(
            () => this.sceneStore.focalPoints,
            () => {
                this.renderAll();
            },
            { deep: true }
        );

        // Watch for changes to target points
        watch(
            () => this.sceneStore.targets,
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

        // Render focal points
        this.sceneStore.focalPoints.forEach(fp => {
            this.renderObject(fp);
        });

        // Render targets
        this.sceneStore.targets.forEach(target => {
            this.renderObject(target);
        });
    }

    /**
     * Clear all currently rendered graphics
     */
    clearAll() {
        this.container.removeChildren();
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
            case 'FocalPoint':
                this.drawFocalPoint(graphic, obj, isSelected);
                break;
            case 'Target':
                this.drawTarget(graphic, obj, isSelected);
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
     * Draw a focal point
     */
    drawFocalPoint(graphic, obj, isSelected) {
        const vertices = obj.getVertices(16);

        // Convert vertices to flat array
        const points = [];
        vertices.forEach(v => {
            points.push(v.x, v.y);
        });

        // Draw filled circle
        graphic.poly(points);
        graphic.fill({
            color: this.hexToNumber(obj.fillColor),
            alpha: 0.8
        });

        // Draw stroke
        graphic.poly(points);
        graphic.stroke({
            width: isSelected ? 3 : 2,
            color: this.hexToNumber(obj.edgeColor),
            alpha: 1
        });

        // Draw crosshair at center
        const radius = obj.getRadius();
        const px = obj.position.x;
        const py = obj.position.y;

        // Horizontal line
        graphic.moveTo(px - radius, py);
        graphic.lineTo(px + radius, py);
        graphic.stroke({
            width: 1,
            color: this.hexToNumber(obj.edgeColor),
            alpha: 1
        });

        // Vertical line
        graphic.moveTo(px, py - radius);
        graphic.lineTo(px, py + radius);
        graphic.stroke({
            width: 1,
            color: this.hexToNumber(obj.edgeColor),
            alpha: 1
        });

        // Draw selection highlight
        if (isSelected) {
            this.drawSelectionHighlight(graphic, vertices);
        }
    }

    /**
     * Draw a target (diamond/rhombus shape)
     */
    drawTarget(graphic, obj, isSelected) {
        const vertices = obj.getVertices();

        // Convert vertices to flat array
        const points = [];
        vertices.forEach(v => {
            points.push(v.x, v.y);
        });

        // Draw filled diamond
        graphic.poly(points);
        graphic.fill({
            color: this.hexToNumber(obj.fillColor),
            alpha: 0.7  // Slightly transparent to see rays through it
        });

        // Draw stroke (thicker for targets to make them stand out)
        graphic.poly(points);
        graphic.stroke({
            width: isSelected ? 4 : 3,
            color: this.hexToNumber(obj.edgeColor),
            alpha: 1
        });

        // Draw an 'X' in the center for visibility
        const size = obj.getSize();
        const halfSize = size / 2;
        const centerX = obj.position.x;
        const centerY = obj.position.y;
        const cos = Math.cos(obj.rotation);
        const sin = Math.sin(obj.rotation);

        // Diagonal lines forming an X
        const offset = halfSize * 0.44;
        const dx1 = offset * cos - offset * sin;
        const dy1 = offset * sin + offset * cos;
        const dx2 = -offset * cos - offset * sin;
        const dy2 = -offset * sin + offset * cos;

        graphic.moveTo(centerX + dx1, centerY + dy1);
        graphic.lineTo(centerX - dx1, centerY - dy1);
        graphic.moveTo(centerX + dx2, centerY + dy2);
        graphic.lineTo(centerX - dx2, centerY - dy2);
        graphic.stroke({
            width: 2,
            color: this.hexToNumber(obj.edgeColor),
            alpha: 0.8
        });

        // Draw selection highlight
        if (isSelected) {
            this.drawSelectionHighlight(graphic, vertices);
        }
    }

    /**
     * Draw selection highlight around object
     */
    drawSelectionHighlight(graphic, vertices) {
        // Draw selection handles as vertices
        vertices.forEach(v => {
            graphic.circle(v.x, v.y, 4);
            graphic.fill({
                color: 0x4a9eff,
                alpha: 1
            });
            graphic.circle(v.x, v.y, 3);
            graphic.fill({
                width: 2,
                color: 0xffffff,
                alpha: 1
            });

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