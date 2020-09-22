export const Random = {
	/** @template T @param {T[]} values */
	in(values) {
		return values[parseInt(Math.random() * values.length)]
	},

	/** @template T @param {T[]} values */
	pop(values) {
		return values.splice(parseInt(Math.random() * values.length), 1)[0]
	},

	/** @param {number} minInclusive @param {number} maxExclusive */
	between(minInclusive, maxExclusive) {
		return Math.random() * (maxExclusive - minInclusive) + minInclusive
	},

	sign() {
		return this.in([ -1, 1 ])
	},

	angle() {
		return this.between(-Math.PI, Math.PI)
	}
}
