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
        this.lastValidPosition = null;

        // Bind event handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        // Add event listeners
        this.setupEventListeners()
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('mouseleave', this.handleMouseUp);

        // Make canvas interactive
        this.canvas.style.cursor = 'default';
    }

    /**
     * Get mouse position relative to canvas
     */
    getMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        }
    }

    /**
     * Handle mouse down event
     */
    handleMouseDown(event) {
        const mousePos = this.getMousePosition(event);

        // Try to select an object at the mouse position
        const clickedObject = this.sceneStore.findObjectAtPoint(mousePos.x, mousePos.y);

        if (clickedObject) {
            // Select the object
            this.sceneStore.selectObject(clickedObject.id);

            // Start dragging
            this.isDragging = true;
            this.draggedObjectId = clickedObject.id;

            // Calculate offset from object center to mouse position
            this.dragOffset = {
                x: mousePos.x - clickedObject.position.x,
                y: mousePos.y - clickedObject.position.y
            }

            // Store last valid position
            this.lastValidPosition = {
                x: clickedObject.position.x,
                y: clickedObject.position.y
            };

            this.canvas.style.cursor = 'grabbing';
        } else {
            // Clicked on empty space - deselect
            this.sceneStore.deselectObject();
        }
    }

    /**
     * Handle mouse move event
     */
    handleMouseMove(event) {
        const mousePos = this.getMousePosition(event);

        if (this.isDragging && this.draggedObjectId) {
            // Update object position while dragging
            const newX = mousePos.x - this.dragOffset.x;
            const newY = mousePos.y - this.dragOffset.y;

            // Try to update position with collision checking
            const success = this.sceneStore.updatePositionWithCollisionCheck(
                this.draggedObjectId,
                newX,
                newY,
            );

            if (success) {
                // Update was successful, store as last valid position
                this.lastValidPosition = { x: newX, y: newY };
            } else {
                // Collision detected, optionally provide visual feedback
                this.canvas.style.cursor = 'not-allowed';
            }

            // this.sceneStore.updateObject(this.draggedObjectId, {
            //     x: newX, y: newY
            // });
        } else {
            // Update hover state
            const hoveredObject = this.sceneStore.findObjectAtPoint(mousePos.x, mousePos.y);

            if (hoveredObject) {
                this.hoveredObjectId = hoveredObject.id;
                this.canvas.style.cursor = 'grab';
            } else {
                this.hoveredObjectId = null;
                this.canvas.style.cursor = 'default';
            }
        }
    }

    /**
     * Handle mouse up event
     */
    handleMouseUp(event) {
        if (this.isDragging) {
            this.isDragging = false;
            this.draggedObjectId = null;
            this.lastValidPosition = null;
            this.dragOffset = { x: 0, y: 0 };

            // Update cursor based on hover state
            const mousePos = this.getMousePosition(event);
            const hoveredObject = this.sceneStore.findObjectAtPoint(mousePos.x, mousePos.y);
            this.canvas.style.cursor = hoveredObject ? 'grab' : 'default';
        }
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
    }
}