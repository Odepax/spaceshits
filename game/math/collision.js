export const Collision = {
	/**
	 * @param {number} box1Left
	 * @param {number} box1Right
	 * @param {number} box1Top
	 * @param {number} box1Bottom
	 * @param {number} box2Left
	 * @param {number} box2Right
	 * @param {number} box2Top
	 * @param {number} box2Bottom
	 */
	testBoundingBoxes(box1Left, box1Right, box1Top, box1Bottom, box2Left, box2Right, box2Top, box2Bottom) {
		return !(
			   box1Right < box2Left || box2Right < box1Left
			|| box1Bottom < box2Top || box2Bottom < box1Top
		)
	},

	/**
	 * @param {number} circle1X
	 * @param {number} circle1Y
	 * @param {number} circle1Radius
	 * @param {number} circle2X
	 * @param {number} circle2Y
	 * @param {number} circle2Radius
	 */
	testCircles(circle1X, circle1Y, circle1Radius, circle2X, circle2Y, circle2Radius) {
		const dx = circle2X - circle1X
		const dy = circle2Y - circle1Y
		const distance = circle2Radius + circle1Radius

		return (dx * dx + dy * dy) < (distance * distance)
	}
}
