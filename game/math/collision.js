const { sqrt } = Math

const square = x => x * x

export function testCircles(
	/** @type {number} */ circle1X,
	/** @type {number} */ circle1Y,
	/** @type {number} */ circle1Radius,
	/** @type {number} */ circle2X,
	/** @type {number} */ circle2Y,
	/** @type {number} */ circle2Radius
) {
	return square(circle2X - circle1X) + square(circle2Y - circle1Y) < square(circle2Radius + circle1Radius)
}

export function testUnrotatedRectangles(
	/** @type {number} */ rectangle1Left,
	/** @type {number} */ rectangle1Top,
	/** @type {number} */ rectangle1Right,
	/** @type {number} */ rectangle1Bottom,
	/** @type {number} */ rectangle2Left,
	/** @type {number} */ rectangle2Top,
	/** @type {number} */ rectangle2Right,
	/** @type {number} */ rectangle2Bottom
) {
	return !(
		   rectangle1Right < rectangle2Left || rectangle2Right < rectangle1Left
		|| rectangle1Bottom < rectangle2Top || rectangle2Bottom < rectangle1Top
	)
}

export function testRotatedConvexPolygonWithCircle(
	/** @type {number[]} */ polygonPoints,
	/** @type {number} */ circleX,
	/** @type {number} */ circleY,
	/** @type {number} */ circleRadius
) {
	const polygonProjectionAxes = getNormals(polygonPoints)

	for (let i = 0, c = polygonProjectionAxes.length; i < c; i += 2) {
		const projectionAxisX = polygonProjectionAxes[i]
		const projectionAxisY = polygonProjectionAxes[i + 1]

		if (polygonAndCircleProjectionHasAGap(polygonPoints, circleX, circleY, circleRadius, projectionAxisX, projectionAxisY)) {
			return false
		}
	}

	return true;
}

export function testRotatedConvexPolygons(/** @type {number[]} */ polygon1Points, /** @type {number[]} */ polygon2Points) {
	const polygon1ProjectionAxes = getNormals(polygon1Points)

	for (let i = 0, c = polygon1ProjectionAxes.length; i < c; i += 2) {
		const projectionAxisX = polygon1ProjectionAxes[i]
		const projectionAxisY = polygon1ProjectionAxes[i + 1]

		if (polygonsProjectionHasAGap(polygon1Points, polygon2Points, projectionAxisX, projectionAxisY)) {
			return false
		}
	}

	const polygon2ProjectionAxes = getNormals(polygon2Points)

	for (let i = 0, c = polygon2ProjectionAxes.length; i < c; i += 2) {
		const projectionAxisX = polygon2ProjectionAxes[i]
		const projectionAxisY = polygon2ProjectionAxes[i + 1]

		if (polygonsProjectionHasAGap(polygon1Points, polygon2Points, projectionAxisX, projectionAxisY)) {
			return false
		}
	}

	return true
}

function getNormals(/** @type {number[]} */ polygonPoints) {
	const normalVectors = []

	for (let i = 0, c = polygonPoints.length - 2; i < c; i += 2) {
		// Left-hand normal (x:y => -y:x).
		normalVectors.push(
			polygonPoints[i + 1] - polygonPoints[i + 3],
			polygonPoints[i + 2] - polygonPoints[i]
		)
	}

	return normalVectors
}

function polygonsProjectionHasAGap(
	/** @type {number[]} */ polygon1Points,
	/** @type {number[]} */ polygon2Points,
	/** @type {number} */ projectionAxisX,
	/** @type {number} */ projectionAxisY
) {
	const [ polygon1ProjectionMin, polygon1ProjectionMax ] = projectPolygon(polygon1Points, projectionAxisX, projectionAxisY)
	const [ polygon2ProjectionMin, polygon2ProjectionMax ] = projectPolygon(polygon2Points, projectionAxisX, projectionAxisY)

	return polygon1ProjectionMax < polygon2ProjectionMin || polygon2ProjectionMax < polygon1ProjectionMin
}

function polygonAndCircleProjectionHasAGap(
	/** @type {number[]} */ polygonPoints,
	/** @type {number} */ circleX,
	/** @type {number} */ circleY,
	/** @type {number} */ circleRadius,
	/** @type {number} */ projectionAxisX,
	/** @type {number} */ projectionAxisY
) {
	const [ polygonProjectionMin, polygonProjectionMax ] = projectPolygon(polygonPoints, projectionAxisX, projectionAxisY)
	const [ circleProjectionMin, circleProjectionMax ] = projectCircle(circleX, circleY, circleRadius, projectionAxisX, projectionAxisY)

	return polygonProjectionMax < circleProjectionMin || circleProjectionMax < polygonProjectionMin
}

function projectPolygon(
	/** @type {number[]} */ polygonPoints,
	/** @type {number} */ baseVectorX,
	/** @type {number} */ baseVectorY
) {
	let min = polygonPoints[0] * baseVectorX + polygonPoints[1] * baseVectorY // Dot product.
	let max = min

	for (let i = 2, c = polygonPoints.length; i < c; i += 2) {
		const projection = polygonPoints[i] * baseVectorX + polygonPoints[i + 1] * baseVectorY // Dot product.

		if (projection < min) {
			min = projection
		} else if (max < projection) {
			max = projection
		}
	}

	return [ min, max ]
}

function projectCircle(
	/** @type {number} */ circleX,
	/** @type {number} */ circleY,
	/** @type {number} */ circleRadius,
	/** @type {number} */ baseVectorX,
	/** @type {number} */ baseVectorY
) {
	const projection = circleX * baseVectorX + circleY * baseVectorY // Dot product.
	const baseVectorLength = sqrt(baseVectorX * baseVectorX + baseVectorY * baseVectorY)

	return [
		projection - circleRadius * baseVectorLength,
		projection + circleRadius * baseVectorLength
	]
}
