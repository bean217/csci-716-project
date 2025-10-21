/**
 * file: src/simulation/CollisionDetection.js
 * desc: Utility functions for detecting collisions between geometric objects
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 21 October 2025
 */

/**
 * CollisionDetection - Static utility class for collision detection
 */
export default class CollisionDetection {
    /**
     * Check if two objects' bounding boxes overlap
     * @param {Object} obj1 - First object
     * @param {Object} obj2 - Second object
     * @returns {boolean} True if bounding boxes overlap
     */
    static boundingBoxesOverlap(obj1, obj2) {
        const bb1 = obj1.getBoundingBox();
        const bb2 = obj2.getBoundingBox();

        return !(
            bb1.maxX < bb2.minX ||
            bb1.minX > bb2.maxX ||
            bb1.maxY < bb2.minY ||
            bb1.minY > bb2.maxY
        );
    }

    /**
     * Check if two polygons overlap using Separating Axis Theorem (SAT)
     * @param {Array} vertices1 - Vertices of first polygon [{x, y}, ...]
     * @param {Array} vertices2 - Vertices of second polygon [{x, y}, ...]
     * @returns {boolean} True if polygons overlap
     */
    static polygonsOverlap(vertices1, vertices2) {
        // Get all axes to test (perpendiculars to edges)
        const axes = [];

        // Add axes from first polygon
        for (let i = 0; i < vertices1.length; i++) {
            const p1 = vertices1[i];
            const p2 = vertices1[(i + 1) % vertices1.length];
            const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
            const normal = { x: -edge.y, y: edge.x };
            axes.push(normal);
        }

        // Add axes from second polygon
        for (let i = 0; i < vertices2.length; i++) {
            const p1 = vertices2[i];
            const p2 = vertices2[(i + 1) % vertices2.length];
            const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
            const normal = { x: -edge.y, y: edge.x };
            axes.push(normal);
        }

        // Test each axis
        for (const axis of axes) {
            // Project both polygons onto the axis
            const proj1 = this.projectPolygon(vertices1, axis);
            const proj2 = this.projectPolygon(vertices2, axis);

            // Check for gap
            if (proj1.max < proj2.min || proj2.max < proj1.min) {
                // Found separating axis - no overlap
                return false;
            }
        }

        // No separating axis found - polygons overlap
        return true;
    }

    /**
     * Project a polygon onto an axis
     * @param {Array} vertices - Polygon vertices
     * @param {Object} axis - Axis vector {x, y}
     * @returns {Object} {min, max} projection range
     */
    static projectPolygon(vertices, axis) {
        // Normalize axis
        const length = Math.sqrt(axis.x * axis.x + axis.y * axis.y);
        const normalizedAxis = {
            x: axis.x / length,
            y: axis.y / length
        };

        let min = Infinity;
        let max = -Infinity;

        for (const vertex of vertices) {
            const projection = vertex.x * normalizedAxis.x + vertex.y * normalizedAxis.y;
            min = Math.min(min, projection);
            max = Math.max(max, projection);
        }

        return { min, max };
    }

    /**
     * Check if two objects collide
     * @param {Object} obj1 - First object
     * @param {Object} obj2 - Second object
     * @returns {boolean} True if objects collide
     */
    static objectsCollide(obj1, obj2) {
        // Quick bounding box check first
        if (!this.boundingBoxesOverlap(obj1, obj2)) {
            return false;
        }

        // Precise polygon collision check
        const vertices1 = obj1.getVertices();
        const vertices2 = obj2.getVertices();

        return this.polygonsOverlap(vertices1, vertices2);
    }

    /**
     * Check if an object at a given position would collide with any existing objects
     * @param {Object} object - The object to check
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Array} existingObjects - Array of existing objects to check against
     * @returns {boolean} True if collision would occur
     */
    static wouldCollideAtPosition(object, x, y, existingObjects) {
        // Save original position
        const originalX = object.position.x;
        const originalY = object.position.y;

        // Temporarily move object to new position
        object.setPosition(x, y);

        // Check for collisions
        let hasCollision = false;
        for (const other of existingObjects) {
            if (other.id !== object.id && this.objectsCollide(object, other)) {
                hasCollision = true;
                break;
            }
        }

        // Restore original position
        object.setPosition(originalX, originalY);

        return hasCollision;
    }

    /**
     * Check if an object collides with any objects in a list
     * @param {Object} object - The object to check
     * @param {Array} objects - Array of objects to check against
     * @param {boolean} excludeSelf - Whether to exclude the object itself
     * @returns {Object|null} The first colliding object, or null if none
     */
    static findCollidingObject(object, objects, excludeSelf = true) {
        for (const other of objects) {
            if (excludeSelf && other.id === object.id) {
                continue;
            }

            if (this.objectsCollide(object, other)) {
                return other;
            }
        }

        return null;
    }

    /**
     * Get all objects that collide with a given object
     * @param {Object} object - The object to check
     * @param {Array} objects - Array of objects to check against
     * @param {boolean} excludeSelf - Whether to exclude the object itself
     * @returns {Array} Array of colliding objects
     */
    static getAllCollidingObjects(object, objects, excludeSelf = true) {
        const collisions = [];

        for (const other of objects) {
            if (excludeSelf && other.id === object.id) {
                continue;
            }

            if (this.objectsCollide(object, other)) {
                collisions.push(other);
            }
        }

        return collisions;
    }
}