/**
 * file: src/geometry/Rectangle.js
 * desc: Implements a rectangle object.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 17 October 2025
 */

import GeometricObject from "./GeometricObject.js";

/**
 * Rectangle shape
 */
export default class Rectangle extends GeometricObject {
    constructor({
        id = null,
        x = 0,
        y = 0,
        width = 100,
        height = 60,
        rotation = 0,
        edgeColor = '#ffffff',
        fillColor = '#666666',
        material = null
    }) {
        super({
            id,
            type: 'Rectangle',
            x,
            y,
            rotation,
            edgeColor,
            fillColor,
            material
        });
        this.width = this.validateDimension(width, 'width');
        this.height = this.validateDimension(height, 'height');
    }

    // Validate dimension (must be positive)
    validateDimension(value, name) {
        if (value <= 0) {
            console.warn(`${name} must be positive, setting to 1`)
            return 1;
        }
        return value;
    }

    // Width getter
    getWidth() {
        return this.width;
    }

    // Width setter
    setWidth(width) {
        this.width = this.validateDimension(width, 'width');
    }

    // Height getter
    getHeight() {
        return this.height;
    }

    // Height setter
    setHeight(height) {
        this.height = this.validateDimension(height, 'height');
    }

    /**
     * Get axis-aligned bounding box (without rotation)
     */
    getBoundingBox() {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        if (this.rotation === 0) {
            return {
                minX: this.position.x - halfWidth,
                minY: this.position.y - halfHeight,
                maxX: this.position.x + halfWidth,
                maxY: this.position.y + halfHeight,
            }
        }

        // For rotated rectangles, compute AABB from vertices
        const vertices = this.getVertices();
        const xs = vertices.map(v => v.x);
        const ys = vertices.map(v => v.y);

        return {
            minX: Math.min(...xs),
            minY: Math.min(...ys),
            maxX: Math.max(...xs),
            maxY: Math.max(...ys),
        }
    }

    /**
     * Get vertices of rectangle (for rendering and collision)
     * Returns in clockwise order staring from top-left
     */
    getVertices() {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        const px = this.position.x;
        const py = this.position.y;

        // Local coordinates (centered at origin)
        const localVertices = [
            { x: -halfWidth, y: -halfHeight },  // top-left
            { x: halfWidth, y: -halfHeight },   // top-right
            { x: halfWidth, y: halfHeight },    // bottom-right
            { x: -halfWidth, y: halfHeight }    // bottom-left
        ];

        // Transform to world coordinates with rotation
        return localVertices.map(v => ({
            x: px + v.x * cos - v.y * sin,
            y: py + v.x * sin + v.y * cos
        }));
    }

    /**
     * Check if a point is inside rectangle
     */
    // TODO: rewrite this method using orientation tests
    containsPoint(x, y) {
        // Transform point to local coordinates
        const dx = x - this.position.x;
        const dy = y - this.position.y;
        const cos = Math.cos(-this.rotation)
        const sin = Math.sin(-this.rotation);

        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        return Math.abs(localX) <= halfWidth && Math.abs(localY) <= halfHeight;
    }

    /**
     * Serialize to plain JS object
     */
    toJSON() {
        return {
            ...super.toJSON(),
            width: this.width,
            height: this.height
        }
    }

    /**
     * Update properties from plain JSON object
     */
    updateFromJSON(json) {
        super.updateFromJSON(json);
        if (json.width !== undefined) this.width = this.validateDimension(json.width, 'width');
        if (json.height !== undefined) this.height = this.validateDimension(json.height, 'height');
    }

    /**
     * Create Rectangle from JSON
     */
    static fromJSON(json) {
        const rect = new Rectangle(json);
        rect.updateFromJSON(json);
        return rect;
    }
}