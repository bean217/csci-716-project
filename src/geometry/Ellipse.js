/**
 * file: src/geometry/Ellipse.js
 * desc: Implements an elliptical object.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 17 October 2025
 */

import GeometricObject from "./GeometricObject.js";

/**
 * Ellipse shape
 */
export default class Ellipse extends GeometricObject {
    constructor({
        id = null,
        x = 0,
        y = 0,
        rx = 60,    // x-axis radius
        ry = 40,    // y-axis radius
        rotation = 0,
        edgeColor = '#ffffff',
        fillColor = '#666666',
        material = null
    } = {}) {
        super({
            id,
            type: 'Ellipse',
            x,
            y,
            rotation,
            edgeColor,
            fillColor,
            material
        });

        this.rx = this.validateRadius(rx, 'rx');
        this.ry = this.validateRadius(ry, 'ry');
    }

    /**
     * Validate radius (must be positive)
     */
    validateRadius(value, name) {
        if (value <= 0) {
            console.warn(`${name} must be positive, setting to 1`);
            return 1
        }
        return value;
    }

    /**
     * Get x-axis radius
     */
    getRx() {
        return this.rx;
    }

    /**
     * Set x-axis radius
     */
    setRx(value) {
        this.rx = this.validateRadius(value, 'rx');
    }

    /**
     * Get y-axis radius
     */
    getRy() {
        return this.ry;
    }

    /**
     * Set y-axis radius
     */
    setRy(value) {
        this.ry = this.validateRadius(value, 'ry');
    }

    /**
     * Get axis-aligned bounding box (AABB)
     */

    getBoundingBox() {
        if (this.rotation === 0) {
            return {
                minX: this.position.x - this.rx,
                minY: this.position.y - this.ry,
                maxX: this.position.x + this.rx,
                maxY: this.position.y + this.ry,
            }
        }

        // For rotated ellipses, compute AABB from vertices
        const vertices = this.getVertices();
        const xs = vertices.map(v => v.x);
        const ys = vertices.map(v => v.y);

        return {
            minX: Math.min(...xs),
            minY: Math.min(...ys),
            maxX: Math.max(...xs),
            maxY: Math.max(...ys)
        }
    }

    /**
     * Get vertices of ellipse (approximated as polygon)
     * Returns points around the ellipse perimeter
     */
    getVertices(numPoints = 32) {
        const vertices = [];
        const angleStep = (2 * Math.PI) / numPoints;
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        const px = this.position.x;
        const py = this.position.y;

        for (let i = 0; i < numPoints; i++) {
            const angle = i * angleStep
            // Local coordinates on ellipse
            const localX = this.rx * Math.cos(angle);
            const localY = this.ry * Math.sin(angle);

            // Transform to world coordinates with rotation
            vertices.push({
                x: px + localX * cos - localY * sin,
                y: py + localX * sin + localY * cos
            });
        }

        return vertices;
    }

    /**
     * Check if point is inside ellipse
     * Uses ellipse equation (x/rx)^2 + (y/ry)^2 <= 1>
     */
    containsPoint(x, y) {
        // Transform point to local coordinates
        const dx = x - this.position.x;
        const dy = y - this.position.y;
        const cos = Math.cos(-this.rotation);
        const sin = Math.sin(-this.rotation);

        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        // Check ellipse equation
        const normalized =
            (localX * localY) / (this.rx * this.rx) +
            (localY * localY) / (this.ry * this.ry);

        return normalized <= 1;
    }

    /**
     * Serialize to plain object
     */
    toJSON() {
        return {
            ...super.toJSON(),
            rx: this.rx,
            ry: this.ry
        }
    }

    /**
     * Update properties from plain object
     */
    updateFromJSON(json) {
        super.updateFromJSON(json);
        if (json.rx !== undefined) this.rx = this.validateRadius(json.rx, 'rx');
        if (json.ry !== undefined) this.ry = this.validateRadius(json.ry, 'ry');
    }

    /**
     * Create Ellipse from JSON
     */
    static fromJSON(json) {
        const ellipse = new Ellipse(json);
        ellipse.updateFromJSON(json);
        return ellipse;
    }
}