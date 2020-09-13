import { Link } from "../core/engine.js"
import { Motion } from "../physic/motion.js"
import { Colors } from "./assets/colors.js"
import { Universe } from "../core/engine.js"
import { UserInputRegistry } from "../ux/user-input-capture.js"
import { VfxRegistry, OnAddExplosion, OnRemoveExplosion, AuraFx } from "./vfx.js"
import { Random } from "../math/random.js"
import { Ratio } from "../math/ratio.js"

export class Render {
	/** @param {Sprite[]} sprites */
	constructor(...sprites) {
		this.sprites = sprites

		/** @type {string} */
		this.colorizationColor = null
		this.colorizationFactor = 0
	}
}

export class Sprite {
	/** @param {number} left @param {number} top @param {number} width @param {number} height @param {number} offsetX @param {number} offsetY */
	constructor(left, top, width, height, offsetX, offsetY, followsRotation = true) {
		this.left = left
		this.top = top
		this.width = width
		this.height = height
		this.offsetX = -offsetX
		this.offsetY = -offsetY
		this.followsRotation = followsRotation
	}
}

/** @implements {import("../core/engine").Routine} */
export class RenderRoutine {
	/** @param {HTMLCanvasElement} canvas @param {ImageBitmap} spriteSource @param {Universe} universe @param {UserInputRegistry} userInput @param {VfxRegistry} vfx */
	constructor(canvas, spriteSource, universe, userInput, vfx) {
		const { width: originalWidth, height: originalHeight } = canvas.getBoundingClientRect()

		canvas.width = originalWidth * window.devicePixelRatio
		canvas.height = originalHeight * window.devicePixelRatio

		canvas.style.width = originalWidth + "px"
		canvas.style.height = originalHeight + "px"

		this.graphics = canvas.getContext("2d")
		this.offscreen = new OffscreenCanvas(128 * window.devicePixelRatio, 128 * window.devicePixelRatio).getContext("2d")
		this.spriteSource = spriteSource
		this.universe = universe
		this.userInput = userInput
		this.vfx = vfx

		// setTransform(ScaleX, SkewX, SkewY, ScaleY, TranslateX, TranslateY)
		this.offscreen.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0)

		/** @private @type {Set<Link>} */
		this.objects = new Set()

		/** @private @type {Set<Link>} */
		this.auras = new Set()
	}

	/** @param {Link} link */
	onAdd(link) {
		if (link.has(Motion)) {
			link.has(Render) && this.objects.add(link)
			link.has(AuraFx) && this.auras.add(link)

			if (link.has(OnAddExplosion)) {
				const [{ ttl, colors, radius }, { position: { x, y } }] = link.get(OnAddExplosion, Motion)

				this.vfx.spawnExplosion(x, y, ttl, colors, radius)
			}
		}
	}

	/** @param {Link} link */
	onRemove(link) {
		this.objects.delete(link)
		this.auras.delete(link)

		if (link.has(OnRemoveExplosion, Motion)) {
			const [{ ttl, colors, radius }, { position: { x, y } }] = link.get(OnRemoveExplosion, Motion)

			this.vfx.spawnExplosion(x, y, ttl, colors, radius)
		}
	}

	onStep() {
		this.clearCanvas()
		this.renderDebugText()
		this.renderSprites()
		this.renderVfx()
	}

	/** @private */
	clearCanvas() {
		// setTransform(ScaleX, SkewX, SkewY, ScaleY, TranslateX, TranslateY)
		this.graphics.setTransform(1, 0, 0, 1, 0, 0)
		this.graphics.clearRect(0, 0, this.graphics.canvas.width, this.graphics.canvas.height)
	}

	/** @private */
	renderDebugText() {
		this.graphics.font = "16px \"Alte DIN 1451 Mittelschrift\""
		this.graphics.fillStyle = Colors.white

		let lineOffset = 0
		this.graphics.fillText(~~(1 / this.universe.clock.spf) + " FPS", 50, 30 + 20 * ++lineOffset)
		this.graphics.fillText(this.userInput.mousePosition.x + ", " + this.userInput.mousePosition.y, 50, 30 + 20 * ++lineOffset)
		this.graphics.fillText(Array.from(this.userInput.currentlyPressedKeys).join(", "), 50, 30 + 20 * ++lineOffset)
	}

	/** @private */
	renderSprites() {
		for (const link of this.objects) {
			const [ motion, render ] = link.get(Motion, Render)

			// setTransform(ScaleX, SkewX, SkewY, ScaleY, TranslateX, TranslateY)
			this.graphics.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, motion.position.x * window.devicePixelRatio, motion.position.y * window.devicePixelRatio)

			let isRotated = false

			for (const sprite of render.sprites) {
				const rotationFactor = sprite.followsRotation - isRotated

				if (rotationFactor != 0) {
					this.graphics.rotate(motion.position.a * rotationFactor)

					isRotated = !isRotated
				}

				if (render.colorizationColor && 0.1 < render.colorizationFactor) {
					this.offscreen.clearRect(0, 0, sprite.width, sprite.height)

					this.offscreen.globalCompositeOperation = "source-over"
					this.offscreen.drawImage(
						this.spriteSource,
						sprite.left * window.devicePixelRatio,
						sprite.top * window.devicePixelRatio,
						sprite.width * window.devicePixelRatio,
						sprite.height * window.devicePixelRatio,
						0,
						0,
						sprite.width,
						sprite.height
					)

					this.offscreen.globalCompositeOperation = "color"
					this.offscreen.globalAlpha = render.colorizationFactor
					this.offscreen.fillStyle = render.colorizationColor
					this.offscreen.fillRect(0, 0, sprite.width, sprite.height)
					this.offscreen.globalAlpha = 1

					this.offscreen.globalCompositeOperation = "destination-atop"
					this.offscreen.drawImage(
						this.spriteSource,
						sprite.left * window.devicePixelRatio,
						sprite.top * window.devicePixelRatio,
						sprite.width * window.devicePixelRatio,
						sprite.height * window.devicePixelRatio,
						0,
						0,
						sprite.width,
						sprite.height
					)

					this.graphics.drawImage(
						this.offscreen.canvas,
						0,
						0,
						sprite.width * window.devicePixelRatio,
						sprite.height * window.devicePixelRatio,
						sprite.offsetX,
						sprite.offsetY,
						sprite.width,
						sprite.height
					)
				}

				else
					this.graphics.drawImage(
						this.spriteSource,
						sprite.left * window.devicePixelRatio,
						sprite.top * window.devicePixelRatio,
						sprite.width * window.devicePixelRatio,
						sprite.height * window.devicePixelRatio,
						sprite.offsetX,
						sprite.offsetY,
						sprite.width,
						sprite.height
					)
			}
		}
	}

	/** @private */
	renderVfx() {
		// setTransform(ScaleX, SkewX, SkewY, ScaleY, TranslateX, TranslateY)
		this.graphics.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0)
		this.graphics.globalCompositeOperation = "screen"

		const { time, spf } = this.universe.clock

		for (const link of this.auras) {
			const [ motion, aura ] = link.get(Motion, AuraFx)

			const { x, y } = motion.position
			const { color, opacityFactor, radius } = aura

			this.graphics.beginPath()
			this.graphics.arc(x, y, radius, 0, 2 * Math.PI)

			this.graphics.globalAlpha = opacityFactor / 6
			this.graphics.fillStyle = color
			this.graphics.fill()

			this.graphics.globalAlpha = opacityFactor
			this.graphics.strokeStyle = color
			this.graphics.lineWidth = 2
			this.graphics.stroke()
			this.graphics.globalAlpha = 1
		}

		for (const particle of this.vfx.particles) {
			if (particle.deathTime < time)
				this.vfx.particles.delete(particle)

			else {
				let { x, y, vd, vl, spawnTime, deathTime, color, radius } = particle

				const decline = Ratio.declineBetween(time, spawnTime, deathTime)

				vl = vl * decline // "Friction"...

				particle.vd = vd += Random.between(-Math.PI / 8, Math.PI / 8)
				particle.x = x += Math.cos(vd) * vl * spf
				particle.y = y += Math.sin(vd) * vl * spf

				this.graphics.beginPath()
				this.graphics.arc(x, y, radius * decline, 0, 2 * Math.PI)
				this.graphics.fillStyle = color
				this.graphics.fill()
			}
		}

		for (const blast of this.vfx.blasts) {
			if (blast.deathTime < time)
				this.vfx.blasts.delete(blast)

			else {
				const { x, y, spawnTime, deathTime, color, radius } = blast

				const decline = Ratio.declineBetween(time, spawnTime, deathTime)
				const progress = 1 - decline

				this.graphics.beginPath()
				this.graphics.arc(x, y, radius * progress, 0, 2 * Math.PI)
				this.graphics.lineWidth = 4 * decline
				this.graphics.strokeStyle = color
				this.graphics.stroke()
			}
		}

		this.graphics.globalCompositeOperation = "source-over"
	}
}
