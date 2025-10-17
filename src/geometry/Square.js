/**
 * file: src/geometry/Square.js
 * desc: Implements a square object.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 17 October 2025
 */

import Rectangle from './Rectangle.js';

/**
 * Square shape (special case of Rectangle with equal width and height)
 */
export default class Square extends Rectangle {
    constructor({
        id = null,
        x = 0,
        y = 0,
        sideLength = 80,
        rotation = 0,
        edgeColor = '#ffffff',
        fillColor = '#ffffff',
        material = null
    } = {}) {
        super({
            id,
            x,
            y,
            width: sideLength,
            height: sideLength,
            rotation,
            edgeColor,
            fillColor,
            material
        });

        this.type = 'Square';
    }

    // Side length getter
    getSideLength() {
        return this.width;
    }

    // Side length setter
    setSideLength(sideLength) {
        const validated = this.validateDimension(length, 'sideLength');
        this.width = sideLength;
        this.height = sideLength;
    }

    /**
     * Override setWidth to maintain square constraint
     */
    setWidth(width) {
        this.setSideLength(width);
    }

    /**
     * Override setHeight to maintain square constraint
     */
    setHeight(height) {
        this.setSideLength(height);
    }

    /**
     * Serialize to JSON
     */
    toJSON() {
        const json = super.toJSON();
        json.type = 'Square';
        json.sideLength = this.width;
        // remove redundant width/height
        delete json.width;
        delete json.height;
        return json;
    }

    /**
     * Update properties from plan JS object
     */
    updateFromJSON(json) {
        if (json.sideLength !== undefined) {
            this.setSideLength(json.sideLength);
        }
        super.updateFromJSON(json);
    }

    /**
     * Create Square from JSON
     */
    static fromJSON(json) {
        const square = new Square(json);
        square.updateFromJSON(json);
        return square;
    }


}