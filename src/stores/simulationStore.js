/**
 * file: src/stores/simulationStore.js
 * desc: Manages the state of the ray-tracing simulation settings.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 20 October 2025
 */

import { defineStore } from 'pinia';

/**
 * Simulation store - manages ray-tracing simulation settings
 */
export const useSimulationStore = defineStore('simulation', {
    state: () => ({
        // Simulation settings
        maxBounces: 5,
        minIntensity: 0.01,

        // Rendering settings
        showRays: true,
        rayColor: '#00ff00',
        rayWidth: 1,

        // Performance
        isRunning: false
    }),

    actions: {
        /**
         * Update max bounces
         */
        setMaxBounces(value) {
            // use 20 as the default absolute max number of bounces
            this.maxBounces = Math.max(0, Math.min(20, Math.floor(value)));
        },

        /**
         * Update min intensity
         */
        setMinIntensity(value) {
            this.minIntensity = Math.max(0, Math.min(1, value));
        },

        /**
         * Toggle ray visibility
         */
        toggleRays() {
            this.showRays = !this.showRays;
        },

        /**
         * Set ray color
         */
        setRayColor(color) {
            this.rayColor = color;
        },

        /**
         * Set ray width
         */
        setRayWidth(value) {
            this.rayWidth = Math.max(0.5, Math.min(5, value));
        },

        /**
         * Start simulation
         */
        start() {
            this.isRunning = true;
        },

        /**
         * Stop simulation
         */
        stop() {
            this.isRunning = false;
        },

        /**
         * Toggle simulation
         */
        toggle() {
            this.isRunning = !this.isRunning;
        }
    }
});