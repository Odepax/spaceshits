export class Collision {
}

export class Collider {
	onInitialize(radius) {
		this.radius = radius
	}

	collidesWith(other) {
		return this.testFastCollisionWith(other) && this.testFullCollisionWith(other)
	}

	testFastCollisionWith(other) {
		const { x: thisX, y: thisY } = this.link.Transform
		const { x: otherX, y: otherY } = other.link.Transform

		return Collision.testUnrotatedRectangles(
			thisX - this.radius, thisY - this.radius, thisX + this.radius, thisY + this.radius,
			otherX - other.radius, otherY - other.radius, otherX + other.radius, otherY + other.radius
		)
	}

	// testFullCollisionWith(other) {}
}

export class CircleCollider extends Collider {
	testFullCollisionWith(other) {
		if (other.constructor == CircleCollider) {
			const { x: thisX, y: thisY } = this.link.Transform
			const { x: otherX, y: otherY } = other.link.Transform

			return Collision.testCircles(thisX, thisY, this.radius, otherX, otherY, other.radius)
		} else if (other.constructor == ConvexPolygonCollider) {
			return other.testFullCollisionWith(this)
		} else {
			throw new Error(`'${this.constructor.name}' does not support collision detection against '${other.constructor.name}'.`)
		}
	}
}

export class ConvexPolygonCollider extends Collider {
	onInitialize(radius, points) {
		super.onInitialize(radius)

		this.points = points.apply(points => points.push(points[0], points[1]))
	}

	absolutePoints(x, y, a) {
		return this.points.map((value, i, points) => i % 2 == 0
			? x + value * cos(a) - points[i + 1] * sin(a)
			: y + points[i - 1] * sin(a) + value * cos(a)
		)
	}

	testFullCollisionWith(other) {
		if (other.constructor == ConvexPolygonCollider) {
			const { x: thisX, y: thisY, a: thisA } = this.link.Transform
			const { x: otherX, y: otherY, a: otherA } = other.link.Transform

			const thisPoints = this.absolutePoints(thisX, thisY, thisA)
			const otherPoints = other.absolutePoints(otherX, otherY, otherA)

			return Collision.testRotatedConvexPolygons(thisPoints, otherPoints)
		} else if (other.constructor == CircleCollider) {
			const { x: thisX, y: thisY, a } = this.link.Transform
			const { x: otherX, y: otherY } = other.link.Transform

			const thisPoints = this.absolutePoints(thisX, thisY, a)

			return Collision.testRotatedConvexPolygonWithCircle(thisPoints, otherX, otherY, other.radius)
		} else {
			throw new Error(`'${this.constructor.name}' does not support collision detection against '${other.constructor.name}'.`)
		}
	}
}
