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

        directions.forEach(direction => {
            const ray = new Ray(focalPoint.position, direction, 1.0, 0);
            const path = this.traceRay(ray, focalPoint.rayLength);

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
     * @param {Array} Array of points representing the ray path
     */
    traceRay(ray, maxDistance) {
        const path = [{ ...ray.origin }];
        let currentRay = ray;
        let remainingDistance = maxDistance;

        for (let bounce = 0; bounce < this.settings.maxBounces; bounce++) {
            // Stop if intensity too low
            if (currentRay.intensity < this.settings.minIntensity) {
                break;
            }

            // Find the closest intersection
            const intersection = this.findClosestIntersection(currentRay);

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

            // Calculate next ray based on material properties
            const material = intersection.object.material;
            const nextRay = this.calculateNextRay(
                currentRay,
                intersection,
                material
            );

            if (!nextRay) {
                // Ray absorbed
                break;
            }

            currentRay = nextRay;
        }

        return path;
    }

    /**
     // TODO: This will be later optimized by spacial-accelerated structures
     * Find the closest intersection with scene objects
     * @param {Ray} ray - The ray to test
     * @returns {Intersection}
     */
    findClosestIntersection(ray) {
        const intersections = [];

        // Test against all objects
        this.sceneStore.objects.forEach(object => {
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
     * @param {Material} material - surface material
     * @returns {Ray|null} Next ray or null if absorbed
     */
    calculateNextRay(ray, intersection, material) {
        const reflectivity = material.reflectivity;
        const n1 = this.settings.airRefractiveIndex;
        const n2 = material.refractiveIndex;

        // Calculate angle of incidence
        const cosTheta = -LightCalculator.dot(ray.direction, intersection.normal);

        // Pure reflection (mirror)
        if (reflectivity >= 0.99) {
            const reflectedDir = LightCalculator.reflect(ray.direction, intersection.normal);
            return ray.spawn(intersection.point, reflectedDir, reflectivity);
        }

        // Pure refraction (glass with no reflection)
        if (reflectivity <= 0.01) {
            const refractedDir = LightCalculator.refract(
                ray.direction,
                intersection.normal,
                n1,
                n2
            );

            if (refractedDir) {
                return ray.spawn(intersection.point, refractedDir, 1 - reflectivity);
            } else {
                // Total internal reflection
                const reflectedDir = LightCalculator.reflect(ray.direction, intersection.normal);
                return ray.spawn(intersection.point, reflectedDir, 1.0);
            }
        }

        // Mix reflection/refraction (use Fresnel)
        const fresnelReflectance = LightCalculator.fresnelReflectance(cosTheta, n1, n2);

        // For simplicity, we'll just do reflection
        // A more advanced implementation would probabilistically choose reflection vs refraction
        // TODO: Potentially update to use advanced implementations strategy
        if (Math.random() < fresnelReflectance || Math.random() < reflectivity) {
            const reflectedDir = LightCalculator.reflect(ray.direction, intersection.normal);
            return ray.spawn(intersection.point, reflectedDir, reflectivity);
        } else {
            const refractedDir = LightCalculator.refract(
                ray.direction,
                intersection.normal,
                n1,
                n2
            );

            if (refractedDir) {
                return ray.spawn(intersection.point, refractedDir, 1 - reflectivity);
            } else {
                // Total internal reflection
                const reflectedDir = LightCalculator.reflect(ray.direction, intersection.normal);
                return ray.spawn(intersection.point, reflectedDir, 1.0);
            }
        }
    }
}