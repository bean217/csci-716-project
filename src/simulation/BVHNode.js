/**
 * file: src/simulation/BVHNode.js
 * desc: Bounding Volume Hierarchy node for spatial acceleration
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 21 October 2025
 */

/**
 * BVHNode - A node in the bounding volume hierarchy tree
 */
export default class BVHNode {
    constructor() {
        this.boundingBox = null;  // AABB for this node
        this.objects = [];        // Objects in this node (leaf only)
        this.left = null;         // Left child node
        this.right = null;        // Right child node
        this.isLeaf = false;      // Whether this is a leaf node
    }

    /**
     * Check if a ray intersects with this node's bounding box
     * @param {Ray} ray - The ray to test
     * @returns {boolean} True if ray intersects AABB
     */
    intersectsAABB(ray) {
        if (!this.boundingBox) return false;

        const { minX, minY, maxX, maxY } = this.boundingBox;

        // Ray-AABB intersection using slab method
        let tmin = -Infinity;
        let tmax = Infinity;

        // X-axis slab
        if (ray.direction.x !== 0) {
            const tx1 = (minX - ray.origin.x) / ray.direction.x;
            const tx2 = (maxX - ray.origin.x) / ray.direction.x;
            tmin = Math.max(tmin, Math.min(tx1, tx2));
            tmax = Math.min(tmax, Math.max(tx1, tx2));
        } else {
            // Ray parallel to X-axis
            if (ray.origin.x < minX || ray.origin.x > maxX) {
                return false;
            }
        }

        // Y-axis slab
        if (ray.direction.y !== 0) {
            const ty1 = (minY - ray.origin.y) / ray.direction.y;
            const ty2 = (maxY - ray.origin.y) / ray.direction.y;
            tmin = Math.max(tmin, Math.min(ty1, ty2));
            tmax = Math.min(tmax, Math.max(ty1, ty2));
        } else {
            // Ray parallel to Y-axis
            if (ray.origin.y < minY || ray.origin.y > maxY) {
                return false;
            }
        }

        // Check if there's a valid intersection
        return tmax >= tmin && tmax >= 0;
    }

    /**
     * Compute bounding box that encompasses all given bounding boxes
     * @param {Array} boundingBoxes - Array of bounding boxes
     * @returns {Object} Combined AABB
     */
    static computeBoundingBox(boundingBoxes) {
        if (boundingBoxes.length === 0) return null;

        return {
            minX: Math.min(...boundingBoxes.map(bb => bb.minX)),
            minY: Math.min(...boundingBoxes.map(bb => bb.minY)),
            maxX: Math.max(...boundingBoxes.map(bb => bb.maxX)),
            maxY: Math.max(...boundingBoxes.map(bb => bb.maxY))
        };
    }

    /**
     * Compute surface area of a bounding box
     * @param {Object} boundingBox - The AABB
     * @returns {number} Surface area
     */
    static computeSurfaceArea(boundingBox) {
        const width = boundingBox.maxX - boundingBox.minX;
        const height = boundingBox.maxY - boundingBox.minY;
        return width * height;
    }
}