export const Tags = {
	player:  0b01_0000,
	hostile: 0b10_0000,

	ship:    0b00_0001,
	bullet:  0b00_0010,
	missile: 0b00_0110,
	field:   0b00_1000,

	/** @param {number} a @param {number} b */
	match(a, b) {
		const and = a & b

		return and == a || and == b
	}
}
