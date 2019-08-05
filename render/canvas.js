import { Transform } from "../physic/mechanic.js"
import { MatchRoutine } from "../engine/routine.js"
import { Link } from "../engine/core.js"

export class Render {
	constructor(/** @type {Renderer} */ renderer, followRotation = true) {
		this.renderer = renderer
		this.followRotation = followRotation
	}
}

Render.FOLLOW_ROTATION = true
Render.IGNORE_ROTATION = false

export /** @ebstract */ class Renderer {
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
	constructor(/** @type {CanvasRenderingContext2D} */ graphics) {
		super([ Transform, Render ])

		this.graphics = graphics
	}

	onStep(/** @type {Link[]} */ links) {
		this.graphics.clearRect(0, 0, this.graphics.canvas.width, this.graphics.canvas.height)

		super.onStep(links)
	}

	/** @param {{ Transform: Transform, Render: Render }} */
	onSubStep({ Transform, Render }) {
		this.graphics.translate(Transform.x, Transform.y)

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

		this.graphics.resetTransform()
	}
}
