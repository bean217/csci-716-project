/**
 * file: src/geometry/GeometricObject.js
 * desc: Abstract base class that defines an object placed in a scene.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 17 October 2025
 */

import Material from '@/models/Material.js';
import IdGenerator from '@/utils/IdGenerator.js';

/**
 * Abstract base class for all geometric objects in the scene
 */
export default class GeometricObject {
    constructor({
        id = null,
        type = 'GeometricObject',
        x = 0,
        y = 0,
        rotation = 0,
        edgeColor = '#ffffff',
        fillColor = '#666666',
        material = null
    } = {}) {
        this.id = id || IdGenerator(type.toLowerCase());
        this.type = type;
        this.position = { x: x, y: y };
        this.rotation = rotation;   // in radians
        this.edgeColor = edgeColor;
        this.fillColor = fillColor;
        this.material = material || new Material();
    }

    // Position getter
    getPosition() {
        return { ...this.position };
    }

    // Position setter
    setPosition(x, y) {
        this.position = { x: x, y: y };
    }

    // Rotation getter (radians)
    getRotation() {
        return this.rotation;
    }

    // Rotation setter (radians)
    setRotation(radians) {
        this.rotation = radians;
    }

    // Rotation getter (degrees)
    getRotationDegrees() {
        return this.rotation * (180 / Math.PI);
    }

    // Rotation setter (degrees)
    setRotationDegrees(degrees) {
        this.rotation = degrees * (Math.PI / 180);
    }

    // Edge color getter
    getEdgeColor() {
        return this.edgeColor;
    }

    // Edge color setter
    setEdgeColor(color) {
        this.edgeColor = color;
    }

    // Fill color getter
    getFillColor() {
        return this.edgeColor;
    }

    // Fill color setter
    setFillColor(color) {
        this.edgeColor = color;
    }

    // Material getter
    getMaterial() {
        return this.material;
    }

    // Material setter
    setMaterial(material) {
        this.material = material;
    }

    // Serialize to JSON
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            position: { ...this.position },
            rotation: this.rotation,
            edgeColor: this.edgeColor,
            fillColor: this.fillColor,
            material: this.material.toJSON()
        }
    }

    // Update from JSON
    updateFromJSON(json) {
        if (json.position) this.position = { ...json.position };
        if (json.rotation) this.rotation = json.rotation;
        if (json.edgeColor) this.edgeColor = json.edgeColor;
        if (json.fillColor) this.fillColor = json.fillColor;
        if (json.material) this.material = Material.fromJSON(json.material);
    }

    /** Abstract methods */

    /**
     * Get axis-aligned bounding box (AABB)
     * Must be implemented by subclasses
     * @returns {Object} { minX, minY, maxX, maxY }
     */
    getBoundingBox() {
        throw new Error('getBoundingBox() must be implemented by subclass');
    }

    /**
     * Check if a point is inside this object
     * Must be implemented by subclass
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean}
     */
    containsPoint(x, y) {
        throw new Error('containsPoint() must be implemented by subclass');
    }

    /**
     * Get vertices of the shape (for rendering and intersection testing)
     * Must be implemented by subclasses
     * @returns {Array<{x: number, y: number}>}
     */
    getVertices() {
        throw new Error('getVertices() must be implemented by subclass');
    }
}