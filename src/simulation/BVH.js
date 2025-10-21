/**
 * file: src/simulation/BVH.js
 * desc: Bounding Volume Hierarchy builder and traversal
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 21 October 2025
 */

import BVHNode from './BVHNode.js';
import Intersection from './Intersection.js';
import GeometryMath from '@/utils/math/GeometryMath.js';

/**
 * BVH - Bounding Volume Hierarchy for fast ray-object intersection
 */
export default class BVH {
    constructor(objects, maxObjectsPerLeaf = 4) {
        this.maxObjectsPerLeaf = maxObjectsPerLeaf;
        this.root = null;

        if (objects.length > 0) {
            this.root = this.build(objects);
        }
    }

    /**
     * Build BVH tree from objects
     * @param {Array} objects - Array of geometric objects
     * @returns {BVHNode} Root node of the tree
     */
    build(objects) {
        const node = new BVHNode();

        // Compute bounding box for all objects
        const boundingBoxes = objects.map(obj => obj.getBoundingBox());
        node.boundingBox = BVHNode.computeBoundingBox(boundingBoxes);

        // Base case: few enough objects, make leaf node
        if (objects.length <= this.maxObjectsPerLeaf) {
            node.isLeaf = true;
            node.objects = objects;
            return node;
        }

        // Find best split using Surface Area Heuristic (SAH)
        const split = this.findBestSplit(objects, boundingBoxes);

        if (!split || split.leftObjects.length === 0 || split.rightObjects.length === 0) {
            // Cannot split effectively, make leaf
            node.isLeaf = true;
            node.objects = objects;
            return node;
        }

        // Recursively build left and right subtrees
        node.left = this.build(split.leftObjects);
        node.right = this.build(split.rightObjects);

        return node;
    }

    /**
     * Find best split using Surface Area Heuristic
     * @param {Array} objects - Objects to split
     * @param {Array} boundingBoxes - Corresponding bounding boxes
     * @returns {Object} {leftObjects, rightObjects, axis, position}
     */
    findBestSplit(objects, boundingBoxes) {
        let bestCost = Infinity;
        let bestSplit = null;

        // Try splitting on both axes
        for (const axis of ['x', 'y']) {
            // Sort objects by centroid along this axis
            const sorted = objects.map((obj, i) => ({
                object: obj,
                boundingBox: boundingBoxes[i],
                centroid: axis === 'x'
                    ? (boundingBoxes[i].minX + boundingBoxes[i].maxX) / 2
                    : (boundingBoxes[i].minY + boundingBoxes[i].maxY) / 2
            })).sort((a, b) => a.centroid - b.centroid);

            // Try different split positions
            const numSplits = Math.min(objects.length - 1, 10);
            for (let i = 1; i <= numSplits; i++) {
                const splitIndex = Math.floor(objects.length * i / (numSplits + 1));

                const leftObjects = sorted.slice(0, splitIndex).map(s => s.object);
                const rightObjects = sorted.slice(splitIndex).map(s => s.object);

                if (leftObjects.length === 0 || rightObjects.length === 0) continue;

                // Compute bounding boxes for both sides
                const leftBBs = sorted.slice(0, splitIndex).map(s => s.boundingBox);
                const rightBBs = sorted.slice(splitIndex).map(s => s.boundingBox);

                const leftBB = BVHNode.computeBoundingBox(leftBBs);
                const rightBB = BVHNode.computeBoundingBox(rightBBs);

                // Compute SAH cost
                const cost =
                    BVHNode.computeSurfaceArea(leftBB) * leftObjects.length +
                    BVHNode.computeSurfaceArea(rightBB) * rightObjects.length;

                if (cost < bestCost) {
                    bestCost = cost;
                    bestSplit = {
                        leftObjects,
                        rightObjects,
                        axis,
                        position: sorted[splitIndex].centroid
                    };
                }
            }
        }

        return bestSplit;
    }

    /**
     * Traverse BVH to find the closest ray intersection
     * @param {Ray} ray - The ray to test
     * @param {Object|null} currentMedium - Object ray is currently inside
     * @returns {Intersection} Closest intersection
     */
    traverse(ray, currentMedium = null) {
        if (!this.root) {
            return Intersection.noHit();
        }

        return this.traverseNode(this.root, ray, currentMedium);
    }

    /**
     * Recursively traverse a node
     * @param {BVHNode} node - Current node
     * @param {Ray} ray - The ray to test
     * @param {Object|null} currentMedium - Object ray is currently inside
     * @returns {Intersection} Closest intersection in this subtree
     */
    traverseNode(node, ray, currentMedium) {
        // Quick rejection: check if ray intersects node's AABB
        if (!node.intersectsAABB(ray)) {
            return Intersection.noHit();
        }

        // Leaf node: test against all objects
        if (node.isLeaf) {
            const intersections = [];

            for (const object of node.objects) {
                // Skip the object we're currently inside
                if (currentMedium && object.id === currentMedium.id) {
                    continue;
                }

                const intersection = GeometryMath.rayObjectIntersection(ray, object);
                if (intersection.hit) {
                    intersections.push(intersection);
                }
            }

            return Intersection.closest(intersections);
        }

        // Internal node: traverse children
        const leftIntersection = node.left ? this.traverseNode(node.left, ray, currentMedium) : Intersection.noHit();
        const rightIntersection = node.right ? this.traverseNode(node.right, ray, currentMedium) : Intersection.noHit();

        // Return closest of the two
        if (!leftIntersection.hit) return rightIntersection;
        if (!rightIntersection.hit) return leftIntersection;

        return leftIntersection.distance < rightIntersection.distance
            ? leftIntersection
            : rightIntersection;
    }

    /**
     * Get statistics about the BVH
     * @returns {Object} Statistics
     */
    getStats() {
        if (!this.root) {
            return { depth: 0, nodes: 0, leaves: 0, objects: 0 };
        }

        const stats = { depth: 0, nodes: 0, leaves: 0, objects: 0 };
        this.computeStats(this.root, 0, stats);
        return stats;
    }

    /**
     * Recursively compute statistics
     */
    computeStats(node, depth, stats) {
        stats.nodes++;
        stats.depth = Math.max(stats.depth, depth);

        if (node.isLeaf) {
            stats.leaves++;
            stats.objects += node.objects.length;
        } else {
            if (node.left) this.computeStats(node.left, depth + 1, stats);
            if (node.right) this.computeStats(node.right, depth + 1, stats);
        }
    }
}