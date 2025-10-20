/**
 * file: src/simulation/Ray.js
 * desc: Defines simulation of a ray of light within a scene.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 20 October 2025
 */

/**
 * Ray class representing a light ray
 */
export default class Ray {
    constructor(origin, direction, intensity = 1.0, generation = 0) {
        this.origin = { x: origin.x, y: origin.y };
        this.direction = this.normalize(direction);
        this.intensity = intensity;     // 0.0 to 1.0
        this.generation = generation;   // Number of bounces
    }

    /**
     * Normalize a direction vector to unit length
     */
    normalize(vec) {
        const length = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
        if (length === 0) {
            return { x: 0, y: 0 };
        }
        return {
            x: vec.x / length,
            y: vec.y / length
        };
    }

    /**
     * Get a point along the ray at distance t
     */
    pointAt(t) {
        return {
            x: this.origin.x + this.direction.x * t,
            y: this.origin.y + this.direction.y * t
        }
    }

    /**
     * Create a new ray from this ray (for reflections/refractions)
     */
    spawn(newOrigin, newDirection, intensityMultiplier = 1.0) {
        return new Ray(
            newOrigin,
            newDirection,
            this.intensity * intensityMultiplier,
            this.generation + 1
        );
    }
}