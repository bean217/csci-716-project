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
        // Line segment vector
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;

        // Vector from ray origin to segment start
        const toSegX = p1.x - rayOrigin.x;
        const toSegY = p1.y - rayOrigin.y;

        // Cross product to find determinant
        const det = rayDir.x * dy - rayDir.y * dx;

        // Parallel or coincident
        if (Math.abs(det) < this.EPSILON) {
            return null;
        }

        // Calculate parametric coordinates
        const t = (toSegX * dy - toSegY * dx) / det;
        const u = (toSegX * rayDir.y - toSegY * rayDir.x) / det;

        // Check if intersection is on ray (t >= 0) and on line segment (0 <= u <= 1)
        if (t >= this.EPSILON && u >= 0 && u <= 1) {
            const point = {
                x: rayOrigin.x + t * rayDir.x,
                y: rayOrigin.y + t * rayDir.y
            };

            // Calculate normal (perpendicular to edge, pointing outward)
            const edgeLength = Math.sqrt(dx * dx + dy * dy);

            // Normal is perpendicular to edge: rotate edge 90 degrees ccw
            let normal = {
                x: -dy / edgeLength,
                y: dx / edgeLength
            };

            // Ensure normal points against the ray direction
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

            if (i === 0)
                console.log(`p1: (${p1.x} ${p1.y}), p2: (${p2.x} ${p2.y})`);

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
     * Ray-ellipse intersection
     * @param {Object} rayOrigin - {x, y}
     * @param {Object} rayDir - {x, y} normalized
     * @param {Object} center - Ellipse center {x, y}
     * @param {number} rx - X-axis radius
     * @param {number} ry - Y-axis radius
     * @param {number} rotation - Ellipse rotation in radians
     * @param {Object} object - The geometric object
     * @returns {Intersection}
     */
    static rayEllipseIntersection(rayOrigin, rayDir, center, rx, ry, rotation, object) {
        // Transform ray to ellipse local space (unrotated, centered at origin)
        const cos = Math.cos(-rotation);
        const sin = Math.sin(-rotation);

        // Translate to ellipse center
        const ox = rayOrigin.x - center.x;
        const oy = rayOrigin.y - center.y;

        // Rotate to ellipse local space
        const localOrigin = {
            x: ox * cos - oy * sin,
            y: ox * sin + oy * cos
        };

        const localDir = {
            x: rayDir.x * cos - rayDir.y * sin,
            y: rayDir.x * sin + rayDir.y * cos
        };

        // Scale to unit circle (divide x by rx, y by ry)
        const scaledOrigin = {
            x: localOrigin.x / rx,
            y: localOrigin.y / ry
        };

        const scaledDir = {
            x: localDir.x / rx,
            y: localDir.y / ry
        };

        // Now solve ray-circle intersection for unit circle
        const a = scaledDir.x * scaledDir.x + scaledDir.y * scaledDir.y;
        const b = 2 * (scaledOrigin.x * scaledDir.x + scaledOrigin.y * scaledDir.y);
        const c = scaledOrigin.x * scaledOrigin.x + scaledOrigin.y * scaledOrigin.y - 1;

        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            return Intersection.noHit();
        }

        const sqrtD = Math.sqrt(discriminant);
        let t = (-b - sqrtD) / (2 * a);
        let useSecondIntersection = false;

        // If first intersection is behind ray, try second
        if (t < this.EPSILON) {
            t = (-b + sqrtD) / (2 * a);
            useSecondIntersection = true;
        }

        if (t < this.EPSILON) {
            return Intersection.noHit();
        }

        // Calculate hit point in local space
        const localHit = {
            x: localOrigin.x + t * localDir.x,
            y: localOrigin.y + t * localDir.y
        };

        // Calculate normal in local space (gradient of ellipse equation)
        // For ellipse (x/rx)^2 + (y/ry)^2 = 1, gradient is (2x/rx^2, 2y/ry^2)
        const localNormal = {
            x: localHit.x / (rx * rx),
            y: localHit.y / (ry * ry)
        };

        // Normalize the normal
        const normalLength = Math.sqrt(localNormal.x * localNormal.x + localNormal.y * localNormal.y);
        localNormal.x /= normalLength;
        localNormal.y /= normalLength;

        // If we're using the second intersection (exiting from inside),
        // flip the normal to point inward
        if (useSecondIntersection) {
            localNormal.x = -localNormal.x;
            localNormal.y = -localNormal.y;
        }

        // Transform hit point back to world space
        const rotCos = Math.cos(rotation);
        const rotSin = Math.sin(rotation);

        const worldHit = {
            x: center.x + localHit.x * rotCos - localHit.y * rotSin,
            y: center.y + localHit.x * rotSin + localHit.y * rotCos
        };

        // Transform normal back to world space
        const worldNormal = {
            x: localNormal.x * rotCos - localNormal.y * rotSin,
            y: localNormal.x * rotSin + localNormal.y * rotCos
        };

        // Calculate actual distance in world space
        const dx = worldHit.x - rayOrigin.x;
        const dy = worldHit.y - rayOrigin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return new Intersection(true, distance, worldHit, worldNormal, object);
    }

    /**
     * Ray-object intersection (dispatcher)
     * @param {Ray} ray - The ray
     * @param {Object} object - The geometric object
     * @returns {Intersection}
     */
    static rayObjectIntersection(ray, object) {
        // Don't intersect with focal points
        if (object.type === 'FocalPoint') {
            return Intersection.noHit();
        }

        // Circle - analytical intersection
        if (object.type === 'Circle') {
            const radius = object.getRadius();
            return this.rayEllipseIntersection(
                ray.origin,
                ray.direction,
                object.position,
                radius,
                radius,
                object.rotation,
                object
            );
        }

        if (object.type === 'Ellipse') {
            return this.rayEllipseIntersection(
                ray.origin,
                ray.direction,
                object.position,
                object.rx,
                object.ry,
                object.rotation,
                object
            );
        }

        // For polygons (rectangles, triangles, etc.)
        if (object.getVertices) {
            const vertices = object.getVertices();
            return this.rayPolygonIntersection(ray.origin, ray.direction, vertices, object);
        }

        return Intersection.noHit();
    }
}