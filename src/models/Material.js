/**
 * file: src/models/Material.js
 * desc: Defines material properties of obstacles placed in a scene.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 17 October 2025
 */

/**
 * Material class representing optical properties of geometric objects
 */
export default class Material {
    constructor({
        reflectivity = 0.5,
        refractiveIndex = 1.5,
        absorptance = 0.5
    } = {}) {
        this.reflectivity = this.validateReflectivity(reflectivity);
        this.refractiveIndex = this.validateRefractiveIndex(refractiveIndex);
        this.absorptance = this.validateAbsorptance(absorptance);
    }

    // Validate reflectivity (0 = no reflection, 1 = perfect mirror)
    validateReflectivity(value) {
        // value must fall within [0,1]
        const clamped = Math.max(0, Math.min(1, value));
        // Send a warning message to the console if value was invalid
        if (clamped !== value) {
            console.warn(`Reflectivity clamped from ${value} to ${clamped}`);
        }
        return clamped;
    }

    // Validate refractive index (1.0 = none, 2.5 = max practical amount)
    validateRefractiveIndex(value) {
        // value must fall within [1.0, 2.5]
        const clamped = Math.max(1.0, Math.min(2.5, value));
        // Send a warning message to the console if value was invalid
        if (clamped !== value) {
            console.warn(`Refractive index clamped from ${value} to ${clamped}`);
        }
        return clamped;
    }

    // Validate absorptance (0.0 = absorb no light (transparent), 1.0 = absorb all light (opaque))
    validateAbsorptance(value) {
        // value must fall within [0.0, 1.0]
        const clamped = Math.max(0.0, Math.min(1.0, value));
        // Send a warning message to the console if value was invalid
        if (clamped !== value) {
            console.warn(`Absorptance clamped from ${value} to ${clamped}`);
        }
        return clamped;
    }

    // Reflectivity setter
    setReflectivity(value) {
        this.reflectivity = this.validateReflectivity(value);
    }

    // Refractive index setter
    setRefractiveIndex(value) {
        this.refractiveIndex = this.validateRefractiveIndex(value);
    }

    // Absorptance setting
    setAbsorptance(value) {
        this.absorptance = this.validateAbsorptance(value);
    }

    // Create a copy of this material
    clone() {
        return new Material({
            reflectivity: this.reflectivity,
            refractiveIndex: this.refractiveIndex,
            absorptance: this.absorptance,
        });
    }

    // Serialize to a plain JS object
    toJSON() {
        return {
            reflectivity: this.reflectivity,
            refractiveIndex: this.refractiveIndex,
            absorptance: this.absorptance,
        }
    }

    // Create from plain object
    static fromJSON(json) {
        return new Material(json)
    }

}

