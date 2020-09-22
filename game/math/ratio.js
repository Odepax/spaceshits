export const Ratio = {
	/** @param {number} value @param {number} max */
	progress(value, max) {
		return value / max
	},

	/** @param {number} value @param {number} max */
	decline(value, max) {
		return (max - value) / max
	},

	/** @param {number} value @param {number} min @param {number} max */
	progressBetween(value, min, max) {
		return (value - min) / (max - min)
	},

	/** @param {number} value @param {number} min @param {number} max */
	declineBetween(value, min, max) {
		return (max - value) / (max - min)
	}
}
