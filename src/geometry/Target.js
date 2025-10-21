/**
 * file: src/geometry/Target.js
 * desc: Defines a target object marking a path.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 20 October 2025
 */

import GeometricObject from "./GeometricObject.js";

/**
 * Target - A diamond/rhombus shape that marks ray paths when hit
 */
export default class Target extends GeometricObject {
    constructor({
        id = null,
        x = 0,
        y = 0,
        size = 20,  // Size of the diamond
        rotation = 0,
        edgeColor = '#ff0000',
        fillColor = '#aa0000',
        material = null
    }) {
        super({
            id,
            type: 'Target',
            x,
            y,
            rotation,
            edgeColor,
            fillColor,
            material
        });
        this.size = this.validateSize(size);
    }

    /**
     * Validate size (must be positive)
     */
    validateSize(value) {
        if (value <= 0) {
            console.warn('Size must be positive, setting to 1');
            return 1;
        }
        return value;
    }

    /**
     * Get size
     */
    getSize() {
        return this.size;
    }

    /**
     * Set size
     */
    setSize(size) {
        this.size = this.validateSize(size);
    }

    /**
     * Get axis-aligned bounding box
     */
    getBoundingBox() {
        const vertices = this.getVertices();
        const xs = vertices.map(v => v.x);
        const ys = vertices.map(v => v.y);

        return {
            minX: Math.min(...xs),
            minY: Math.min(...ys),
            maxX: Math.max(...xs),
            maxY: Math.max(...ys)
        };
    }

    /**
     * Get vertices of diamond (rhombus)
     * Returns 4 points in diamond shape
     */
    getVertices() {
        const halfSize = this.size / 2;
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        const px = this.position.x;
        const py = this.position.y;

        // Local coordinates (diamond shape)
        const localVertices = [
            { x: 0, y: -halfSize },     // top
            { x: halfSize, y: 0 },      // right
            { x: 0, y: halfSize },      // bottom
            { x: -halfSize, y: 0 }      // left
        ];

        // Transform to world coordinates with rotation
        return localVertices.map(v => ({
            x: px + v.x * cos - v.y * sin,
            y: py + v.x * sin + v.y * cos
        }));
    }

    /**
     * Check if point is inside diamond
     */
    containsPoint(x, y) {
        // Transform point to local coordinates
        const dx = x - this.position.x;
        const dy = y - this.position.y;
        const cos = Math.cos(-this.rotation);
        const sin = Math.sin(-this.rotation);

        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        const halfSize = this.size / 2;


        // Diamond is defined by: |x| + |y| <= halfSize
        return Math.abs(localX) + Math.abs(localY) <= halfSize;
    }

    /**
     * Serialize to plain object
     */
    toJSON() {
        return {
            ...super.toJSON(),
            size: this.size
        };
    }

    /**
     * Update properties from plain object
     */
    updateFromJSON(json) {
        super.updateFromJSON(json);
        if (json.size !== undefined) {
            this.size = this.validateSize(json.size);
        }
    }

    /**
     * Create Target from JSON
     */
    static fromJSON(json) {
        const target = new Target(json);
        target.updateFromJSON(json)
        return target;
    }
}