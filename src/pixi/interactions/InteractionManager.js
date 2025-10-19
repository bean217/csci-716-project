/**
 * file: src/pixi/interactions/InteractionManager.js
 * desc: Defines UI interactions with simulation objects.
 * auth: Benjamin Piro (brp8396@rit.edu)
 * date: 19 October 2025
 */

/**
 * InteractionManager - Handles all canvas interactions
 */
export default class InteractionManager {
    constructor(app, sceneStore) {
        this.app = app;
        this.sceneStore = sceneStore;
        this.canvas = app.canvas;

        // Interaction state
        this.isDragging = false;
        this.draggedObjectId = null;
        this.dragOffset = { x: 0, y: 0 };
        this.hoveredObjectId = null;

        // Bind event handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        // Add event listeners
        this.setupEventListeners()
    }
}