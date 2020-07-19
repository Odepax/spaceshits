export const Tags = {
	player:  0b01_000,
	hostile: 0b10_000,

	ship:    0b00_001,
	bullet:  0b00_010,
	field:   0b00_100,

	/** @param {number} a @param {number} b */
	match(a, b) {
		const and = a & b

		return and == a || and == b
	},

	/** @param {number} l @param {number} r */
	rmatch(l, r) {
		const and = l & r

		return and == r
	}
}
