export const Angle = {
	/** @param {number} value */
	clamp(value) {
		// Adapted from:
		// https://stackoverflow.com/a/22949941
		// https://stackoverflow.com/questions/2320986/easy-way-to-keeping-angles-between-179-and-180-degrees#answer-22949941
		return value - Math.floor((value + Math.PI) / (2 * Math.PI)) * 2 * Math.PI
	},

	/** @param {number} base @param {number} target */
	shortArcBetween(base, target) {
		return this.clamp(target - base)
	},

	/** @param {number} base @param {number} target */
	longArcBetween(base, target) {
		const a = this.shortArcBetween(base, target)

		return (a < 0)
			? +2 * Math.PI + a
			: -2 * Math.PI + a
	},

	/** @param {number} base @param {number} target */
	clockwiseArcBetween(base, target) {
		const angle = this.shortArcBetween(base, target)

		return angle + (angle < 0) * 2 * Math.PI
	},

	/** @param {number} base @param {number} target */
	counterClockwiseArcBetween(base, target) {
		const angle = this.shortArcBetween(base, target)

		return angle - (angle > 0) * 2 * Math.PI
	}
}
