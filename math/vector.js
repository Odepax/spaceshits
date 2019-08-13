const { sqrt, atan2 } = Math

export class Vector {
	static angular(/** @type {number} */ direction, /** @type {number} */ length) {
		return new Vector(
			cos(direction) * length,
			sin(direction) * length
		)
	}

	constructor(x = 0, y = 0) {
		this.x = x
		this.y = y
	}

	/** Length, a.k.a. magnitude, or norm. */
	get l() { return sqrt(this.x * this.x + this.y * this.y) }
	set l(value) {
		const l = this.l

		if (l == 0) {
			this.x = value
		} else {
			this.x *= value / l
			this.y *= value / l
		}
	}
	/** Normalized direction, i.e. directed angle with (1, 0). */
	get d() { return atan2(this.y, this.x) }
	set d(value) {
		const l = this.l

		this.x = cos(value) * l
		this.y = sin(value) * l
	}

	get copy() {
		return new Vector(
			this.x,
			this.y
		)
	}

	directionTo(/** @type {Vector} */ target) {
		return atan2(
			target.y - this.y,
			target.x - this.x
		)
	}

	lengthTo(/** @type {Vector} */ target) {
		const x = target.x - this.x
		const y = target.y - this.y

		return sqrt(x * x + y * y)
	}

	vectorTo(/** @type {Vector} */ target) {
		return new Vector(
			target.x - this.x,
			target.y - this.y
		)
	}
}
