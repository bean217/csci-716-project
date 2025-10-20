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
            ...settings
        };
    }

    /**
     * Trace all rays from all focal points
     * @returns {Array} Array of ray paths for rendering
     */
    traceAll() {
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
            segments: segments  // Reference to where we should add child segments
        }];

        while (rayQueue.length > 0) {
            const {
                ray: currentRay,
                medium: insideObject,
                distance: remainingDistance,
                startPoint,
                segments: parentSegments
            } = rayQueue.shift();

            // Stop if intensity too low
            if (currentRay.intensity < this.settings.minIntensity) {
                continue;
            }

            // Stop if too many bounces
            if (currentRay.generation >= this.settings.maxBounces) {
                // Add final segment to max distance
                const endPoint = currentRay.pointAt(remainingDistance);
                parentSegments.push({
                    start: startPoint,
                    end: endPoint,
                    children: []
                });
                continue;
            }

            // Find the closest intersection
            const intersection = this.findClosestIntersection(currentRay, insideObject);

            if (!intersection.hit) {
                // No hit - ray continues to max distance
                const endPoint = currentRay.pointAt(remainingDistance);
                parentSegments.push({
                    start: startPoint,
                    end: endPoint,
                    children: []
                });
                continue;
            }

            // Check if intersection is within remaining distance
            if (intersection.distance > remainingDistance) {
                const endPoint = currentRay.pointAt(remainingDistance);
                parentSegments.push({
                    start: startPoint,
                    end: endPoint,
                    children: []
                });
                continue;
            }

            // Create segment to intersection point
            const segment = {
                start: startPoint,
                end: { ...intersection.point },
                children: []
            };
            parentSegments.push(segment);

            const newRemainingDistance = remainingDistance - intersection.distance;

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
                    segments: segment.children  // Children are added to this segment
                });
            });
        }

        return segments;
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
        const intersections = [];

        // If we're inside an object, check for exit intersection
        if (currentMedium) {
            const intersection = GeometryMath.rayObjectIntersection(ray, currentMedium);
            if (intersection.hit) {
                intersections.push(intersection);
            }
        }

        // Test against all other objects
        this.sceneStore.objects.forEach(object => {
            // Ski[ the object we're currently inside
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