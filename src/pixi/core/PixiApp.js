import * as PIXI from 'pixi.js'

export default class PixiApp {
    constructor(container) {
        this.container = container

        // Create PIXI Application
        this.app = new PIXI.Application({
            width: container.clientWidth,
            height: container.clientHeight,
            backgroundColor: 0x1a1a1a,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        })

        // Append canvas to container
        container.appendChild(this.app.view)

        // Handle window resize
        this.handleResize = this.handleResize.bind(this)
        window.addEventListener('resize', this.handleResize)

        // Add a simple text to verify PixiJS is working
        this.addWelcomeText()
    }

    addWelcomeText() {
        const text = new PIXI.Text('PixiJS Canvas Ready', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
            align: 'center'
        })

        text.anchor.set(0.5)
        text.x = this.app.screen.width / 2
        text.y = this.app.screen.height / 2

        this.app.stage.addChild(text)
    }

    handleResize() {
        if (this.container) {
            this.app.renderer.resize(
                this.container.clientWidth,
                this.container.clientHeight
            )
        }
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize)
        this.app.destroy(true, {children: true, texture: true})
    }
}