import { Force } from "./mecanic";

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
