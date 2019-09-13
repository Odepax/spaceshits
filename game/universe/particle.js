import { Vector } from "../math/vector.js"
import { angle, within, oneOf } from "../math/random.js"
import { Ephemeral } from "../ephemeral.js"
import { MatchSubRoutine } from "../routine.js"
import { Renderer } from "../render.js"
import { light, silver } from "../../asset/style/color.js"

const { PI } = Math

export class ParticleCloud {
	constructor(
		particleColors = [ light, silver ],
		particleCount = 5,
		minRadius = 2,
		maxRadius = 5,
		minSpeed = 50,
		maxSpeed = 100
	) {
		/** @type {{ position: Vector, movement: Vector, radius: number, color: import("../../asset/style/color.js").Color }[]} */
		this.particles = []

		for (let i = 0; i < particleCount; ++i) {
			this.particles.push({
				position: new Vector(),
				movement: Vector.angular(angle(), within(minSpeed, maxSpeed)),
				radius: within(minRadius, maxRadius),
				color: oneOf(particleColors)
			})
		}
	}
}

export class ParticleCloudRenderer extends Renderer {
	render(
		/** @type {CanvasRenderingContext2D} */ graphics,
		/** @type {{ Ephemeral: Ephemeral, ParticleCloud: ParticleCloud }} */ { Ephemeral, ParticleCloud }
	) {
		graphics.globalCompositeOperation = "screen"
						
		for (const { position, radius, color } of ParticleCloud.particles) {
			graphics.beginPath()
			graphics.arc(position.x, position.y, radius * Ephemeral.decline, 0, 2 * PI)

			graphics.fillStyle = color
			graphics.fill()
		}

		graphics.globalCompositeOperation = "source-over"
	}
}

export class ParticleCloudRoutine extends MatchSubRoutine {
	constructor(/** @type {import("./game/engine.js").Clock} */ clock) {
		super([ ParticleCloud, Ephemeral ])

		this.clock = clock
	}

	/** @param {{ ParticleCloud: ParticleCloud, Ephemeral: Ephemeral }} */
	onSubStep({ ParticleCloud, Ephemeral }) {
		for (const { position, movement } of ParticleCloud.particles) {
			movement.l *= 0.98 // TODO: Add support for time scaling.
			movement.d += within(-0.4, +0.4)

			position.x += movement.x * this.clock.spf
			position.y += movement.y * this.clock.spf
		}
	}
}
