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
        const allPaths = []

        // Trace rays from each focal point
        this.sceneStore.focalPoints.forEach(focalPoint => {
            const paths = this.traceFocalPoint(focalPoint);
            allPaths.push(...paths);
        });

        return allPaths;
    }

    /**
     * Trace rays from a single focal point
     * @param {FocalPoint} focalPoint - The focal point to emit rays from
     * @returns {Array} Array of ray paths
     */
    traceFocalPoint(focalPoint) {
        const paths = [];
        const directions = focalPoint.getRayDirections();

        // Determine if focal point is inside any object
        const startingMedium = this.findContainingObject(focalPoint.position);

        directions.forEach(direction => {
            const ray = new Ray(focalPoint.position, direction, 1.0, 0);
            const path = this.traceRay(ray, focalPoint.rayLength, startingMedium);

            if (path.length > 0) {
                paths.push(path);
            }
        });

        return paths;
    }

    /**
     * Trace a single ray through the scene
     * @param {Ray} ray - The ray to trace
     * @param {number} maxDistance - Maximum distance to trace
     * @param {Object|null} currentMedium - The object the ray is currently inside (null = air)
     * @returns {Array} Array of points representing the ray path
     */
    traceRay(ray, maxDistance, currentMedium = null) {
        const path = [{ ...ray.origin }];
        let currentRay = ray;
        let remainingDistance = maxDistance;
        let insideObject = currentMedium;

        for (let bounce = 0; bounce < this.settings.maxBounces; bounce++) {
            // Stop if intensity too low
            if (currentRay.intensity < this.settings.minIntensity) {
                break;
            }

            // Find the closest intersection
            const intersection = this.findClosestIntersection(currentRay, insideObject);

            if (!intersection.hit) {
                // No hit - ray continues to max distance
                const endPoint = currentRay.pointAt(remainingDistance);
                path.push(endPoint);
                break;
            }

            // Check if intersection is within remaining distance
            if (intersection.distance > remainingDistance) {
                const endPoint = currentRay.pointAt(remainingDistance);
                path.push(endPoint);
                break;
            }

            // Add intersection point to path
            path.push({ ...intersection.point });
            remainingDistance -= intersection.distance;

            // Calculate next ray based on material properties and medium transition
            const result = this.calculateNextRay(
                currentRay,
                intersection,
                insideObject
            );

            if (!result) {
                // Ray absorbed
                break;
            }

            currentRay = result.ray;
            insideObject = result.medium;
        }

        return path;
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
     * Calculate the next ray after hitting a surface
     * @param {Ray} ray - Current ray
     * @param {Intersection} intersection - Intersection info
     * @param {Object|null} currentMedium - surface material
     * @returns {Object|null} {ray: Ray, medium: Object|null} or null if absorbed
     */
    calculateNextRay(ray, intersection, currentMedium) {
        const material = intersection.object.material;
        const reflectivity = material.reflectivity;

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

        // Calculate angle of incidence
        const cosTheta = -LightCalculator.dot(ray.direction, intersection.normal);

        // Pure reflection (mirror)
        if (reflectivity >= 0.99) {
            const reflectedDir = LightCalculator.reflect(ray.direction, intersection.normal);
            return {
                ray: ray.spawn(intersection.point, reflectedDir, reflectivity),
                medium: currentMedium   // stay in the same medium
            };
        }

        // Pure refraction (glass with minimal reflection
        if (reflectivity <= 0.01) {
            const refractedDir = LightCalculator.refract(
                ray.direction,
                intersection.normal,
                n1,
                n2
            );

            if (refractedDir) {
                // Successful refraction - change medium
                const newMedium = entering ? intersection.object : null;
                return {
                    ray: ray.spawn(intersection.point, refractedDir, 1 - reflectivity),
                    medium: newMedium
                };
            } else {
                // Total internal reflection
                const reflectedDir = LightCalculator.reflect(ray.direction, intersection.normal);
                return {
                    ray: ray.spawn(intersection.point, reflectedDir, 1.0),
                    medium: currentMedium   // stay in the same medium
                };
            }
        }

        // Mixed reflection/refraction (use Fresnel)
        const fresnelReflectance = LightCalculator.fresnelReflectance(cosTheta, n1, n2);

        // Decide: reflection or refraction
        // For visualization, we'll deterministically choose based on Fresnel
        // TODO: Update the following to render rays but modify their intensity
        if (Math.random() < fresnelReflectance || Math.random() < reflectivity) {
            // Reflection
            const reflectedDir = LightCalculator.reflect(ray.direction, intersection.normal);
            return {
                ray: ray.spawn(intersection.point, reflectedDir, reflectivity),
                medium: currentMedium   // stay in the same medium
            };
        } else {
            // Refraction
            const refractedDir = LightCalculator.refract(
                ray.direction,
                intersection.normal,
                n1,
                n2
            );

            if (refractedDir) {
                const newMedium = entering ? intersection.object : null;
                return {
                    ray: ray.spawn(intersection.point, refractedDir, 1 - reflectivity),
                    medium: newMedium
                };
            } else {
                // Total internal reflection
                const reflectedDir = LightCalculator.reflect(ray.direction, intersection.normal);
                return {
                    ray: ray.spawn(intersection.point, reflectedDir, 1.0),
                    medium: currentMedium
                };
            }
        }
    }
}