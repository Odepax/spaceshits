import { MatchRoutine } from "./routine.js"
import { Transform } from "./dynamic.js"
import { Link } from "./engine.js"

export class Render {
	constructor(/** @type {Renderer} */ renderer, followRotation = true) {
		this.renderer = renderer
		this.followRotation = followRotation
	}
}

Render.FOLLOW_ROTATION = true
Render.IGNORE_ROTATION = false

export /** @abstract */ class Renderer {
}

export class SpriteRenderer extends Renderer {
	constructor(spritePath, spriteX, spriteY, spriteWidth, spriteHeight, offsetX, offsetY) {
		this.spritePath = spritePath
		this.spriteX = spriteX
		this.spriteY = spriteY
		this.spriteWidth = spriteWidth
		this.spriteHeight = spriteHeight
		this.offsetX = offsetX
		this.offsetY = offsetY
	}
}

export /** @abstract */ class CustomRenderer extends Renderer {
	render(/** @type {CanvasRenderingContext2D} */ graphics) {}
}

export class RenderRoutine extends MatchRoutine {
	constructor(/** @type {HTMLCanvasElement} */ canvas) {
		super([ Transform, Render ])

		/** @private */ this.devicePixelRatio = window.devicePixelRatio || 1

		this.graphics = canvas.getContext("2d")

		const { width: w, height: h } = canvas.getBoundingClientRect()

		canvas.width = w * this.devicePixelRatio
		canvas.height = h * this.devicePixelRatio

		canvas.style.width = w + "px";
		canvas.style.height = h + "px";
	}

	onStep(/** @type {Link[]} */ links) {
		this.graphics.clearRect(0, 0, this.graphics.canvas.width, this.graphics.canvas.height)

		super.onStep(links)
	}

	/** @param {{ Transform: Transform, Render: Render }} */
	onSubStep({ Transform, Render }) {
		this.graphics.translate(Transform.x, Transform.y)
		this.graphics.scale(this.devicePixelRatio, this.devicePixelRatio)

		if (Render.followRotation) {
			this.graphics.rotate(Transform.a)
		}

		const { renderer } = Render

		if (renderer instanceof CustomRenderer) {
			renderer.render(this.graphics)
		} else if (renderer instanceof SpriteRenderer) {
			const { spritePath, spriteX, spriteY, spriteWidth, spriteHeight, offsetX, offsetY } = renderer

			const sprite = new Image()

			sprite.src = spritePath

			this.graphics.drawImage(sprite, spriteX, spriteY, spriteWidth, spriteHeight, offsetX, offsetY)
		}

		this.graphics.setTransform(1, 0, 0, 1, 0, 0)
	}
}
