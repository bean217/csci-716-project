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



    }
})