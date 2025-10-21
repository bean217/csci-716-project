/**
 * file: src/stores/sceneStore.js
 * desc: Manages the state of the visible scene.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 17 October 2025
 */

import { defineStore } from 'pinia';
import Rectangle from '@/geometry/Rectangle.js';
import Square from '@/geometry/Square.js';
import Ellipse from '@/geometry/Ellipse.js';
import Circle from '@/geometry/Circle.js';
import Triangle from '@/geometry/Triangle.js';
import EquilateralTriangle from '@/geometry/EquilateralTriangle.js';
import FocalPoint from '@/geometry/FocalPoint.js';
import Target from '@/geometry/Target.js';

/**
 * Scene store manages all geometric objects in the scene
 */
export const useSceneStore = defineStore('scene', {
    state: () => ({
        // All geometric objects in the scene
        objects: [],

        // Currently selected objectID
        selectedObjectId: null,

        // focalPoints (light sources/cameras)
        focalPoints: [],

        // Target objects for ray tracing
        targets: []
    }),

    getters: {
        // Get the currently selected object
        selectedObject: (state) => {
            if (!state.selectedObjectId) return null;

            // Check if it is a focal point
            const focalPoint = state.focalPoints.find(fp => fp.id === state.selectedObjectId);
            if (focalPoint) return focalPoint;

            // Check if it's a target
            const target = state.targets.find(t => t.id === state.selectedObjectId);
            if (target) {
                return target;
            }

            return state.objects.find(obj => obj.id === state.selectedObjectId) || null;
        },

        // Get object by ID
        getObjectById: (state) => (id) => {
            // Check focal points
            const focalPoint = state.focalPoints.find(fp => fp.id === id);
            if (focalPoint) return focalPoint;

            // Check targets
            const target = state.targets.find(t => t.id === id);
            if (target) return target;

            return state.objects.find(obj => obj.id === id) || null;
        },

        // Get objects by type
        getObjectsByType: (state) => (type) => {
            if (type === 'FocalPoint') return state.focalPoints;
            if (type === 'Target') return state.targets;
            return (type) => state.objects.filter(obj => obj.type === type);
        },

        // Get count of objects
        objectCount: (state) => state.objects.length,

        // Check if an object is selected
        hasSelection: (state) => state.selectedObjectId !== null
    },

    actions: {
        /**
         * Add a new object to the scene
         * @param {GeometricObject} object - The object to add
         * @param {boolean} select - Whether to select the object after adding
         */
        addObject(object, select = true) {
            if (!object || !object.id) {
                console.error('Invalid object provided to addObject');
                return
            }

            // Special handling for FocalPoint - add to focalPoints array
            if (object.type === 'FocalPoint') {
                // Check for duplicate IDs in focal points
                if (this.focalPoints.find(fp => fp.id === object.id)) {
                    console.warn(`FocalPoint with id ${object.id} already exists`);
                    return;
                }

                this.focalPoints.push(object);

                if (select) {
                    this.selectedObjectId = object.id;
                }
                console.log(`Added FocalPoint with id ${object.id}`);
                return;
            }

            // Special handling for Target - add to targets array
            if (object.type === 'Target') {
                // Check for duplicate IDs in targets
                if (this.targets.find(t => t.id === object.id)) {
                    console.warn(`Target with id ${object.id} already exists`);
                    return;
                }

                this.targets.push(object);

                if (select) {
                    this.selectedObjectId = object.id;
                }
                console.log(`Added Target with id ${object.id}`);
                return;
            }

            // Check for duplicate IDs
            if (this.objects.find(obj => obj.id === object.id)) {
                console.warn(`Object with id ${object.id} already exists`);
                return;
            }

            this.objects.push(object);

            if (select) {
                this.selectedObjectId = object.id;
            }

            console.log(`Added ${object.type} with id ${object.id}`);
        },

        /**
         * Remove an object from the scene
         */
        removeObject(id) {
            // Check if it is a focal point
            const focalIndex = this.focalPoints.findIndex(fp => fp.id === id);
            if (focalIndex !== -1) {
                this.focalPoints.splice(focalIndex, 1);
                if (this.selectedObjectId === id) {
                    this.selectedObjectId = null;
                }
                console.log(`Removed FocalPoint with id ${id}`);
                return;
            }

            // Check if it's a target
            const targetIndex = this.targets.findIndex(t => t.id === id);
            if (targetIndex !== -1) {
                this.targets.splice(targetIndex, 1);
                if (this.selectedObjectId === id) {
                    this.selectedObjectId = null;
                }
                console.log(`Removed Target with id ${id}`);
                return;
            }

            // Check objects
            const index = this.objects.findIndex(obj => obj.id === id);
            if (index === -1) {
                console.warn(`Object with id ${id} not found`);
            }
            const object = this.objects[index]
            this.objects.splice(index, 1);

            // If removed object was selected, clear selection
            if (this.selectedObjectId === id) {
                this.selectedObjectId = null;
            }

            console.log(`Removed ${object.type} with id ${object.id}`);
        },

        /**
         * Remove the currently selected object
         */
        removeSelectedObject() {
            if (this.selectedObjectId) {
                this.removeObject(this.selectedObjectId)
            }
        },

        /**
         * Select an object by ID
         * @param {string} id - ID of the object to select
         */
        selectObject(id) {
            const object = this.getObjectById(id);
            if (object) {
                this.selectedObjectId = id;
                console.log(`Selected ${object.type} with id ${id}`)
            } else {
                console.warn(`Cannot select: object with id ${id} not found`);
            }
        },

        /**
         * Deselect the current object
         */
        deselectObject() {
            this.selectedObjectId = null;
            console.log('Deselected object');
        },

        /**
         * Update properties of an object
         * @param {string} id - ID of the object to update
         * @param {Object} updates - Object containing properties to update
         */
        updateObject(id, updates) {
            // Check if it is a focal point
            let object = null;
            let index = -1;
            let isFocalPoint = false;
            let isTarget = false;

            const focalIndex = this.focalPoints.findIndex(fp => fp.id === id);
            if (focalIndex !== -1) {
                object = this.focalPoints[focalIndex];
                index = focalIndex;
                isFocalPoint = true;
            } else {
                const targetIndex = this.targets.findIndex(tp => tp.id === id);
                if (targetIndex !== -1) {
                    object = this.targets[targetIndex];
                    index = targetIndex;
                    isTarget = true;
                } else {
                    index = this.objects.findIndex(obj => obj.id === id);
                    if (index !== -1) {
                        object = this.objects[index];
                    }
                }
            }

            if (!object) {
                console.warn(`Cannot update: object with id ${id} not found`);
                return;
            }

            // Update position
            if (updates.x !== undefined || updates.y !== undefined) {
                const x = updates.x !== undefined ? updates.x : object.position.x;
                const y = updates.y !== undefined ? updates.y : object.position.y;
                object.setPosition(x, y);
            }

            // Update rotation
            if (updates.rotation !== undefined) {
                object.setRotation(updates.rotation);
            }

            // Update colors
            if (updates.edgeColor) {
                object.setEdgeColor(updates.edgeColor);
            }
            if (updates.fillColor) {
                object.setFillColor(updates.fillColor);
            }

            // Update material properties
            if (updates.reflectivity !== undefined) {
                object.material.setReflectivity(updates.reflectivity);
            }
            if (updates.refractiveIndex !== undefined) {
                object.material.setRefractiveIndex(updates.refractiveIndex);
            }

            // Update shape-specific properties
            if (object.type === 'Rectangle' || object.type === 'Square') {
                if (object.type === 'Square' && updates.sideLength !== undefined) {
                    object.setSideLength(updates.sideLength);
                } else {
                    if (updates.width !== undefined) {
                        object.setWidth(updates.width);
                    }
                    if (updates.height !== undefined) {
                        object.setHeight(updates.height);
                    }
                }
            } else if (object.type === 'Ellipse' || object.type === 'Circle') {
                if (object.type === 'Circle' && updates.radius !== undefined) {
                    object.setRadius(updates.radius);
                } else {
                    if (updates.rx !== undefined) {
                        object.setRx(updates.rx);
                    }
                    if (updates.ry !== undefined) {
                        object.setRy(updates.ry);
                    }
                }
            } else if (object.type === 'Triangle' || object.type === 'EquilateralTriangle') {
                if (object.type === 'EquilateralTriangle' && updates.sideLength !== undefined) {
                    object.setSideLength(updates.sideLength);
                } else {
                    if (updates.side1 !== undefined) {
                        object.setSide1(updates.side1);
                    }
                    if (updates.side2 !== undefined) {
                        object.setSide2(updates.side2);
                    }
                    if (updates.side3 !== undefined) {
                        object.setSide3(updates.side3);
                    }
                }
            } else if (object.type === 'FocalPoint') {
                if (updates.rayCount !== undefined) {
                    object.setRayCount(updates.rayCount);
                }
                if (updates.rayLength !== undefined) {
                    object.setRayLength(updates.rayLength);
                }
                if (updates.radius !== undefined) {
                    object.setRadius(updates.radius);
                }
                if (updates.emitFromSurface !== undefined) {
                    object.setEmitFromSurface(updates.emitFromSurface);
                }
            } else if (object.type === 'Target') {
                if (updates.size !== undefined) {
                    object.setSize(updates.size);
                }
            }

            // Force reactivity
            if (isFocalPoint) {
                this.focalPoints[index] = object;
            } else if (isTarget) {
                this.targets[index] = object;
            } else {
                this.objects[index] = object;
            }

            console.log(`Updated ${object.type} (${id}):`, updates);
        },

        /**
         * Update the currently selected object
         * @param {Object} updates - Object containing properties to update
         */
        updateSelectedObject(updates) {
            if (this.selectedObjectId) {
                this.updateObject(this.selectedObjectId, updates);
            }
        },

        /**
         * Clear all objects from the scene
         */
        clearScene() {
            this.objects = [];
            this.focalPoints = [];
            this.targets = [];
            this.selectedObjectId = null;
            console.log('Scene cleared');
        },

        /**
         * File object a given point (for selection)
         * Returns the topmost object at the point
         * @param {number} x - X coordinate
         * @param {number} y - Y coordinate
         * @returns {GeometricObject|null}
         */
        findObjectAtPoint(x, y) {
            // Check targets first
            for (let i = this.targets.length - 1; i >= 0; i--) {
                if (this.targets[i].containsPoint(x, y)) {
                    return this.targets[i];
                }
            }

            // Check focal points first (should be on top)
            for (let i = this.focalPoints.length - 1; i >= 0; i--) {
                if (this.focalPoints[i].containsPoint(x, y)) {
                    return this.focalPoints[i];
                }
            }

            // Search from end to start (topmost objects first)
            for (let i = this.objects.length - 1; i >= 0; i--) {
                if (this.objects[i].containsPoint(x, y)) {
                    return this.objects[i];
                }
            }
            return null;
        },

        /**
         * Select object at a given point
         * @param {number} x - X coordinate
         * @param {number} y - Y coordinate
         * @returns {boolean} - Whether an object was selected
         */
        selectObjectAtPoint(x, y) {
            const object = this.findObjectAtPoint(x, y);

            if (object) {
                this.selectObject(object.id);
                return true;
            } else {
                this.deselectObject();
                return false;
            }
        },

        /**
         * Export scene to JSON
         */
        exportScene() {
            return {
                objects: this.objects.map(obj => obj.toJSON()),
                focalPoints: this.focalPoints.map(fp => fp.toJSON()),
                targets: this.targets.map(t => t.toJSON())
            }
        },

        /**
         * Import scene from JSON
         * Note: This is a basic implementation.
         * Full implementation would need a factory to reconstruct different shape types
         */
        importScene(json) {
            this.clearScene()

            // Import focal points
            if (json.focalPoints) {
                json.focalPoints.forEach(fpData => {
                    const focalPoint = FocalPoint.fromJSON(fpData);
                    this.focalPoints.push(focalPoint);
                });
            }

            // Import targets
            if (json.targets) {
                json.targets.forEach(targetData => {
                    const target = Target.fromJSON(targetData);
                    this.targets.push(target);
                });
            }

            // Factory to reconstruct objects by type
            if (json.objects) {
                json.objects.forEach(objData => {
                    let object
                    switch (objData.type) {
                        case 'Rectangle':
                            object = Rectangle.fromJSON(objData);
                            break;
                        case 'Square':
                            object = Square.fromJSON(objData);
                            break;
                        case 'Ellipse':
                            object = Ellipse.fromJSON(objData);
                            break;
                        case 'Circle':
                            object = Circle.fromJSON(objData);
                            break;
                        case 'Triangle':
                            object = Triangle.fromJSON(objData);
                            break;
                        case 'EquilateralTriangle':
                            object = EquilateralTriangle.fromJSON(objData);
                            break;
                        case 'FocalPoint':
                            // Focal points already handled above
                            break;
                        case 'Target':
                            // Targets already handled above
                            break;
                        default:
                            console.warn(`Unknown object type: ${objData.type}`);
                    }

                    if (object) {
                        this.addObject(object, false);
                    }
                });
            }

            console.log('Scene imported successfully');
        }
    }
})