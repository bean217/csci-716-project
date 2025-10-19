/**
 * file: src/stores/sceneStore.js
 * desc: Manages the state of the visible scene.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 17 October 2025
 */

import { defineStore } from 'pinia';
import Rectangle from '@/geometry/Rectangle.js';
import Square from '@/geometry/Square.js';

/**
 * Scene store manages all geometric objects in the scene
 */
export const useSceneStore = defineStore('scene', {
    state: () => ({
        // All geometric objects in the scene
        objects: [],

        // Currently selected objectID
        selectedObjectId: null,

        // focalPoint (light source/camera)
        focalPoint: null,

        // Target objects for ray tracing
        targets: []
    }),

    getters: {
        // Get the currently selected object
        selectedObject: (state) => {
            if (!state.selectedObjectId) return null;
            return state.objects.find(obj => obj.id === state.selectedObjectId) || null;
        },

        // Get object by ID
        getObjectById: (state) => {
            return (id) => state.objects.find(obj => obj.id === id) || null;
        },

        // Get objects by type
        getObjectsByType: (state) => {
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

            // Check for duplicate IDs
            if (this.objects.find(obj => obj.id === object.id)) {
                console.warn(`Object with id ${object.id} already exists`);
                return
            }

            this.objects.push(object)

            if (select) {
                this.selectedObjectId = object.id;
            }

            console.log(`Added ${object.type} with id ${object.id}`);
        },

        /**
         * Remove an object from the scene
         */
        removeObject(id) {
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
            if (id === null) {
                this.selectedObjectId = null;
                return;
            }

            const object = this.objects.find(obj => obj.id === id);

            if (!object) {
                console.warn(`Object with id ${id} not found`);
                return;
            }

            this.selectedObjectId = id;
            console.log(`Selected ${object.type} with id ${id}`);
        },

        /**
         * Deselect the current object
         */
        deselectObject() {
            this.selectedObjectId = null;
        },

        /**
         * Update properties of an object
         * @param {string} id - ID of the object to update
         * @param {Object} updates - Object containing properties to update
         */
        updateObject(id, updates) {
            const object = this.objects.find(obj => obj.id === id);

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
            }

            // Trigger reactivity by creating a new array reference
            // This ensures Vue/PixiJS watchers detect the change
            this.objects = [...this.objects]
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
            // Search from end to start (topmost objects first)
            for (let i = this.objects.length - 1; i >= 0; i--) {
                if (this.objects[i].containsPoint(x, y)) {
                    return this.objects[i];
                }
            }
            return null;
        },

        /**
         * Export scene to JSON
         */
        exportScene() {
            return {
                objects: this.objects.map(obj => obj.toJSON()),
                focalPoint: this.focalPoint ? this.focalPoint.toJSON() : null,
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

            // TODO: Implement proper factory pattern for reconstructing different shape types
            // For now, we'll just handle rectangles and squares
            if (json.objects) {
                json.objects.forEach(objData => {
                    let object
                    if (objData.type === 'Rectangle') {
                        object = Rectangle.fromJSON(objData)
                    } else if (objData.type === 'Square') {
                        object = Square.fromJSON(objData)
                    }
                    // Add more shape types as they are implemented

                    if (object) {
                        this.addObject(object, false)
                    }
                })
            }
        }
    }
})