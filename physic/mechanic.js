import { clamp, optimalAngleBetween } from "../math/angle.js"

const { PI, sqrt, abs, sign, min, cos, sin, atan2 } = Math

export class Transform {
	static duplicate() {
		return new Transform(this.x, this.y, this.a)
	}

	constructor(x = 0, y = 0, a = 0) {
		/** @type {number} */ this.x = x
		/** @type {number} */ this.y = y
		this.a = a
	}

	get a() { return /** @type {number} */ this._a }
	set a(/** @type {number} */ value) { this._a = clamp(value) }

	distanceToward(/** @type {Transform} */ target) {
		const x = this.x - target.x
		const y = this.y - target.y

		return sqrt(x * x + y * y)
	}

	angleToward(/** @type {Transform} */ target) {
		return atan2(target.y - this.y, target.x - this.x)
	}

	optimalAngleToward(/** @type {Transform} */ target) {
		return optimalAngleBetween(this.a, this.angleToward(target))
	}

	leftAngleToward(/** @type {Transform} */ target) {
		const distance = this.optimalAngleToward(target)

		return distance > 0 ? distance - 2 * PI : distance
	}

	rightAngleToward(/** @type {Transform} */ target) {
		const distance = this.optimalAngleToward(target)

		return distance < 0 ? distance + 2 * PI : distance
	}

	offset(/** @type {number} */ offsetX, /** @type {number} */ offsetY, base = this) {
		this.x = base.x + offsetX
		this.y = base.y + offsetY

		return this
	}

	relativeOffset(/** @type {number} */ offsetX, /** @type {number} */ offsetY, base = this) {
		this.x = base.x + cos(base.a) * offsetX - sin(base.a) * offsetY
		this.y = base.y + sin(base.a) * offsetX + cos(base.a) * offsetY

		return this
	}

	angularOffset(/** @type {number} */ angle, /** @type {number} */ distance, base = this) {
		this.x = base.x + cos(angle) * distance
		this.y = base.y + sin(angle) * distance

		return this
	}

	relativeAngularOffset(/** @type {number} */ angle, /** @type {number} */ distance, base = this) {
		this.x = base.x + cos(base.a + angle) * distance
		this.y = base.y + sin(base.a + angle) * distance

		return this
	}

	constrainAngleIn(/** @type {number} */ leftBound, /** @type {number} */ rightBound) {
		const arcSize = Angle.rightAngleBetween(leftBound, rightBound)
		const relativeAngle = Angle.rightAngleBetween(leftBound, this.a)

		if (relativeAngle > arcSize) {
			const distancetoLeftBound = 2 * PI - relativeAngle
			const distanceToRightBound = abs(this.optimalAngleTo(rightBound))

			this.a = distancetoLeftBound < distanceToRightBound ? leftBound : rightBound
		}

		return this
	}
}

export class Force {
	constructor(x = 0, y = 0, a = 0) {
		this.x = x
		this.y = y
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
