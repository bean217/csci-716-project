/**
 * file: src/geometry/Triangle.js
 * desc: Implements a triangle object.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 19 October 2025
 */

import GeometricObject from './GeometricObject.js';

/**
 * Triangle shape defined by three side lengths
 */
export default class Triangle extends GeometricObject {
    constructor({
        id = null,
        x = 0,
        y = 0,
        side1 = 60, // bottom side
        side2 = 60, // left side
        side3 = 60, // right side
        rotation = 0,
        edgeColor = '#ffffff',
        fillColor = '#666666',
        material = null
    } = {}) {
        super({
            id,
            type: 'Triangle',
            x,
            y,
            rotation,
            edgeColor,
            fillColor,
            material
        });

        this.side1 = this.validateSide(side1, 'side1');
        this.side2 = this.validateSide(side2, 'side2');
        this.side3 = this.validateSide(side3, 'side3');

        // Validate triangle inequality
        if (!this.isValidTriangle()) {
            console.warn('Invalid triangle sides, adjusting to equilateral');
            const avg = (side1 + side2 + side3) / 3;
            this.side1 = this.side2 = this.side3 = avg;
        }
    }

    /**
     * Validate side length (must be positive)
     */
    validateSide(value, name) {
        if (value <= 0) {
            console.warn(`${name} must be positive, setting to 1`);
        }
        return value;
    }

    /**
     * Check if triangle inequality holds
     * Sum of any two sides must be greater than third side
     */
    isValidTriangle() {
        return (this.side1 + this.side2 > this.side3) &&
               (this.side1 + this.side3 > this.side2) &&
               (this.side2 + this.side3 > this.side1);
    }

    /**
     * Get side 1
     */
    getSide1() {
        return this.side1;
    }

    /**
     * Set side 1
     */
    setSide1(side1) {
        this.side1 = this.validateSide(side1, 'side1');
        if (!this.isValidTriangle()) {
            console.warn('Invalid triangle after setting side1');
        }
    }

    /**
     * Get side 2
     */
    getSide2() {
        return this.side2;
    }

    /**
     * Set side 2
     */
    setSide2(side2) {
        this.side2 = this.validateSide(side2, 'side2');
        if (!this.isValidTriangle()) {
            console.warn('Invalid triangle after setting side2');
        }
    }

    /**
     * Get side 3
     */
    getSide3() {
        return this.side3;
    }

    /**
     * Set side 3
     */
    setSide3(side3) {
        this.side3 = this.validateSide(side3, 'side3');
        if (!this.isValidTriangle()) {
            console.warn('Invalid triangle after setting side3');
        }
    }

    /** Calculate local vertex positions using cosine law
     * Triangle is centered at origin, with side1 as base
     */
    calculateLocalVertices() {
        // Place triangle with side1 as base, centered at origin
        const halfBase = this.side1 / 2;

        // Vertex A: left point of base
        const vA = { x: -halfBase, y: 0 };

        // Vertex B: right point of base
        const vB = { x: halfBase, y: 0 };

        // Vertex C: top point
        // Use cosine law to find position
        // cos(A) = (b^2 + c^2 - a^2) / (2bc)
        const cosA = (this.side2 * this.side2 + this.side1 * this.side1 - this.side3 * this.side3) /
            (2 * this.side2 * this.side1);
        const sinA = Math.sqrt(1 - cosA * cosA);

        const vC = {
            x: -halfBase + this.side2 * cosA,
            y: -this.side2 * sinA
        };

        // Center the triangle vertically
        const centerY = (vA.y + vB.y + vC.y) / 3;
        vA.y -= centerY;
        vB.y -= centerY;
        vC.y -= centerY;

        return [vA, vB, vC];
    }

    /**
     * Get Bounding Box
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
     * Get vertices of triangle (for rendering and collision)
     */
    getVertices() {
        const localVertices = this.calculateLocalVertices();
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        const px = this.position.x;
        const py = this.position.y;

        // Transform the world coordinates with rotation
        return localVertices.map(v => ({
            x: px + v.x * cos - v.y * sin,
            y: py + v.x * sin + v.y * cos
        }));
    }

    /**
     * Check if point is inside triangle using barycentric coordinates
     */
    containsPoint(x, y) {
        const vertices = this.getVertices();
        const v0 = vertices[0];
        const v1 = vertices[1];
        const v2 = vertices[2];

        // Calculate barycentric coordinates
        const denom = (v1.y - v2.y) * (v0.x - v2.x) + (v2.x - v1.x) *  (v0.y - v2.y);
        const a = ((v1.y - v2.y) * (x - v2.x) + (v2.x - v1.x) * (y - v2.y)) / denom;
        const b = ((v2.y - v0.y) * (x - v2.x) + (v0.x - v2.x) * (y - v2.y)) / denom;
        const c = 1 - a - b;

        // Point is inside if all barycentric coordinates are non-negative
        return a >= 0 && b >= 0 && c >= 0;
    }

    /**
     * Serialize to plain object
     */
    toJSON() {
        return {
            ...super.toJSON(),
            side1: this.side1,
            side2: this.side2,
            side3: this.side3
        }
    }

    /**
     * Update properties from plain object
     */
    updateFromJSON(json) {
        super.updateFromJSON(json);
        if (json.side1 !== undefined) this.side1 = this.validateSide(json.side1);
        if (json.side2 !== undefined) this.side2 = this.validateSide(json.side2);
        if (json.side3 !== undefined) this.side3 = this.validateSide(json.side3);
    }

    /**
     * Create Triangle from JSON
     */
    static fromJSON(json) {
        const triangle = new Triangle(json);
        triangle.updateFromJSON(triangle);
        return triangle;
    }
}