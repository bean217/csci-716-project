/**
 * file: src/geometry/FocalPoint.js
 * desc: Defines a source object from which rays of light can be emitted from.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 19 October 2025
 */

import GeometricObject from './GeometricObject';

/**
 * FocalPoint - Light source/camera that emits rays
 * This is a special object that doesn't obstruct rays
 */
export default class FocalPoint extends GeometricObject {
    constructor({
        id = null,
        x = 400,
        y = 300,
        rayCount = 32,          // Number of rays to emit
        rayLength = 10000,      // Maximum ray length
        rotation = 0,
        edgeColor = '#ffff00',   // Yellow for visibility
        fillColor = '#ffff00',
        material = null,
        emitFromSurface = false,
    } = {}) {
        super({
            id,
            type: 'FocalPoint',
            x,
            y,
            rotation,
            edgeColor,
            fillColor,
            material
        });

        this.rayCount = this.validateRayCount(rayCount);
        this.rayLength = this.validateRayLength(rayLength);
        this.radius = 8;    // Visual radius for rendering
        this.emitFromSurface = emitFromSurface;
    }

    /**
     * Validate ray count (must be positive)
     */
    validateRayCount(value) {
        const count = Math.max(1, Math.min(360, Math.floor(value)));
        if (count !== value) {
            console.warn(`Ray count clamped from ${value} to ${count}`);
        }
        return count;
    }

    /**
     * Validate ray length (must be positive)
     */
    validateRayLength(value) {
        if (value <= 0) {
            console.warn('Ray length must be positive, setting to 1000');
            return 1000;
        }
        return value;
    }

    /**
     * Get ray count
     */
    getRayCount() {
        return this.rayCount;
    }

    /**
     * Set ray count
     */
    setRayCount(count) {
        this.rayCount = this.validateRayCount(count);
    }

    /**
     * Get ray length
     */
    getRayLength() {
        return this.rayLength;
    }

    /**
     * Set ray length
     */
    setRayLength(length) {
        this.rayLength = this.validateRayLength(length);
    }

    /**
     * Get visual radius
     */
    getRadius() {
        return this.radius;
    }

    /**
     * Set visual radius
     */
    setRadius(radius) {
        console.log("new radius", radius);
        this.radius = Math.max(1, radius);
    }

    /**
     * Get axis-aligned bounding box (AABB)
     */
    getBoundingBox() {
        return {
            minX: this.position.x - this.radius,
            minY: this.position.y - this.radius,
            maxX: this.position.x + this.radius,
            maxY: this.position.y + this.radius
        }
    }

    /**
     * Get vertices (circle approximation)
     */
    getVertices(numPoints = 16) {
        const vertices = [];
        const angleStep = (2 * Math.PI) / numPoints;

        for (let i = 0; i < numPoints; i++) {
            const angle = i * angleStep;
            vertices.push({
                x: this.position.x + this.radius * Math.cos(angle),
                y: this.position.y + this.radius * Math.sin(angle),
            });
        }
        return vertices;
    }

    /**
     * Check if point is inside focal point
     */
    containsPoint(x, y) {
        const dx = x - this.position.x;
        const dy = y - this.position.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
    }

    /**
     * Get emit from surface setting
     */
    getEmitFromSurface() {
        return this.emitFromSurface;
    }

    /**
     * Set emit from surface setting
     */
    setEmitFromSurface(value) {
        this.emitFromSurface = Boolean(value);
    }

    /**
     * Generate ray origins and directions
     * Returns array of {origin, direction} for rays emitted from the surface
     */
    getRayOriginsAndDirections() {
        const rays = [];
        const angleStep = (2 * Math.PI) / this.rayCount;

        for (let i = 0; i < this.rayCount; i++) {
            const angle = i * angleStep + this.rotation;
            const direction = {
                x: Math.cos(angle),
                y: Math.sin(angle)
            };

            // Ray origin is on the surface of the focal point
            const origin = {
                x: this.position.x + this.radius * direction.x,
                y: this.position.y + this.radius * direction.y
            };

            rays.push({ origin, direction });
        }

        return rays;
    }

    /**
     * Generate ray directions
     * Returns array of unit vectors representing ray directions
     */
    getRayDirections() {
        const directions = [];
        const angleStep = (2 * Math.PI) / this.rayCount;

        for (let i = 0; i < this.rayCount; i++) {
            const angle = i * angleStep + this.rotation;
            directions.push({
                x: Math.cos(angle),
                y: Math.sin(angle)
            });
        }

        return directions;
    }

    /**
     * Serialize to plain object
     */
    toJSON() {
        return {
            ...super.toJSON(),
            rayCount: this.rayCount,
            rayLength: this.rayLength,
            radius: this.radius
        }
    }

    /**
     * Update properties from plain object
     */
    updateFromJSON(json) {
        super.updateFromJSON(json);
        if (json.rayCount !== undefined) this.rayCount = this.validateRayCount(json.rayCount);
        if (json.rayLength!== undefined) this.rayLength = this.validateRayLength(json.rayLength);
        if (json.radius !== undefined) this.radius = Math.max(1, json.radius);
    }

    /**
     * Create FocalPoint from JSON
     */
    static fromJSON(json) {
        const focalPoint = new FocalPoint(json);
        focalPoint.updateFromJSON(json);
        return focalPoint;
    }
}