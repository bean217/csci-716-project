/**
 * file: src/geometry/Triangle.js
 * desc: Implements an equilateral triangle object.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 19 October 2025
 */

import Triangle from './Triangle.js';

/**
 * Equilateral Triangle (special case of Triangle with all sides equal)
 */
export default class EquilateralTriangle extends Triangle {
    constructor({
        id = null,
        x = 0,
        y = 0,
        sideLength = 60,
        rotation = 0,
        edgeColor = '#ffffff',
        fillColor = '#666666',
        material = null
    } ={}) {
        super({
            id,
            x,
            y,
            side1: sideLength,
            side2: sideLength,
            side3: sideLength,
            rotation,
            edgeColor,
            fillColor,
            material,
        });

        this.type = 'EquilateralTriangle';
    }

    /**
     * Get side length
     */
    getSideLength() {
        return this.side1;
    }

    /**
     * Set side length (updates all three sides)
     */
    setSideLength(length) {
        const validated = this.validateSide(length, 'sideLength');
        this.side1 = validated;
        this.side2 = validated;
        this.side3 = validated;
    }

    /**
     * Override setSide1 to maintain equilateral constraint
     */
    setSide1(side1) {
        this.setSideLength(side1);
    }

    /**
     * Override setSide2 to maintain equilateral constraint
     */
    setSide2(side2) {
        this.setSideLength(side2);
    }

    /**
     * Override setSide3 to maintain equilateral constraint
     */
    setSide3(side3) {
        this.setSideLength(side3);
    }

    /**
     * Serialize to plain object
     */
    toJSON() {
        const json = super.toJSON();
        json.type = 'EquilateralTriangle';
        json.sideLength = this.side1;
        // Remove redundant side properties
        delete json.side1;
        delete json.side2;
        delete json.side3;
        return json;
    }

    /**
     * Update properties from plain object
     */
    updateFromJSON(json) {
        if (json.sideLength !== undefined) {
            this.setSideLength(json.sideLength);
        }
        super.updateFromJSON(json);
    }

    /**
     * Create EquilateralTriangle from JSON
     */
    static fromJSON(json) {
        const triangle = new EquilateralTriangle(json);
        triangle.updateFromJSON(json);
        return triangle;
    }
}