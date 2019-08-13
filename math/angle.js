const { sign, abs, floor, atan2, PI } = Math

export function normalize(/** @type {number} */ angle) {
	// Adapted from:
	// https://stackoverflow.com/a/22949941
	// https://stackoverflow.com/questions/2320986/easy-way-to-keeping-angles-between-179-and-180-degrees#answer-22949941
	return angle - (floor((angle + PI) / (2 * PI))) * 2 * PI
}

export function direction(/** @type {number} */ x, /** @type {number} */ y) {
	return atan2(y, x)
}

export function shortAngle(/** @type {number} */ base, /** @type {number} */ target) {
	return normalize(target - base)
}

export function longAngle(/** @type {number} */ base, /** @type {number} */ target) {
	const a = shortAngle(base, target)

	return (a < 0)
		? +2 * PI + a
		: -2 * PI + a
}

export function leftAngle(/** @type {number} */ base, /** @type {number} */ target) {
	const angle = shortAngle(base, target)

	return angle - (angle > 0) * 2 * PI
}

export function rightAngle(/** @type {number} */ base, /** @type {number} */ target) {
	const angle = shortAngle(base, target)

	return angle + (angle < 0) * 2 * PI
}
