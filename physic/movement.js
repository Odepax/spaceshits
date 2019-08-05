import { Clock } from "../engine/core.js";
import { Transform, Force, Friction } from "./mecanic.js";
import { MatchRoutine } from "../engine/routine.js";

export class Velocity extends Force {
	static linear(/** @type {number} */ speedX, /** @type {number} */ speedY) {
		return new Velocity(speedX, speedY)
	}

	static angular(/** @type {number} */ angle, /** @type {number} */ speed) {
		return new Velocity(cos(angle) * speed, sin(angle) * speed)
	}
}

export class Acceleration extends Force {
	static linear(/** @type {number} */ speedX, /** @type {number} */ speedY) {
		return new Acceleration(speedX, speedY)
	}

	static angular(/** @type {number} */ angle, /** @type {number} */ speed) {
		return new Acceleration(cos(angle) * speed, sin(angle) * speed)
	}
}

export class BounceOnEdges {
	constructor(speedFactorAfterBounce = 1) {
		this.speedFactorAfterBounce = speedFactorAfterBounce
	}
}

export class MovementRoutine extends MatchRoutine {
	constructor(/** @type {Clock} */ clock, /** @type {{ width: number, height: number }} */ canvas) {
		super([ Transform, Velocity ])

		this.clock = clock
		this.canvas = canvas
	}

	/** @param {{ Transform: Transform, Velocity: Velocity, Acceleration: Acceleration , Friction: Friction, BounceOnEdges : BounceOnEdges }} */
	onSubStep({ Transform, Velocity, Acceleration = null, Friction = null, BounceOnEdges = null }) {
		if (Acceleration) {
			Acceleration.drive(Velocity, this.clock.spf)
		}

		if (Friction) {
			Friction.applyTo(Velocity, this.clock.spf)
		}

		Velocity.drive(Transform, this.clock.spf)

		if (BounceOnEdges) {
			if (Transform.y < 0) {
				Transform.y = 0
				Velocity.y *= -BounceOnEdges.speedFactorAfterBounce
			} else if (this.canvas.height < Transform.y) {
				Transform.y = this.canvas.height
				Velocity.y *= -BounceOnEdges.speedFactorAfterBounce
			}

			if (Transform.x < 0) {
				Transform.x = 0
				Velocity.x *= -BounceOnEdges.speedFactorAfterBounce
			} else if (this.canvas.width < Transform.x) {
				Transform.x = this.canvas.width
				Velocity.x *= -BounceOnEdges.speedFactorAfterBounce
			}
		}
	}
}
