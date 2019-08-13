const { atan2, PI } = Math

export function clamp(/** @type {number} */ angle) {
	while (+PI < angle) angle -= 2 * PI
	while (angle < -PI) angle += 2 * PI

	return angle
}

export function optimalAngleBetween(/** @type {number} */ base, /** @type {number} */ target) {
	return clamp(target - base)
}

export function leftAngleBetween(/** @type {number} */ base, /** @type {number} */ target) {
	const distance = optimalAngleBetween(base, target)

	return distance > 0 ? distance - 2 * PI : distance
}

export function rightAngleBetween(/** @type {number} */ base, /** @type {number} */ target) {
	const distance = optimalAngleBetween(base, target)

	return distance < 0 ? distance + 2 * PI : distance
}

export function angleToward(
	/** @type {number} */ baseX,
	/** @type {number} */ baseY,
	/** @type {number} */ targetX,
	/** @type {number} */ targetY
) {
	return atan2(targetY - baseY, targetX - baseX)
}
