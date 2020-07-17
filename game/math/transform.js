import { Angle } from "./angle.js"

export class Transform {
	/** @param {number} direction @param {number} length */
	static angular(direction, length, a = 0) {
		return new Transform(Math.cos(direction) * length, Math.sin(direction) * length, a)
	}

	constructor(x = 0, y = 0, a = 0) {
		/** @type {number} */
		this.x = x

		/** @type {number} */
		this.y = y

		/** @type {number} */
		this.a = a
	}

	get clampedAngle() {
		return Angle.clamp(this.a)
	}

	get squaredLength() {
		return this.x * this.x + this.y * this.y
	}

	/** Length, a.k.a. magnitude, or norm. */
	get l() {
		return Math.sqrt(this.squaredLength)
	}

	set l(value) {
		const l = this.l

		if (l == 0)
			this.x = value

		else {
			this.x *= value / l
			this.y *= value / l
		}
	}

	/** Normalized direction, i.e. directed angle from Transform(1, 0, 0). */
	get d() {
		return Math.atan2(this.y, this.x)
	}

	set d(value) {
		const l = this.l

		this.x = Math.cos(value) * l
		this.y = Math.sin(value) * l
	}

	get copy() {
		return new Transform(this.x, this.y, this.a)
	}

	/** Resets 'transform.a' to 0. */
	get opposite() {
		return new Transform(-this.x, -this.y)
	}

	/** Resets 'transform.a' to 0. */
	get tangent() {
		return new Transform(-this.y, this.x)
	}

	differenceTo({ x = 0, y = 0, a = 0 }) {
		return new Transform(x - this.x, y - this.y, a - this.a)
	}

	differenceFrom({ x = 0, y = 0, a = 0 }) {
		return new Transform(this.x - x, this.y - y, this.a - a)
	}

	directionTo({ x = 0, y = 0 }) {
		return Math.atan2(y - this.y, x - this.x)
	}

	directionFrom({ x = 0, y = 0 }) {
		return Math.atan2(this.y - y, this.x - x)
	}

	squaredLengthTo({ x = 0, y = 0 }) {
		const dx = x - this.x
		const dy = y - this.y

		return dx * dx + dy * dy
	}

	/** @param {{ x?: number, y?: number }} other */
	lengthTo(other) {
		return Math.sqrt(this.squaredLengthTo(other))
	}

	/** @param {number} value */
	setA(value) {
		this.a = value

		return this
	}

	/** @param {number} a */
	rotateBy(a) {
		this.a += a

		return this
	}

	/** Does not modify 'transform.a'. */
	offsetBy({ x = 0, y = 0 }) {
		this.x += x
		this.y += y

		return this
	}

	/** Does not modify 'transform.a'. */
	angularOffsetBy({ d = 0, l = 1 }) {
		this.x += Math.cos(d) * l
		this.y += Math.sin(d) * l

		return this
	}

	/** Does not modify 'transform.a'. */
	relativeOffsetBy({ x = 0, y = 0 }) {
		this.x += Math.cos(this.a) * x - Math.sin(this.a) * y
		this.y += Math.sin(this.a) * x + Math.cos(this.a) * y

		return this
	}

	/** Does not modify 'transform.a'. */
	relativeAngularOffsetBy({ d = 0, l = 1 }) {
		this.x += Math.cos(this.a + d) * l
		this.y += Math.sin(this.a + d) * l

		return this
	}
}
