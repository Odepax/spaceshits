import { Vector } from "./math/vector.js"
import { MatchRoutine } from "./routine.js"
import { normalize, shortAngle, longAngle, leftAngle, rightAngle } from "./math/angle.js"

const { PI, abs, sign, min, cos, sin } = Math

export class Transform extends Vector {
	constructor(x = 0, y = 0, a = 0) {
		super(x, y)

		this.a = a
	}

	get a() { return /** @type {number} */ this._a }
	set a(/** @type {number} */ value) { this._a = normalize(value) }

	get copy() {
		return new Transform(
			this.x,
			this.y,
			this.a
		)
	}

	shortAngleTo(/** @type {Vector} */ target) {
		return shortAngle(this.a, this.directionTo(target))
	}

	longAngleTo(/** @type {Vector} */ target) {
		return longAngle(this.a, this.directionTo(target))
	}

	leftAngleTo(/** @type {Vector} */ target) {
		return leftAngle(this.a, this.directionTo(target))
	}

	rightAngleTo(/** @type {Vector} */ target) {
		return rightAngle(this.a, this.directionTo(target))
	}

	offset(/** @type {number} */ xOffset, /** @type {number} */ yOffset, base = this) {
		this.x = base.x + xOffset
		this.y = base.y + yOffset

		return this
	}

	relativeOffset(/** @type {number} */ xOffset, /** @type {number} */ yOffset, base = this) {
		this.x = base.x + cos(base.a) * xOffset - sin(base.a) * yOffset
		this.y = base.y + sin(base.a) * xOffset + cos(base.a) * yOffset

		return this
	}

	angularOffset(/** @type {number} */ direction, /** @type {number} */ length, base = this) {
		this.x = base.x + cos(direction) * length
		this.y = base.y + sin(direction) * length

		return this
	}

	relativeAngularOffset(/** @type {number} */ direction, /** @type {number} */ length, base = this) {
		this.x = base.x + cos(base.a + direction) * length
		this.y = base.y + sin(base.a + direction) * length

		return this
	}
}

export class Force extends Vector {
	constructor(x = 0, y = 0, a = 0) {
		super(x, y)

		this.a = a
	}

	drive(/** @type {{ x: number, y: number, a: number }} */ subject, /** @type {number} */ secondsPerFrame) {
		subject.x += this.x * secondsPerFrame
		subject.y += this.y * secondsPerFrame
		subject.a += this.a * secondsPerFrame
	}
}

export class Friction {
	constructor(movementResistanceFactor = 0.05, rotationResistanceFactor = 2 * PI) {
		this.movementResistanceFactor = movementResistanceFactor
		this.rotationResistanceFactor = rotationResistanceFactor
	}

	applyTo(/** @type {Force} */ subject, /** @type {number} */ secondsPerFrame) {
		subject.x = abs(subject.x) < 0.001 ? 0 : subject.x - sign(subject.x) * min(abs(this.movementResistanceFactor * subject.x * subject.x), abs(subject.x)) * secondsPerFrame
		subject.y = abs(subject.y) < 0.001 ? 0 : subject.y - sign(subject.y) * min(abs(this.movementResistanceFactor * subject.y * subject.y), abs(subject.y)) * secondsPerFrame
		subject.a = abs(subject.a) < 0.001 ? 0 : subject.a - sign(subject.a) * min(abs(this.rotationResistanceFactor * subject.a * subject.a), abs(subject.a)) * secondsPerFrame
	}
}

export class Velocity extends Force {
	static angular(/** @type {number} */ direction, /** @type {number} */ length) {
		return new Velocity(
			cos(direction) * length,
			sin(direction) * length
		)
	}
}

export class Acceleration extends Force {
	static angular(/** @type {number} */ direction, /** @type {number} */ length) {
		return new Acceleration(
			cos(direction) * length,
			sin(direction) * length
		)
	}
}

export class BounceOnEdges {
	constructor(speedFactorAfterBounce = 1) {
		this.speedFactorAfterBounce = speedFactorAfterBounce
	}
}

export class DynamicRoutine extends MatchRoutine {
	constructor(/** @type {import("./engine.js").Clock} */ clock, /** @type {number} */ canvasWidth, /** @type {number} */ canvasHeight) {
		super([ Transform, Velocity ])

		this.clock = clock
		this.canvasWidth = canvasWidth
		this.canvasHeight = canvasHeight
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
			} else if (this.canvasHeight < Transform.y) {
				Transform.y = this.canvasHeight
				Velocity.y *= -BounceOnEdges.speedFactorAfterBounce
			}

			if (Transform.x < 0) {
				Transform.x = 0
				Velocity.x *= -BounceOnEdges.speedFactorAfterBounce
			} else if (this.canvasWidth < Transform.x) {
				Transform.x = this.canvasWidth
				Velocity.x *= -BounceOnEdges.speedFactorAfterBounce
			}
		}
	}
}
