/** @template T */
export function oneOf(/** @type {T[]} */ values) {
	return values[parseInt(Math.random() * values.length)]
}

export function within(/** @type{number} */ min, /** @type{number} */ max) {
	return Math.random() * (max - min) + min
}

export function sign() {
	return oneOf([-1, 1])
}

export function angle() {
	return within(-PI, PI)
}
