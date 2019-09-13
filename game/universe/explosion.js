import { Ephemeral } from "../ephemeral.js"
import { Renderer, Render, CompositeRenderer } from "../render.js"
import { Link, Universe } from "../engine.js"
import { Transform } from "../dynamic.js"
import { ParticleCloud, ParticleCloudRenderer } from "./particle.js"
import { silver } from "../../asset/style/color.js"
import { MatchRoutine } from "../routine.js"

const { max, log2, log10, PI } = Math

export class Explosion extends Link {
	constructor(
		/** @type {Transform} */ transform,
		/** @type {import("../../asset/style/color.js").Color[]} */ particleColors,
		radius = 10,
		ttl = 0.5
	) {
		const particleCount = radius / 2
		const minRadius = max(2, 1 + log10(radius))
		const maxRadius = max(2, 1 + log2(radius))
		const minSpeed = 40 + radius / ttl
		const maxSpeed = minSpeed * 3

		super([
			transform,
			new Ephemeral(ttl),
			new Blast(particleColors[0], radius),
			new ParticleCloud(particleColors, particleCount, minRadius, maxRadius, minSpeed, maxSpeed),
			new Render(
				new CompositeRenderer([
					new BlastRenderer(),
					new ParticleCloudRenderer()
				]),
				Render.IGNORE_ROTATION
			)
		])
	}
}

export class Blast {
	constructor(
		color = silver,
		radius = 10
	) {
		this.color = color
		this.radius = radius
	}
}

export class BlastRenderer extends Renderer {
	render(
		/** @type {CanvasRenderingContext2D} */ graphics,
		/** @type {{ Ephemeral: Ephemeral, Blast: Blast }} */ { Ephemeral, Blast }
	) {
		graphics.globalCompositeOperation = "screen"
						
		graphics.beginPath()
		graphics.arc(0, 0, Blast.radius * Ephemeral.progress, 0, 2 * PI)

		graphics.lineWidth = 4 * Ephemeral.decline
		graphics.strokeStyle = Blast.color
		graphics.stroke()

		graphics.globalCompositeOperation = "source-over"
	}
}

export class ExplosionOnAdd {
	constructor(
		/** @type {import("../../asset/style/color.js").Color[]} */ particleColors, /** @type {number} */ radius, /** @type {number} */ ttl) {
		this.particleColors = particleColors
		this.radius = radius
		this.ttl = ttl
	}
}

export class ExplosionOnAddRoutine extends MatchRoutine {
	constructor(/** @type {Universe} */ universe) {
		super([ Transform, ExplosionOnAdd ])

		this.universe = universe
	}

	/** @param {{ Transform: Transform, ExplosionOnAdd: ExplosionOnAdd }} */
	onAdd({ Transform, ExplosionOnAdd }) {
		this.universe.add(new Explosion(
			Transform.copy,
			ExplosionOnAdd.particleColors,
			ExplosionOnAdd.radius,
			ExplosionOnAdd.ttl
		))
	}
}

export class ExplosionOnRemove {
	constructor(
		/** @type {import("../../asset/style/color.js").Color[]} */ particleColors, /** @type {number} */ radius, /** @type {number} */ ttl) {
		this.particleColors = particleColors
		this.radius = radius
		this.ttl = ttl
	}
}

export class ExplosionOnRemoveRoutine extends MatchRoutine {
	constructor(/** @type {Universe} */ universe) {
		super([ Transform, ExplosionOnRemove ])

		this.universe = universe
	}

	/** @param {{ Transform: Transform, ExplosionOnRemove: ExplosionOnRemove }} */
	onRemove({ Transform, ExplosionOnRemove }) {
		this.universe.add(new Explosion(
			Transform,
			ExplosionOnRemove.particleColors,
			ExplosionOnRemove.radius,
			ExplosionOnRemove.ttl
		))
	}
}
