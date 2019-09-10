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

/** @type{Map<string, ImageBitmap>} */ const bitmaps = new Map()

export class SpriteRenderer extends Renderer {
	constructor(spritePath, spriteX, spriteY, spriteWidth, spriteHeight, offsetX, offsetY) {
		super()

		this.spriteX = spriteX
		this.spriteY = spriteY
		this.spriteWidth = spriteWidth
		this.spriteHeight = spriteHeight
		this.offsetX = -offsetX
		this.offsetY = -offsetY

		this.devicePixelRatio = 1.5 * (window.devicePixelRatio || 1)
		this.sprite = bitmaps.get(spritePath)

		if (!this.sprite) {
			const image = new Image()

			image.src = spritePath

			image.decode()
				.then(() => createImageBitmap(image, {
					resizeWidth: image.width * this.devicePixelRatio,
					resizeHeight: image.height * this.devicePixelRatio
				}))
				.then(bitmap => {
					this.sprite = bitmap

					bitmaps.set(spritePath, this.sprite)
				})
		}
	}

	render(/** @type {CanvasRenderingContext2D} */ graphics, /** @type {Link} */ link) {
		if (this.sprite) {
			graphics.drawImage(
				this.sprite,
				this.spriteX * this.devicePixelRatio,
				this.spriteY * this.devicePixelRatio,
				this.spriteWidth * this.devicePixelRatio,
				this.spriteHeight * this.devicePixelRatio,
				this.offsetX,
				this.offsetY,
				this.spriteWidth,
				this.spriteHeight
			)
		}
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
