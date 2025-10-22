/**
 * file: src/simulation/Intersection.js
 * desc: Defines simulation of the intersection between a ray of light and an object.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 20 October 2025
 */

/**
 * Intersection class representing a ray-object intersection
 */
export default class Intersection {
    constructor(hit, distance, point, normal, object) {
        this.hit = hit;                 // Boolean - did we hit something?
        this.distance = distance;       // Distance from ray origin to hit point
        this.point = point;             // {x, y} - Hit point coordinates
        this.normal = normal;           // {x, y} - Surface normal at hit point
        this.object = object;           // The object that was hit
    }

    /**
     * Create a "no hit" intersection
     */
    static noHit() {
        return new Intersection(false, Infinity, null, null, null);
    }

    /**
     * Compare two intersections - closer one is "less than"
     */
    static compare(a, b) {
        if (!a.hit && !b.hit) return 0;
        if (!a.hit) return 1;
        if (!b.hit) return -1;
        return a.distance - b.distance;
    }

    /**
     * Get the closest intersection from an array
     */
    static closest(intersections) {
        return intersections.reduce((closest, current) => {
            if (!current.hit) return closest;
            if (!closest.hit) return current;
            return current.distance < closest.distance ? current : closest;
        }, Intersection.noHit());
    }
}