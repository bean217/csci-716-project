/**
 * file: src/simulation/LightCalculator.js
 * desc: Handles calculating reflections and refractions.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 20 October 2025
 */

/**
 * LightCalculator - Handles reflection and refraction calculations
 */
export default class LightCalculator {
    /**
     * Calculate reflection direction
     * @param {Object} incident - Incident ray direction (normalized)
     * @param {Object} normal - Surface normal (normalized)
     * @returns {Object} Reflected direction
     */
    static reflect(incident, normal) {
        // R = I - 2(I*N)N
        const dot = incident.x * normal.x + incident.y * normal.y;
        return {
            x: incident.x - 2 * dot * normal.x,
            y: incident.y - 2 * dot * normal.y
        };
    }

    /**
     * Calculate refraction direction using Snell's law
     * @param {Object} incident - Incident ray direction (normalized)
     * @param {Object} normal - Surface normal (normalized)
     * @param {number} n1 - Refractive index of original medium
     * @param {number} n2 - refractive index of destination medium
     * @returns {Object|null} Refracted direction or null if total internal reflection
     */
    static refract(incident, normal, n1, n2) {
        const eta = n1 / n2;
        const dot = -(incident.x * normal.x + incident.y * normal.y);

        const k = 1 - eta * eta * (1 - dot * dot);

        // Total internal reflection
        if (k < 0) {
            return null;
        }

        const sqrtK = Math.sqrt(k);
        return {
            x: eta * incident.x + (eta * dot - sqrtK) * normal.x,
            y: eta * incident.y + (eta * dot - sqrtK) * normal.y
        }
    }

    /**
     * Calculate Fresnel reflectance (Schlick's approximation)
     * Determines how much light reflects vs refracts
     * @param {number} cosTheta - Cosine of incident angle
     * @param {number} n1 - Refractive index of original medium
     * @param {number} n2 - Refractive index of destination medium
     * @returns {number} Reflectance (0-1)
     */
    static fresnelReflectance(cosTheta, n1, n2) {
        // Schlick's approximation
        let r0 = ((n1 - n2) / (n1 + n2)) ** 2;
        return r0 + (1 - r0) * Math.pow(1 - Math.abs(cosTheta), 5);
    }

    /**
     * Normalize a vector
     */
    static normalize(vec) {
        const length = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
        if (length === 0) return { x: 0, y: 0 };
        return {
            x: vec.x / length,
            y: vec.y / length
        }
    }

    /**
     * Calculate dot product
     */
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
}