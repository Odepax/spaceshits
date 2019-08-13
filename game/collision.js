import { Transform } from "./dynamic.js"
import { testUnrotatedRectangles, testCircles, testRotatedConvexPolygonWithCircle, testRotatedConvexPolygons } from "./math/collision.js"

const { cos, sin } = Math

export class Collision {
	constructor(/** @type {Collider} */ collider) {
		this.collider = collider
	}
}

export /** @abstract */ class Collider {
	constructor(/** @type {number} */ radius) {
		this.radius = radius
	}
}

export class CircleCollider extends Collider {
}

export class ConvexPolygonCollider extends Collider {
	constructor(/** @type {number} */ radius, /** @type {number[]} */ points) {
		super(radius)

		points.push(points[0], points[1])

		this.points = points
	}
}

export function testCollision(
	/** @type {{ Transform: Transform, Collision: Collision }} */ left,
	/** @type {{ Transform: Transform, Collision: Collision }} */ right
) {
	return testFastCollision(left, right) && testFullCollision(left, right)
}

function testFastCollision(
	{ Transform: { x: x1, y: y1 }, Collision: { collider: { radius: radius1 } } },
	{ Transform: { x: x2, y: y2 }, Collision: { collider: { radius: radius2 } } }
) {
	return testUnrotatedRectangles(
		x1 - radius1, y1 - radius1, x1 + radius1, y1 + radius1,
		x2 - radius2, y2 - radius2, x2 + radius2, y2 + radius2
	)
}

function testFullCollision(
	{ Transform: { x: x1, y: y1, a: a1 }, Collision: { collider: collider1 } },
	{ Transform: { x: x2, y: y2, a: a2 }, Collision: { collider: collider2 } }
) {
	if (collider1 instanceof CircleCollider) {
		if (collider2 instanceof CircleCollider) {
			return testCircles(x1, y1, collider1.radius, x2, y2, collider2.radius)
		} else if (collider2 instanceof ConvexPolygonCollider) {
			return testRotatedConvexPolygonWithCircle(absolutePoints(collider2.points, x2, y2, a2), x1, y1, collider1.radius)
		}
	} else if (collider1 instanceof ConvexPolygonCollider) {
		if (collider2 instanceof CircleCollider) {
			return testRotatedConvexPolygonWithCircle(absolutePoints(collider1.points, x1, y1, a1), x2, y2, collider2.radius)
		} else if (collider2 instanceof ConvexPolygonCollider) {
			return testRotatedConvexPolygons(
				absolutePoints(collider1.points, x1, y1, a1),
				absolutePoints(collider2.points, x2, y2, a2)
			)
		}
	}

	throw new Error(`'${ collider1.constructor.name }' does not support collision detection against '${ collider2.constructor.name }'.`)
}

function absolutePoints(points, x, y, a) {
	return points.map((value, i, points) => i % 2 == 0
		? x + value * cos(a) - points[i + 1] * sin(a)
		: y + value * cos(a) + points[i - 1] * sin(a)
	)
}
