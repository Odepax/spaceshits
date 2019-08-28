const { PI } = Math

/** @template T */
export function oneOf(/** @type {T[]} */ values) {
	return values[parseInt(Math.random() * values.length)]
}

/** @template T */
export function pop(/** @type {T[]} */ values) {
	return values.splice(parseInt(Math.random() * values.length), 1)[0]
}

export function within(/** @type{number} */ min, /** @type{number} */ max) {
	return Math.random() * (max - min) + min
}

export function sign() {
	return oneOf([ -1, 1 ])
}

export function angle() {
	return within(-PI, PI)
}
