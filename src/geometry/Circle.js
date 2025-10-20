/**
 * file: src/geometry/Circle.js
 * desc: Implements a circle object.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 19 October 2025
 */

import Ellipse from './Ellipse.js';

/**
 * Circle shape (special case of Ellipse with equal radii)
 */
export default class Circle extends Ellipse {
    constructor({
        id = null,
        x = 0,
        y = 0,
        radius = 50,
        rotation = 0,
        edgeColor = '#ffffff',
        fillColor = '#666666',
        material = null
    } = {}) {
        super({
            id,
            x,
            y,
            rx: radius,
            ry: radius,
            rotation,
            edgeColor,
            fillColor,
            material
        });

        this.type = 'Circle';
    }

    /**
     * Get radius
     */
    getRadius() {
        return this.rx;
    }

    /**
     * Set radius
     */
    setRadius(radius) {
        const validated = this.validateRadius(radius, 'radius');
        this.rx = validated;
        this.ry = validated;
    }

    /**
     * Override setRx to maintain circle constraint
     */
    setRx(rx) {
        this.setRadius(rx);
    }

    /**
     * Override setRy to maintain circle constraint
     */
    setRy(ry) {
        this.setRadius(ry);
    }

    /**
     * Serialize to plain object
     */
    toJSON() {
        const json = super.toJSON();
        json.type = 'Circle';
        json.radius = this.rx;
        // Remove redundant rx/ry
        delete json.rx;
        delete json.ry;
        return json;
    }

    /**
     * Update properties from plain object
     */
    updateFromJSON(json) {
        if (json.radius !== undefined) {
            this.setRadius(json.radius);
        }
        super.updateFromJSON(json);
    }

    /**
     * Create Circle from JSON
     */
    static fromJSON(json) {
        const circle = new Circle(json);
        circle.updateFromJSON(json);
        return circle;
    }
}