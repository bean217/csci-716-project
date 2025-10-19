import * as PIXI from 'pixi.js'
import GeometryRenderer from "../renderers/GeometryRenderer.js";

export default class PixiApp {
    constructor(container, sceneStore = null) {
        this.container = container
        this.app = null;
        this.sceneStore = sceneStore;
        this.geometryRenderer = null;
    }

    async init(container) {
        // Create PIXI Application (async in PixiJS 7+)
        this.app = new PIXI.Application()

        await this.app.init({
            width: container.clientWidth,
            height: container.clientHeight,
            backgroundColor: 0x1a1a1a,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        })

        // Append canvas to container
        container.appendChild(this.app.canvas)

        // Handle window resize
        this.handleResize = this.handleResize.bind(this)
        window.addEventListener('resize', this.handleResize)

        // Initialize geometry renderer if store is provided
        if (this.sceneStore) {
            this.geometryRenderer = new GeometryRenderer(this.app, this.sceneStore);
        }
    }

    handleResize() {
        if (this.container) {
            this.app.renderer.resize(
                this.container.clientWidth,
                this.container.clientHeight
            );
        }
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize);

        if (this.geometryRenderer) {
            this.geometryRenderer.destroy();
        }

        if (this.app) {
            this.app.destroy(true, { children: true, texture: true });
        }
    }
}
