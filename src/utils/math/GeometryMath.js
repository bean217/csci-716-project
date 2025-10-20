/**
 * file: src/utils/math/GeometryMath.js
 * desc: Utility for calculating ray-geometry intersections.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 20 October 2025
 */

import Intersection from '@/simulation/Intersection.js';

/**
 * GeometryMath - Ray-geometry intersection calculations
 */
export default class GeometryMath {
    static EPSILON = 0.0001;

    /**
     * Ray-line segment intersection
     * @param {Object} rayOrigin - {x, y}
     * @param {Object} rayDir - {x, y} normalized
     * @param {Object} p1 - Line segment start {x, y}
     * @param {Object} p2 - Line segment end {x, y}
     * @returns {Object|null} {t, point, normal} or null
     */
    static rayLineSegmentIntersection(rayOrigin, rayDir, p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;

        const det = rayDir.x * (-dy) - rayDir.y * (-dx);

        // Parallel or coincident
        if (Math.abs(det) < this.EPSILON) {
            return null;
        }

        const t = ((p1.x - rayOrigin.x) * (-dy) - (p1.y - rayOrigin.y) * (-dx)) / det;
        const u = ((p1.x - rayOrigin.x) * rayDir.y - (p1.y - rayOrigin.y) * rayDir.x) / det;

        // Check if intersection is on ray (t >= 0) and on line segment (0 <= u <= 1)
        if (t >= this.EPSILON && u >= 0 && u <= 1) {
            const point = {
                x: rayOrigin.x + t * rayDir.x,
                y: rayOrigin.y + t * rayDir.y
            };

            // Calculate normal (perpendicular to edge, pointing outward)
            const edgeLength = Math.sqrt(dx * dx + dy * dy);
            const normal = {
                x: -dy / edgeLength,
                y: dx / edgeLength
            };

            // Ensure normal points against the ray
            const dot = rayDir.x * normal.x + rayDir.y * normal.y;
            if (dot > 0) {
                normal.x = -normal.x;
                normal.y = -normal.y;
            }

            return { t, point, normal };
        }

        return null;
    }

    /**
     * Ray-polygon intersection (for rectangles, triangles, etc.)
     * @param {Object} rayOrigin - {x, y}
     * @param {Object} rayDir - {x, y} normalized
     * @param {Array} vertices - Array of {x, y} vertices
     * @param {Object} object - The geometric object
     * @returns {Intersection}
     */
    static rayPolygonIntersection(rayOrigin, rayDir, vertices, object) {
        let closestIntersection = null;
        let closestDistance = Infinity;

        // Check each edge
        for (let i = 0; i < vertices.length; i++) {
            const p1 = vertices[i];
            const p2 = vertices[(i + 1) % vertices.length];

            const result = this.rayLineSegmentIntersection(rayOrigin, rayDir, p1, p2);

            if (result && result.t < closestDistance) {
                closestDistance = result.t;
                closestIntersection = result;
            }
        }

        if (closestIntersection) {
            return new Intersection(
                true,
                closestDistance,
                closestIntersection.point,
                closestIntersection.normal,
                object
            );
        }

        return Intersection.noHit();
    }



    /**
     * Ray-circle intersection (for ellipses with equal radii)
     * @param {Object} rayOrigin - {x, y}
     * @param {Object} rayDir - {x, y} normalized
     * @param {Object} center - Circle center {x, y}
     * @param {number} radius - Circle radius
     * @param {Object} object - The geometric object
     * @returns {Intersection}
     */
    static rayCircleIntersection(rayOrigin, rayDir, center, radius, object) {
        const oc = {
            x: rayOrigin.x - center.x,
            y: rayOrigin.y - center.y
        };

        const a = rayDir.x * rayDir.x + rayDir.y * rayDir.y;
        const b = 2 * (oc.x * rayDir.x + oc.y * rayDir.y);
        const c = oc.x * oc.x + oc.y * oc.y - radius * radius;

        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            return Intersection.noHit();
        }

        const sqrtD = Math.sqrt(discriminant);
        let t = (-b - sqrtD) / (2 * a);

        // If first intersection is behind ray, try second
        if (t < this.EPSILON) {
            t = (-b + sqrtD) / (2 * a);
        }

        if (t < this.EPSILON) {
            return Intersection.noHit();
        }

        const point = {
            x: rayOrigin.x + t * rayDir.x,
            y: rayOrigin.y + t * rayDir.y
        };

        // Normal points from center to hit point
        const normal = {
            x: (point.x - center.x) / radius,
            y: (point.y - center.y) / radius
        };

        return new Intersection(true, t, point, normal, object);
    }

    /**
     * // TODO: This implementation currently treats ellipses/circles as polygons (fix this!)
     * Ray-object intersection (dispatcher)
     * @param {Ray} ray - The ray
     * @param {Object} object - The geometric object
     * @returns {Intersection}
     */
    static rayObjectIntersection(ray, object) {
        // Don't intersection with focal points
        if (object.type === 'FocalPoint') {
            return Intersection.noHit();
        }

        // For polygons (rectangles, triangles, etc.)
        if (object.getVertices) {
            const vertices = object.getVertices();
            return this.rayPolygonIntersection(ray.origin, ray.direction, vertices, object);
        }

        return Intersection.noHit();
    }
}