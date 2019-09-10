import { Transform, Velocity } from "./dynamic.js"
import { MatchSubRoutine } from "./routine.js"

const { sqrt, abs, sign, cos, sin } = Math

export class TargetChasing {
	constructor(/** @type {{ Transform: Transform }} */ target, /** @type {number} */ maxSpeed) {
		this.target = target
		this.maxSpeed = maxSpeed
	}
}

export class TargetFacing {
	constructor(/** @type {{ Transform: Transform }} */ target, instant = TargetFacing.INSTANT, maxSpeed = 0) {
		this.target = target
		this.instant = instant
		this.maxSpeed = maxSpeed
	}
}

/** @typedef {boolean} TargetFacing.Instantness */

/** @type {TargetFacing.Instantness} */ TargetFacing.INSTANT = true
/** @type {TargetFacing.Instantness} */ TargetFacing.SMOOTH = false

export class ForwardChasing {
	constructor(/** @type {number} */ maxSpeed) {
		this.maxSpeed = maxSpeed
	}
}

export class TargetChasingRoutine extends MatchSubRoutine {
	constructor(/** @type {import("../engine/engine.js/index.js").Clock} */ clock) {
		super([ TargetChasing, Transform, Velocity ])

		this.clock = clock
	}

	/** @param {{ TargetChasing: TargetChasing, Transform: Transform, Velocity: Velocity }} */
	onSubStep({ TargetChasing, Transform, Velocity }) {
		Velocity.x = TargetChasing.target.Transform.x - Transform.x
		Velocity.y = TargetChasing.target.Transform.y - Transform.y

		const targetDistance = sqrt(Velocity.x * Velocity.x + Velocity.y * Velocity.y)

		if (targetDistance < 0.1) {
			Velocity.x = 0
			Velocity.y = 0
		} else if (targetDistance < TargetChasing.maxSpeed * this.clock.spf) {
			Velocity.x = 0
			Velocity.y = 0

			Transform.angularOffset(Transform.directionTo(TargetChasing.target.Transform), 0.8 * targetDistance)
		} else {
			Velocity.x *= TargetChasing.maxSpeed / targetDistance
			Velocity.y *= TargetChasing.maxSpeed / targetDistance
		}
	}
}

export class TargetFacingRoutine extends MatchSubRoutine {
	constructor(/** @type {import("./engine.js").Clock} */ clock) {
		super([ TargetFacing, Transform ])

		this.clock = clock
	}

	/** @param {{ TargetFacing: TargetFacing, Transform: Transform, Velocity: Velocity }} */
	onSubStep({ TargetFacing, Transform, Velocity = null }) {
		if (TargetFacing.instant) {
			Transform.a = Transform.directionTo(TargetFacing.target.Transform)
		} else if (Velocity) {
			const directionAngle = Transform.shortAngleTo(TargetFacing.target.Transform)

			if (abs(directionAngle) < TargetFacing.maxSpeed * this.clock.spf) {
				Velocity.a = 0
				Transform.a += directionAngle
			} else {
				Velocity.a = sign(directionAngle) * TargetFacing.maxSpeed
			}
		}
	}
}

export class ForwardChasingRoutine extends MatchSubRoutine {
	constructor(/** @type {import("./engine.js").Clock} */ clock) {
		super([ ForwardChasing, Transform, Velocity ])

		this.clock = clock
	}

	/** @param {{ ForwardChasing: ForwardChasing, Transform: Transform, Velocity: Velocity }} */
	onSubStep({ ForwardChasing, Transform, Velocity }) {
		Velocity.x = cos(Transform.a) * ForwardChasing.maxSpeed
		Velocity.y = sin(Transform.a) * ForwardChasing.maxSpeed
	}
}
