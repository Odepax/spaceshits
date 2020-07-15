import { Transform } from "./transform.js"

export const Force = {
	/** @param {Transform} target @param {number} spf */
	apply({ x = 0, y = 0, a = 0 }, target, spf) {
		target.x += x * spf
		target.y += y * spf
		target.a += a * spf
	},

	/** @param {Transform} targetVelocity @param {number} dragFactor @param {number} spf */
	applyFriction(targetVelocity, dragFactor, spf) {
		targetVelocity
			.angularOffsetBy({
				d: targetVelocity.d + Math.PI,
				l: targetVelocity.squaredLength * dragFactor * spf
			})
			.rotateBy(-targetVelocity.a * Math.abs(targetVelocity.a) * dragFactor * spf)
	}
}
