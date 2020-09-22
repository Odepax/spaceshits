export const Flag = {
	/** Checks whether `a` is exactly or is more specific than `b`.
	 * @param {number} a @param {number} b */
	contains(a, b) {
		return (a & b) == b
	},

	/** Checks whether `a` is exactly or is more specific than `b`, or whether `b` is exactly or is more specific than `a`.
	 * This can be seen as a shortcut for `contains(a, b) || contains(b, a)`.
	 * @param {number} a @param {number} b */
	matches(a, b) {
		const and = a & b

		return and == a || and == b
	}
}
