/**
 * file: src/simulation/Ray.js
 * desc: Defines the main ray tracing engine.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 20 October 2025
 */

import Ray from './Ray.js';
import Intersection from './Intersection.js';
import LightCalculator from "./LightCalculator.js";
import GeometryMath from '@/utils/math/GeometryMath.js';
import BVH from './BVH.js';

/**
 * RayTracer - Main ray-tracing engine
 */
export default class RayTracer {
    constructor(sceneStore, settings = {}) {
        this.sceneStore = sceneStore;
        this.settings = {
            maxBounces: settings.maxBounces || 5,
            minIntensity: settings.minIntensity || 0.01,
            airRefractiveIndex: 1.0,
            canvasWidth: settings.canvasWidth || 800,
            canvasHeight: settings.canvasHeight || 600,
            useBVH: settings.useBVH || true,   // Enable BVH by default
            ...settings
        };

        // BVH structure (rebuilt when scene changes)
        this.bvh = null;
        this.bvhDirty = true;
    }

    /**
     * Rebuild BVH if scene has changed
     */
    rebuildBVH() {
        if (!this.settings.useBVH) {
            this.bvh = null;
        }

        // TODO: Remove performance-related logic later
        const startTime = performance.now();

        // Build BVH from all objects
        this.bvh = new BVH(this.sceneStore.objects, 4);     // Max 4 objects per leaf

        const endTime = performance.now();
        const stats = this.bvh.getStats();

        console.log(`BVH built in ${(endTime - startTime).toFixed(2)}ms`);
        console.log(`  Nodes: ${stats.nodes}, Leaves: ${stats.leaves}, Depth: ${stats.depth}`);
        console.log(`  Objects: ${stats.objects}, Avg per leaf: ${(stats.objects / stats.leaves).toFixed(1)}`);

        this.bvhDirty = false;
    }

    /**
     * Mark BVH as needing rebuild
     */
    invalidateBVH() {
        this.bvhDirty = true;
    }

    /**
     * Trace all rays from all focal points
     * @returns {Array} Array of ray paths for rendering
     */
    traceAll() {
        // Rebuild BVH if needed
        if (this.bvhDirty || !this.bvh) {
            this.rebuildBVH();
        }

        const allSegments = []

        // Trace rays from each focal point
        this.sceneStore.focalPoints.forEach(focalPoint => {
            const segments = this.traceFocalPoint(focalPoint);
            allSegments.push(...segments);
        });

        console.log(`Traced ${allSegments.length} primary ray segments`);

        return allSegments;
    }

    /**
     * Trace rays from a single focal point
     * @param {FocalPoint} focalPoint - The focal point to emit rays from
     * @returns {Array} Array of ray paths
     */
    traceFocalPoint(focalPoint) {
        const allSegments = [];

        if (focalPoint.getEmitFromSurface()) {
            const rayData = focalPoint.getRayOriginsAndDirections();

            rayData.forEach(({ origin, direction }) => {
                // Determine starting medium for this ray based on its surface origin
                const startingMedium = this.findContainingObject(origin);

                const ray = new Ray(origin, direction, 1.0, 0);
                const segments = this.traceRay(ray, focalPoint.rayLength, startingMedium);

                // Add all segments from this ray
                allSegments.push(...segments);
            });
        } else {
            const directions = focalPoint.getRayDirections();

            // Determine if focal point is inside any object
            const startingMedium = this.findContainingObject(focalPoint.position);

            directions.forEach(direction => {
                const ray = new Ray(focalPoint.position, direction, 1.0, 0);
                const segments = this.traceRay(ray, focalPoint.rayLength, startingMedium);

                // Add all segments from this ray
                allSegments.push(...segments);
            });
        }

        return allSegments;
    }

    /**
     * Trace a single ray through the scene
     * @param {Ray} ray - The ray to trace
     * @param {number} maxDistance - Maximum distance to trace
     * @param {Object|null} currentMedium - The object the ray is currently inside (null = air)
     * @returns {Array} Array of points representing the ray path
     */
    traceRay(ray, maxDistance, currentMedium = null) {
        const segments = [];

        // Queue of rays to process: {ray, medium, distance, startPoint, segments}
        const rayQueue = [{
            ray: ray,
            medium: currentMedium,
            distance: maxDistance,
            startPoint: { ...ray.origin },
            segments: segments,  // Reference to where we should add child segments
            parent: null         // Reference to parent segment for target path marking
        }];

        while (rayQueue.length > 0) {
            const {
                ray: currentRay,
                medium: insideObject,
                distance: remainingDistance,
                startPoint,
                segments: parentSegments,
                parent: parentSegment
            } = rayQueue.shift();

            // Stop if intensity too low
            if (currentRay.intensity < this.settings.minIntensity) {
                continue;
            }

            // Check all three types of intersections
            const targetHit = this.checkTargetIntersection(currentRay, remainingDistance);
            const intersection = this.findClosestIntersection(currentRay, insideObject);
            const canvasBoundaryDist = this.getCanvasBoundaryDistance(currentRay);

            // Determine what we hit first by comparing all distances
            const candidates = [];

            if (targetHit) {
                candidates.push({
                    type: 'target',
                    distance: targetHit.distance,
                    data: targetHit
                });
            }

            if (intersection.hit) {
                candidates.push({
                    type: 'object',
                    distance: intersection.distance,
                    data: intersection
                });
            }

            if (canvasBoundaryDist !== null && canvasBoundaryDist <= remainingDistance) {
                candidates.push({
                    type: 'canvas',
                    distance: canvasBoundaryDist,
                    data: canvasBoundaryDist
                });
            }

            // No hits at all
            if (candidates.length === 0) {
                const endPoint = this.getCanvasBoundaryIntersection(currentRay, Infinity);
                parentSegments.push({
                    start: startPoint,
                    end: endPoint,
                    intensity: currentRay.intensity,
                    hitsTarget: false,
                    parent: parentSegment,
                    children: []
                });
                continue;
            }

            // Find the closest hit
            candidates.sort((a, b) => a.distance - b.distance);
            const closestHit = candidates[0];

            // Handle based on what was hit first
            if (closestHit.type === 'target') {
                // Ray hits a target, create segment and mark it
                const segment = {
                    start: startPoint,
                    end: targetHit.point,
                    intensity: currentRay.intensity,
                    hitsTarget: true,
                    parent: parentSegment,
                    children: []
                };
                parentSegments.push(segment);
                this.markPathToTarget(parentSegment);
                continue;
            }

            if (closestHit.type === 'canvas') {
                // Hit canvas boundary first
                const endPoint = currentRay.pointAt(canvasBoundaryDist);
                parentSegments.push({
                    start: startPoint,
                    end: endPoint,
                    intensity: currentRay.intensity,
                    hitsTarget: false,
                    parent: parentSegment,
                    children: []
                });
                continue;
            }

            if (closestHit.type === 'object') {
                // Hit an object
                // create segment to intersection point
                const segment = {
                    start: startPoint,
                    end: { ...intersection.point },
                    intensity: currentRay.intensity,
                    hitsTarget: false,
                    parent: parentSegment,
                    children: []
                }
                parentSegments.push(segment);

                // Check if we have distance remaining for bounces
                if (intersection.distance >= remainingDistance) {
                    // Exceeded max distance - don't spawn children
                    continue;
                }

                const newRemainingDistance = remainingDistance - intersection.distance;

                if (newRemainingDistance <= 0 || currentRay.generation >= this.settings.maxBounces) {
                    // Out of distance or bounces - don't spawn children
                    continue;
                }

                // Calculate next rays (both reflection and refraction)
                const nextRays = this.calculateNextRays(
                    currentRay,
                    intersection,
                    insideObject
                );

                // Add all resulting rays to the queue as children of this segment
                nextRays.forEach(result => {
                    rayQueue.push({
                        ray: result.ray,
                        medium: result.medium,
                        distance: newRemainingDistance,
                        startPoint: { ...intersection.point },
                        segments: segment.children,
                        parent: segment
                    });
                });
            }
        }

        return segments;
    }

    /**
     * Check if ray intersects with any target
     * @param {Ray} currentRay - The ray to test
     * @param {number} maxDistance - Maximum distance to check
     * @returns {Object|null} {target, distance, point} or null if no hit
     */
    checkTargetIntersection(currentRay, maxDistance) {
        let closestTarget = null;
        let closestDistance = Infinity;

        // Check all targets
        this.sceneStore.targets.forEach(target => {
            const intersection = GeometryMath.rayObjectIntersection(currentRay, target);

            if (intersection.hit) {
                closestDistance = intersection.distance;
                closestTarget = {
                    target: target,
                    distance: intersection.distance,
                    point: intersection.point
                };
            }
        });

        return closestTarget;
    }

    /**
     * Mark path of segments as hitting a target object
     * @param {Object|null} segment - The parent segment (or null if at root)
     */
    markPathToTarget(segment) {
        // Traverse up the tree, marking each parent as hitting target
        let current = segment;
        while (current !== null) {
            current.hitsTarget = true;
            current = current.parent || null;
        }
    }

    /**
     * Get distance to canvas boundary
     * @param {Ray} ray - The ray
     * @returns {number|null} Distance to boundary or null if no intersection
     */
    getCanvasBoundaryDistance(ray) {
        const intersections = [];

        // Check all four edges
        // Left edge (x = 0)
        if (ray.direction.x !== 0) {
            const t = -ray.origin.x / ray.direction.x;
            if (t > 0) {
                const y = ray.origin.y + t * ray.direction.y;
                if (y >= 0 && y <= this.settings.canvasHeight) {
                    intersections.push(t);
                }
            }
        }

        // Right edge (x = canvasWidth)
        if (ray.direction.x !== 0) {
            const t = (this.settings.canvasWidth - ray.origin.x) / ray.direction.x;
            if (t > 0) {
                const y = ray.origin.y + t * ray.direction.y;
                if (y >= 0 && y <= this.settings.canvasHeight) {
                    intersections.push(t);
                }
            }
        }

        // Top edge (y = 0)
        if (ray.direction.y !== 0) {
            const t = -ray.origin.y / ray.direction.y;
            if (t > 0) {
                const x = ray.origin.x + t * ray.direction.x;
                if (x >= 0 && x <= this.settings.canvasWidth) {
                    intersections.push(t);
                }
            }
        }

        // Bottom edge (y = canvasHeight)
        if (ray.direction.y !== 0) {
            const t = (this.settings.canvasHeight - ray.origin.y) / ray.direction.y;
            if (t > 0) {
                const x = ray.origin.x + t * ray.direction.x;
                if (x >= 0 && x <= this.settings.canvasWidth) {
                    intersections.push(t);
                }
            }
        }

        // Return closest intersection
        if (intersections.length > 0) {
            return Math.min(...intersections);
        }

        return null;
    }

    /**
     * Get intersection point with canvas boundary
     * @param {Ray} ray - The ray
     * @param {number} maxDistance - Maximum distance to check
     * @returns {Object} {x, y} point
     */
    getCanvasBoundaryIntersection(ray, maxDistance) {
        const boundaryDist = this.getCanvasBoundaryDistance(ray);

        if (boundaryDist !== null && boundaryDist < maxDistance) {
            return ray.pointAt(boundaryDist);
        }

        return ray.pointAt(maxDistance);
    }

    /**
     * Find which object (if any) contains a given point
     * @param {Object} point - {x, y}
     * @returns {Object|null} The containing object or null if in air
     */
    findContainingObject(point) {
        // Check objects from top to bottom (last added = on top)
        for (let i = this.sceneStore.objects.length - 1; i >= 0; i--) {
            const object = this.sceneStore.objects[i];
            if (object.containsPoint(point.x, point.y)) {
                return object;
            }
        }
        return null;    // Point is in air
    }

    /**
     // TODO: This will be later optimized by spacial-accelerated structures
     * Find the closest intersection with scene objects
     * @param {Ray} ray - The ray to test
     * @param {Object|null} currentMedium - The object the ray is currently inside (null = air)
     * @returns {Intersection}
     */
    findClosestIntersection(ray, currentMedium) {
        // If we're inside an object, always check for exit intersection first
        if (currentMedium) {
            const exitIntersection = GeometryMath.rayObjectIntersection(ray, currentMedium);
            if (exitIntersection.hit) {
                // Also check other objects via BVH
                const otherIntersection = this.settings.useBVH && this.bvh
                    ? this.bvh.traverse(ray, currentMedium)
                    : this.findClosestIntersectionBruteForce(ray, currentMedium);

                // Return whichever is closer
                if (!otherIntersection.hit) {
                    return exitIntersection;
                }

                return exitIntersection.distance < otherIntersection.distance
                    ? exitIntersection
                    : otherIntersection;
            }
        }

        // Use BVH if available, otherwise brute force
        if (this.settings.useBVH && this.bvh) {
            return this.bvh.traverse(ray, currentMedium);
        } else {
            return this.findClosestIntersectionBruteForce(ray, currentMedium);
        }
    }

    /**
     * Brute force intersection (fallback when BVH is disabled)
     * @param {Ray} ray - The ray to test
     * @param {Object|null} currentMedium - The object the ray is currently inside
     * @returns {Intersection}
     */
    findClosestIntersectionBruteForce(ray, currentMedium) {
        const intersections = [];

        // Test against all other objects
        this.sceneStore.objects.forEach(object => {
            // Skip the object we're currently inside
            if (currentMedium && object.id === currentMedium.id) {
                return;
            }

            const intersection = GeometryMath.rayObjectIntersection(ray, object);
            if (intersection.hit) {
                intersections.push(intersection);
            }
        });

        return Intersection.closest(intersections);
    }


    /**
     * Calculate the next rays after hitting a surface (both reflection and refraction)
     * @param {Ray} ray - Current ray
     * @param {Intersection} intersection - Intersection info
     * @param {Object|null} currentMedium - The object the ray is currently inside (null = air)
     * @returns {Array} Array of {ray: Ray, medium: Object|null}
     */
    calculateNextRays(ray, intersection, currentMedium) {
        const material = intersection.object.material;
        const reflectivity = material.reflectivity;
        const results = [];

        // Determine if we're entering or exiting the object
        const entering = currentMedium === null || currentMedium.id !== intersection.object.id;

        // Set refractive indices
        let n1, n2;
        if (entering) {
            // Entering object: from air to material
            n1 = this.settings.airRefractiveIndex;
            n2 = material.refractiveIndex;
        } else {
            // Exiting object: from material to air
            n1 = material.refractiveIndex;
            n2 = this.settings.airRefractiveIndex;
        }

        // Calculate reflected ray
        if (reflectivity > 0.001) {
            const reflectedDir = LightCalculator.reflect(ray.direction, intersection.normal);
            results.push({
                ray: ray.spawn(intersection.point, reflectedDir, reflectivity),
                medium: currentMedium   // Reflection stays in the same medium
            });
        }

        // Calculate refracted ray
        if (reflectivity < 0.999) {
            const refractedDir = LightCalculator.refract(
                ray.direction,
                intersection.normal,
                n1,
                n2
            );

            if (refractedDir) {
                // Successful refraction
                const newMedium = entering ? intersection.object : null;
                results.push({
                    ray: ray.spawn(intersection.point, refractedDir, 1 - reflectivity),
                    medium: newMedium
                });
            } else {
                // Total internal reflection -- all remaining energy reflects
                const reflectedDir = LightCalculator.reflect(ray.direction, intersection.normal);
                results.push({
                    ray: ray.spawn(intersection.point, reflectedDir, 1 - reflectivity),
                    medium: currentMedium
                });
            }
        }

        return results;
    }
}