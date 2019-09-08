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
	render(/** @type {CanvasRenderingContext2D} */ graphics, /** @type {Link} */ link) {}
}

export class CompositeRenderer extends Renderer {
	constructor(/** @type {Renderer[]} */ renderers = []) {
		super()

		this.renderers = renderers
	}

	render(/** @type {CanvasRenderingContext2D} */ graphics, /** @type {Link} */ link) {
		for (const renderer of this.renderers) {
			renderer.render(graphics, link)
		}
	}
}

export class SpriteRenderer extends Renderer {
	constructor(spritePath, spriteX, spriteY, spriteWidth, spriteHeight, offsetX, offsetY) {
		this.spriteX = spriteX
		this.spriteY = spriteY
		this.spriteWidth = spriteWidth
		this.spriteHeight = spriteHeight
		this.offsetX = offsetX
		this.offsetY = offsetY

		// TODO: Refactor with some kind of "SpriteCentral".
		this.sprite = new Image()

		sprite.src = spritePath
	}

	render(/** @type {CanvasRenderingContext2D} */ graphics, /** @type {Link} */ link) {
		graphics.drawImage(
			this.sprite,
			this.spriteX,
			this.spriteY,
			this.spriteWidth,
			this.spriteHeight,
			this.offsetX,
			this.offsetY
		)
	}
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

	onStep(/** @type {Iterable<Link>} */ links) {
		this.graphics.clearRect(0, 0, this.graphics.canvas.width, this.graphics.canvas.height)

		super.onStep(links)
	}

	onSubStep(/** @type {{ Transform: Transform, Render: Render }} */ link) {
		const { Transform, Render } = link

		this.graphics.scale(this.devicePixelRatio, this.devicePixelRatio)
		this.graphics.translate(Transform.x, Transform.y)

		if (Render.followRotation) {
			this.graphics.rotate(Transform.a)
		}

		Render.renderer.render(this.graphics, link)

		this.graphics.setTransform(1, 0, 0, 1, 0, 0)
	}
}
