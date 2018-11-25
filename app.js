const Angle = {
	normalize(angle) {
		while (+PI < angle) angle -= 2 * PI
		while (angle < -PI) angle += 2 * PI

		return angle
	},

	optimalAngleBetween(base, target) {
		return Angle.normalize(target - base)
	},

	leftAngleBetween(base, target) {
		const distance = this.optimalAngleBetween(base, target)

		return distance > 0 ? distance - 2 * PI : distance
	},

	rightAngleBetween(base, target) {
		const distance = this.optimalAngleBetween(base, target)

		return distance < 0 ? distance + 2 * PI : distance
	}
}

// TODO: const Vector ~ Angle
function leftNormal(vectorX, vectorY) {
	return [ vectorY, -vectorX ]
}

function rightNormal(vectorX, vectorY) {
	return [ -vectorY, vectorX ]
}

function dotProduct(vector1X, vector1Y, vector2X, vector2Y) {
	return vector1X * vector2X + vector1Y * vector2Y
}

function projection(projectedVectorX, projectedVectorY, baseVectorX, baseVectorY) {
	return [
		baseVectorX * dotProduct(projectedVectorX, projectedVectorY, baseVectorX, baseVectorY) / dotProduct(baseVectorX, baseVectorY, baseVectorX, baseVectorY),
		baseVectorY * dotProduct(projectedVectorX, projectedVectorY, baseVectorX, baseVectorY) / dotProduct(baseVectorX, baseVectorY, baseVectorX, baseVectorY)
	]
}


const Collision = {
	testCircleWithPoint(circleX, circleY, circleRadius, pointX, pointY) {
		return square(pointX - circleX) + square(pointY - circleY) < square(circleRadius)
	},

	testCircleWithCircle(circle1X, circle1Y, circle1Radius, circle2X, circle2Y, circle2Radius) {
		return square(circle2X - circle1X) + square(circle2Y - circle1Y) < square(circle2Radius + circle1Radius)
	},

	testRectangleWithPoint(rectangleLeft, rectangleTop, rectangleRight, rectangleBottom, pointX, pointY) {
		return rectangleLeft < pointX && pointX < rectangleRight
		    && rectangleTop  < pointY && pointY < rectangleBottom
	},

	testRectangleWithCircle(rectangleLeft, rectangleTop, rectangleRight, rectangleBottom, circleX, circleY, circleRadius) {
		const circleBoxLeft = circleX - circleRadius
		const circleBoxRight = circleX + circleRadius
		const circleBoxTop = circleY - circleRadius
		const circleBoxBottom = circleY + circleRadius

		return this.testRectangleWithRectangle(rectangleLeft, rectangleTop, rectangleRight, rectangleBottom, circleBoxLeft, circleBoxTop, circleBoxRight, circleBoxBottom) && (
			   this.testCircleWithPoint(circleX, circleY, circleRadius, rectangleLeft,  rectangleTop)
			|| this.testCircleWithPoint(circleX, circleY, circleRadius, rectangleLeft,  rectangleBottom)
			|| this.testCircleWithPoint(circleX, circleY, circleRadius, rectangleRight, rectangleTop)
			|| this.testCircleWithPoint(circleX, circleY, circleRadius, rectangleRight, rectangleBottom)
			|| this.testRectangleWithPoint(rectangleLeft, rectangleTop, rectangleRight, rectangleBottom, circleX, circleY)
			|| projects(circleX, circleY, rectangleLeft, rectangleTop, rectangleLeft, rectangleBottom)
			|| projects(circleX, circleY, rectangleLeft, rectangleTop, rectangleRight, rectangleTop)
		)

		// TODO: Understand this shit and recode it.
		function projects(Cx, Cy, Ax, Ay, Bx, By) {
			const ACx = Cx - Ax
			const ACy = Cy - Ay
			const ABx = Bx - Ax
			const ABy = By - Ay
			const BCx = Cx - Bx
			const BCy = Cy - By
			const s1 = dotProduct(ACx, ACy, ABx, ABy)
			const s2 = dotProduct(BCx, BCy, ABx, ABy)

			return s1 * s2 < 0
		}
	},

	testRectangleWithRectangle(rectangle1Left, rectangle1Top, rectangle1Right, rectangle1Bottom, rectangle2Left, rectangle2Top, rectangle2Right, rectangle2Bottom) {
		return !(
			   rectangle1Right  < rectangle2Left || rectangle2Right  < rectangle1Left
			|| rectangle1Bottom < rectangle2Top  || rectangle2Bottom < rectangle1Top
		)
	},

	testConvexPolygonWithPoint(polygonPoints, pointX, pointY) {
		for (let i = 0, c = polygonPoints.length; i < c; i += 2) {
			const segmentStartX = polygonPoints[i]
			const segmentStartY = polygonPoints[i + 1]
			const segmentEndX = polygonPoints[i + 2]
			const segmentEndY = polygonPoints[i + 3]

			if ((segmentEndX - segmentStartX) * (pointY - segmentStartY) < (segmentEndY - segmentStartY) * (pointX - segmentStartX)) {
				return false
			}
		}

		return true
	},

	testConvexPolygonWithCircle(convexPolygon, circle) {
	},

	testConvexPolygonWithRectangle(convexPolygon, rectangle) {
	},

	testConvexPolygonWithConvexPolygon(polygon1Points, polygon2Points) {
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

		return true;

		function getNormals(polygonPoints) {
			const normalVectors = []

			for (let i = 0, c = polygonPoints.length; i < c; i += 2) {
				const edgeX = polygonPoints[i] - polygonPoints[i + 2]
				const edgeY = polygonPoints[i + 1] - polygonPoints[i + 3]

				const [ normalX, normalY ] = leftNormal(edgeX, edgeY)

				normalVectors.push(normalX, normalY)
			}

			return normalVectors
		}

		function polygonsProjectionHasAGap(polygon1Points, polygon2Points, projectionAxisX, projectionAxisY) {
			const [ polygon1ProjectionMin, polygon1ProjectionMax ] = projectPolygon(polygon1Points, projectionAxisX, projectionAxisY)
			const [ polygon2ProjectionMin, polygon2ProjectionMax ] = projectPolygon(polygon2Points, projectionAxisX, projectionAxisY)

			return polygon1ProjectionMax < polygon2ProjectionMin || polygon2ProjectionMax < polygon1ProjectionMin
		}

		function projectPolygon(polygonPoints, baseVectorX, baseVectorY) {
			let min = dotProduct(polygonPoints[0], polygonPoints[1], baseVectorX, baseVectorY)
			let max = min

			for (let i = 2, c = polygonPoints.length; i < c; i += 2) {
				const projection = dotProduct(polygonPoints[i], polygonPoints[i + 1], baseVectorX, baseVectorY)

				     if (projection < min) min = projection
				else if (max < projection) max = projection
			}

			return [ min, max ]
		}
	}
}

// -----------------------------------------------------------------

class Transform {
	constructor(x, y, a = 0) {
		this.x = x
		this.y = y
		this.a = a
	}

	get a() { return this._a }
	set a(value) { this._a = Angle.normalize(value) }

	distanceToward(target) {
		const x = this.x - target.x
		const y = this.y - target.y

		return sqrt(x * x + y * y)
	}

	angleToward(target) {
		return atan2(target.y - this.y, target.x - this.x)
	}

	optimalAngleToward(target) {
		return this.optimalAngleTo(this.angleToward(target))
	}

	leftAngleToward(target) {
		const distance = this.optimalAngleToward(target)

		return distance > 0 ? distance - 2 * PI : distance
	}

	rightAngleToward(target) {
		const distance = this.optimalAngleToward(target)

		return distance < 0 ? distance + 2 * PI : distance
	}

	clone() {
		return new Transform(this.x, this.y, this.a)
	}

	offset(offsetX, offsetY, base = this) {
		this.x = base.x + offsetX
		this.y = base.y + offsetY

		return this
	}

	relativeOffset(offsetX, offsetY, base = this) {
		this.x = base.x + cos(base.a) * offsetX - sin(base.a) * offsetY
		this.y = base.y + sin(base.a) * offsetX + cos(base.a) * offsetY

		return this
	}

	angularOffset(angle, distance, base = this) {
		this.x = base.x + cos(angle) * distance
		this.y = base.y + sin(angle) * distance

		return this
	}

	relativeAngularOffset(angle, distance, base = this) {
		this.x = base.x + cos(base.a + angle) * distance
		this.y = base.y + sin(base.a + angle) * distance

		return this
	}

	constrainAngleIn(leftBound, rightBound) {
		const arcSize = Angle.rightAngleBetween(leftBound, rightBound)
		const relativeAngle = Angle.rightAngleBetween(leftBound, this.a)

		if (relativeAngle > arcSize) {
			const distancetoLeftBound = 2 * PI - relativeAngle
			const distanceToRightBound = abs(this.optimalAngleTo(rightBound))

			this.a = distancetoLeftBound < distanceToRightBound ? leftBound : rightBound
		}

		return this
	}
}

class Force {
	constructor(x, y, a = 0) {
		this.x = x
		this.y = y
		this.a = a
	}

	drive(subject, tickTime) {
		subject.x += this.x * tickTime
		subject.y += this.y * tickTime
		subject.a += this.a * tickTime
	}
}

class Friction {
	constructor(movementResistanceFactor = 0.05, rotationResistanceFactor = 2 * PI) {
		this.movementResistanceFactor = movementResistanceFactor
		this.rotationResistanceFactor = rotationResistanceFactor

		this.x = 0
		this.y = 0
		this.a = 0
	}

	drive(subject, tickTime) {
		subject.x = abs(subject.x) < 0.001 ? 0 : subject.x - sign(subject.x) * min(abs(this.x), abs(subject.x)) * tickTime
		subject.y = abs(subject.y) < 0.001 ? 0 : subject.y - sign(subject.y) * min(abs(this.y), abs(subject.y)) * tickTime
		subject.a = abs(subject.a) < 0.001 ? 0 : subject.a - sign(subject.a) * min(abs(this.a), abs(subject.a)) * tickTime
	}

	updateFrom(speed) {
		this.x = this.movementResistanceFactor * speed.x * speed.x
		this.y = this.movementResistanceFactor * speed.y * speed.y
		this.a = this.rotationResistanceFactor * speed.a * speed.a
	}
}

// -----------------------------------------------------------------

class Collider extends Trait {
	// collidesWith(other) {}
}

class PointCollider extends Collider {
	collidesWith(other) {
		switch (other.constructor) {
			case CircleCollider: {
				const circleX = other.link.Transform.x
				const circleY = other.link.Transform.y
				const circleRadius = other.radius

				const pointX = this.link.Transform.x
				const pointY = this.link.Transform.y

				return Collision.testCircleWithPoint(circleX, circleY, circleRadius, pointX, pointY)
			}
			case RectangleCollider: {
				const rectangleLeft = other.link.Transform.x - other.width / 2
				const rectangleRight = other.link.Transform.x + other.width / 2
				const rectangleTop = other.link.Transform.y - other.height / 2
				const rectangleBottom = other.link.Transform.y + other.height / 2

				const pointX = this.link.Transform.x
				const pointY = this.link.Transform.y

				return Collision.testRectangleWithPoint(rectangleLeft, rectangleTop, rectangleRight, rectangleBottom, pointX, pointY)
			}
			case ConvexPolygonCollider: {
				const polygonPoints = other.points.map((value, i) => value + (i % 2 == 0 ? other.link.Transform.x : other.link.Transform.y))

				polygonPoints.push(polygonPoints[0], polygonPoints[1])

				const pointX = this.link.Transform.x
				const pointY = this.link.Transform.y

				return Collision.testConvexPolygonWithPoint(polygonPoints, pointX, pointY)
			}

			default: throw new Error(`'${this.constructor.name}' does not support collision computation with '${other.constructor.name}'.`)
		}
	}
}

class CircleCollider extends Collider {
	onInitialize(radius) {
		this.radius = radius
	}

	collidesWith(other) {
		switch (other.constructor) {
			case PointCollider: {
				const circleX = this.link.Transform.x
				const circleY = this.link.Transform.y
				const circleRadius = this.radius

				const pointX = other.link.Transform.x
				const pointY = other.link.Transform.y

				return Collision.testCircleWithPoint(circleX, circleY, circleRadius, pointX, pointY)
			}
			case CircleCollider: {
				const circle1X = this.link.Transform.x
				const circle1Y = this.link.Transform.y
				const circle1Radius = this.radius

				const circle2X = other.link.Transform.x
				const circle2Y = other.link.Transform.y
				const circle2Radius = other.radius

				return Collision.testCircleWithCircle(circle1X, circle1Y, circle1Radius, circle2X, circle2Y, circle2Radius)
			}
			case RectangleCollider: {
				const rectangleLeft = other.link.Transform.x - other.width / 2
				const rectangleRight = other.link.Transform.x + other.width / 2
				const rectangleTop = other.link.Transform.y - other.height / 2
				const rectangleBottom = other.link.Transform.y + other.height / 2

				const circleX = this.link.Transform.x
				const circleY = this.link.Transform.y
				const circleRadius = this.radius

				return Collision.testRectangleWithCircle(rectangleLeft, rectangleTop, rectangleRight, rectangleBottom, circleX, circleY, circleRadius)
			}
			case ConvexPolygonCollider: return false

			default: throw new Error(`'${this.constructor.name}' does not support collision computation with '${other.constructor.name}'.`)
		}
	}
}

class RectangleCollider extends Collider {
	onInitialize(width, height) {
		this.width = width
		this.height = height
	}

	collidesWith(other) {
		switch (other.constructor) {
			case PointCollider: {
				const rectangleLeft = this.link.Transform.x - this.width / 2
				const rectangleRight = this.link.Transform.x + this.width / 2
				const rectangleTop = this.link.Transform.y - this.height / 2
				const rectangleBottom = this.link.Transform.y + this.height / 2

				const pointX = other.link.Transform.x
				const pointY = other.link.Transform.y

				return Collision.testRectangleWithPoint(rectangleLeft, rectangleTop, rectangleRight, rectangleBottom, pointX, pointY)
			}
			case CircleCollider: {
				const rectangleLeft = this.link.Transform.x - this.width / 2
				const rectangleRight = this.link.Transform.x + this.width / 2
				const rectangleTop = this.link.Transform.y - this.height / 2
				const rectangleBottom = this.link.Transform.y + this.height / 2

				const circleX = other.link.Transform.x
				const circleY = other.link.Transform.y
				const circleRadius = other.radius

				return Collision.testRectangleWithCircle(rectangleLeft, rectangleTop, rectangleRight, rectangleBottom, circleX, circleY, circleRadius)
			}
			case RectangleCollider: {
				const rectangle1Left = this.link.Transform.x - this.width / 2
				const rectangle1Right = this.link.Transform.x + this.width / 2
				const rectangle1Top = this.link.Transform.y - this.height / 2
				const rectangle1Bottom = this.link.Transform.y + this.height / 2

				const rectangle2Left = other.link.Transform.x - other.width / 2
				const rectangle2Right = other.link.Transform.x + other.width / 2
				const rectangle2Top = other.link.Transform.y - other.height / 2
				const rectangle2Bottom = other.link.Transform.y + other.height / 2

				return Collision.testRectangleWithRectangle(rectangle1Left, rectangle1Top, rectangle1Right, rectangle1Bottom, rectangle2Left, rectangle2Top, rectangle2Right, rectangle2Bottom)
			}
			case ConvexPolygonCollider: return false
			default: throw new Error(`'${this.constructor.name}' does not support collision computation with '${other.constructor.name}'.`)
		}
	}
}

class ConvexPolygonCollider extends Collider {
	onInitialize(points) {
		this.points = points
	}

	collidesWith(other) {
		switch (other.constructor) {
			case PointCollider: {
				const polygonPoints = this.points.map((value, i) => value + (i % 2 == 0 ? this.link.Transform.x : this.link.Transform.y))

				polygonPoints.push(polygonPoints[0], polygonPoints[1])

				const pointX = other.link.Transform.x
				const pointY = other.link.Transform.y

				return Collision.testConvexPolygonWithPoint(polygonPoints, pointX, pointY)
			}
			case CircleCollider: return false
			case RectangleCollider: return false
			case ConvexPolygonCollider: {
				const polygon1Points = this.points.map((value, i) => value + (i % 2 == 0 ? this.link.Transform.x : this.link.Transform.y))
				const polygon2Points = other.points.map((value, i) => value + (i % 2 == 0 ? other.link.Transform.x : other.link.Transform.y))

				polygon1Points.push(polygon1Points[0], polygon1Points[1])
				polygon2Points.push(polygon2Points[0], polygon2Points[1])

				return Collision.testConvexPolygonWithConvexPolygon(polygon1Points, polygon2Points)
			}

			default: throw new Error(`'${this.constructor.name}' does not support collision computation with '${other.constructor.name}'.`)
		}
	}
}

// -----------------------------------------------------------------

class UserInteraction extends Trait {
	onInitialize(observedElement) {
		this.mousePosition = new Transform(0, 0)

		this.currentlyPressedKeys = new Set()
		this.pressedKeys = new Set()
		this.releasedKeys = new Set()
		this.pressedKeys.next = new Set()
		this.releasedKeys.next = new Set()

		this.observe(observedElement)
	}

	isPressed(key) { return this.currentlyPressedKeys.has(key) }
	wasPressed(key) { return this.pressedKeys.has(key) }
	wasReleased(key) { return this.releasedKeys.has(key) }

	observe(element) {
		element.addEventListener("mousemove", event => {
			this.mousePosition.x = event.offsetX
			this.mousePosition.y = event.offsetY
		}, false)

		element.addEventListener("contextmenu", event => {
			event.preventDefault()
		}, false)

		element.addEventListener("mousedown", event => {
			event.preventDefault()

			switch (event.button) {
				case 0: this.pressedKeys.next.add("MouseLeft"); break
				case 2: this.pressedKeys.next.add("MouseRight"); break
				case 1: this.pressedKeys.next.add("MouseMiddle"); break
			}
		}, false)

		element.addEventListener("mouseup", event => {
			event.preventDefault()

			switch (event.button) {
				case 0: this.releasedKeys.next.add("MouseLeft"); break
				case 2: this.releasedKeys.next.add("MouseRight"); break
				case 1: this.releasedKeys.next.add("MouseMiddle"); break
			}
		}, false)

		element.addEventListener("keydown", event => {
			if (event.code != "F5" && event.code != "F11" && event.code != "F12") {
				event.preventDefault()
			}

			if(!this.currentlyPressedKeys.has(event.code)) {
				this.pressedKeys.next.add(event.code)
			}
		}, false)

		element.addEventListener("keyup", event => {
			if (event.code != "F5" && event.code != "F11" && event.code != "F12") {
				event.preventDefault()
			}

			this.releasedKeys.next.add(event.code)
		}, false)
	}

	onUpdate() {
		for (const key of this.pressedKeys.next) {
			this.currentlyPressedKeys.add(key)
		}

		for (const key of this.releasedKeys.next) {
			this.currentlyPressedKeys.delete(key)
		}

		this.pressedKeys = this.pressedKeys.next
		this.releasedKeys = this.releasedKeys.next

		this.pressedKeys.next = new Set()
		this.releasedKeys.next = new Set()
	}
}

// -----------------------------------------------------------------

class Ephemeral extends Trait {
	onInitialize(timeToLive) {
		this.timeToLive = timeToLive
		this.timeEnlapsed = 0
		this.progress = 0
	}

	onUpdate() {
		this.timeEnlapsed += this.universe.tickTime
		this.progress = this.timeEnlapsed / this.timeToLive
	}

	onRemoving() {
		return this.timeToLive <= this.timeEnlapsed
	}
}

class Destroyable extends Trait {
	onInitialize(health, healthRegeneration = 0) {
		this.health = health
		this.maxHealth = health
		this.healthRegeneration = healthRegeneration
	}

	onUpdate() {
		if (this.health < this.maxHealth) {
			this.health += this.healthRegeneration * this.universe.tickTime
		}
	}

	onRemoving() {
		return this.health < 0
	}
}

class ForceBasedMovement extends Trait {
	onInitialize(speed = new Force(0, 0), acceleration = new Force(0, 0), friction = new Friction()) {
		this.speed = speed
		this.acceleration = acceleration
		this.friction = friction
	}

	onUpdate() {
		this.acceleration.drive(this.speed, this.universe.tickTime)

		this.friction.updateFrom(this.speed)
		this.friction.drive(this.speed, this.universe.tickTime)

		this.speed.drive(this.link.Transform, this.universe.tickTime)
	}
}

class LinearMovement extends Trait {
	onInitialize(speedX, speedY) {
		this.speedX = speedX
		this.speedY = speedY
	}

	onUpdate() {
		this.link.Transform.offset(this.speedX * this.universe.tickTime, this.speedY * this.universe.tickTime)
	}
}

class AngularLinearMovement extends Trait {
	onInitialize(angle, speed) {
		this.angle = angle
		this.speed = speed
	}

	onUpdate() {
		this.link.Transform.offset(
			cos(this.angle) * this.speed * this.universe.tickTime,
			sin(this.angle) * this.speed * this.universe.tickTime
		)
	}
}

class TeamMember {
	onInitialize(team = null) {
		this.team = team
	}

	isFriendWith(other) {
		return other.team && this.team == other.team
	}

	findHostilesAmongst(others) {
		const result = []

		for (const other of others) {
			if (!this.isFriendWith(other)) {
				result.push(other)
			}
		}

		return result
	}
}

const Tag = {
	player: Symbol("Tag/Link: Player"),
	enemy: Symbol("Tag/Link: Enemy")
}

// -----------------------------------------------------------------

class CanvasErasing extends Trait {
	onInitialize(graphics) {
		this.graphics = graphics
	}

	onUpdate() {
		this.graphics.clearRect(0, 0, this.graphics.canvas.width, this.graphics.canvas.height)
	}
}

class DraftShipCanvasRender extends Trait {
	onInitialize(graphics) {
		this.graphics = graphics

		this.path = new Path2D().apply(path => {
			path.moveTo(-13.8, 7.4)
			path.lineTo(-4.8, 9.9)
			path.lineTo(-10.2, 30)
			path.lineTo(4.8, 30)
			path.lineTo(6.2, 24.9)
			path.bezierCurveTo(-3, 22.8, -0.3, 8.8, 9.8, 11.5)
			path.lineTo(12.8, 0)
			path.lineTo(9.8, -11.5)
			path.bezierCurveTo(-0.3, -8.8, -3, -22.8, 6.2, -24.9)
			path.lineTo(4.8, -30)
			path.lineTo(-10.2, -30)
			path.lineTo(-4.8, -9.9)
			path.lineTo(-13.8, -7.4)
			path.closePath()
		})
	}

	onUpdate() {
		this.graphics.applyTransform(this.link.Transform)

		this.graphics.fillStyle = WHITE
		this.graphics.fill(this.path)
		
		this.graphics.resetTransform()
	}
}

// -----------------------------------------------------------------

class InteractionLogging extends Trait {
	onInitialize(userInteraction, graphics) {
		this.userInteraction = userInteraction
		this.graphics = graphics
	}

	onUpdate() {
		const mousePosition = this.userInteraction.mousePosition
		const currentlyPressedKeys = Array.from(this.userInteraction.currentlyPressedKeys).join(", ")
		const pressedKeys = Array.from(this.userInteraction.pressedKeys).join(", ")
		const releasedKeys = Array.from(this.userInteraction.releasedKeys).join(", ")

		this.graphics.fillStyle = WHITE
		this.graphics.font = "12pt Source Code Pro"
		
		let i = 0
		this.graphics.fillText(`Mouse position ........... ( ${mousePosition.x}, ${mousePosition.y} )`, 50, 50 + ++i * 25)
		this.graphics.fillText(`Currently pressed keys ... ${currentlyPressedKeys}`, 50, 50 + ++i * 25)
		this.graphics.fillText(`Recently pressed keys .... ${pressedKeys}`, 50, 50 + ++i * 25)
		this.graphics.fillText(`Recently released keys ... ${releasedKeys}`, 50, 50 + ++i * 25)
		this.graphics.fillText(`Last universe tick was ... ${this.universe.tickTime}`, 50, 50 + ++i * 25)
	}
}

class PlayerMovementController extends Trait {
	onInitialize(userInteraction, movementAcceleration, rotationAcceleration) {
		this.userInteraction = userInteraction

		this.movementAcceleration = movementAcceleration
		this.rotationAcceleration = rotationAcceleration
	}

	onUpdate() {
		const targetPosition = this.userInteraction.mousePosition
		const shipPosition = this.link.Transform
		const shipAcceleration = this.link.ForceBasedMovement.acceleration

		shipPosition.a = shipPosition.angleToward(targetPosition)

		const wIsPressed = this.userInteraction.isPressed("KeyW")
		const sIsPressed = this.userInteraction.isPressed("KeyS")
		const dIsPressed = this.userInteraction.isPressed("KeyD")
		const aIsPressed = this.userInteraction.isPressed("KeyA")

		if (wIsPressed || sIsPressed || dIsPressed || aIsPressed) {
			let movementAccelerationAngle = - PI / 2

			if (sIsPressed) movementAccelerationAngle += PI

			if (dIsPressed) {
				     if (wIsPressed) movementAccelerationAngle += PI / 4
				else if (sIsPressed) movementAccelerationAngle -= PI / 4
				else                 movementAccelerationAngle += PI / 2
			} else if (aIsPressed) {
				     if (wIsPressed) movementAccelerationAngle -= PI / 4
				else if (sIsPressed) movementAccelerationAngle += PI / 4
				else                 movementAccelerationAngle -= PI / 2
			}

			shipAcceleration.x = this.movementAcceleration * cos(movementAccelerationAngle)
			shipAcceleration.y = this.movementAcceleration * sin(movementAccelerationAngle)
		} else {
			shipAcceleration.x = 0
			shipAcceleration.y = 0
		}
	}
}

class PlayerBounceOnCanvasEdges extends Trait {
	onInitialize(canvas, speedFactorAfterBounce = 0.5) {
		this.canvas = canvas
		this.speedFactorAfterBounce = speedFactorAfterBounce
	}

	onUpdate() {
		const shipPosition = this.link.Transform
		const shipSpeed = this.link.ForceBasedMovement.speed

		     if (shipPosition.y < 0)                  { shipPosition.y = 0                  ; shipSpeed.y *= -this.speedFactorAfterBounce }
		else if (this.canvas.height < shipPosition.y) { shipPosition.y = this.canvas.height ; shipSpeed.y *= -this.speedFactorAfterBounce }

		     if (shipPosition.x < 0)                 { shipPosition.x = 0                 ; shipSpeed.x *= -this.speedFactorAfterBounce }
		else if (this.canvas.width < shipPosition.x) { shipPosition.x = this.canvas.width ; shipSpeed.x *= -this.speedFactorAfterBounce }
	}
}

// -----------------------------------------------------------------

const graphics = canvas.getContext("2d")
const universe = new Universe()

universe.run()

const canvasEraser = universe.add(class CanvasEraser extends Link {
	onInitialize() {
		this.add(CanvasErasing, graphics)
	}
})

const userInteractor = universe.add(class UserInteractor extends Link {
	onInitialize() {
		this.add(UserInteraction, canvas)
	}
})

const interactionLogger = universe.add(class InteractionLogger extends Link {
	onInitialize() {
		this.add(InteractionLogging, userInteractor.UserInteraction, graphics)
	}
})

/*
const player = universe.add(class Player extends Link {
	onInitialize() {
		this.add(Transform, 250, 250)
		this.add(ForceBasedMovement)
		this.add(PlayerMovementController, userInteractor.UserInteraction, 600)
		this.add(DraftShipCanvasRender, graphics)
		this.add(PlayerBounceOnCanvasEdges, canvas)
	}
})
*/

class DummyMovement extends Trait {
	onInitialize(userInteraction, controlKeys, speed = 10) {
		this.userInteraction = userInteraction
		this.speed = speed
		this.upKey = controlKeys[0]
		this.leftKey = controlKeys[1]
		this.downKey = controlKeys[2]
		this.rightKey = controlKeys[3]
	}

	onUpdate() {
		const position = this.link.Transform

		if (this.userInteraction.isPressed(this.upKey))    position.y -= this.speed * this.universe.tickTime
		if (this.userInteraction.isPressed(this.downKey))  position.y += this.speed * this.universe.tickTime

		if (this.userInteraction.isPressed(this.leftKey))  position.x -= this.speed * this.universe.tickTime
		if (this.userInteraction.isPressed(this.rightKey)) position.x += this.speed * this.universe.tickTime
	}
}

class CircleBlobCanvasRender extends Trait {
	onInitialize(graphics, radius) {
		this.graphics = graphics
		this.radius = radius
	}

	onUpdate() {
		this.graphics.applyTransform(this.link.Transform)

		this.graphics.fillStyle = WHITE
		this.graphics.beginPath()
		this.graphics.arc(0, 0, this.radius, -PI, PI)
		this.graphics.fill()

		this.graphics.resetTransform()
	}
}

class RectangleBlobCanvasRender extends Trait {
	onInitialize(graphics, width, height) {
		this.graphics = graphics
		this.width = width
		this.height = height
	}

	onUpdate() {
		this.graphics.applyTransform(this.link.Transform)

		this.graphics.fillStyle = WHITE
		this.graphics.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)

		this.graphics.resetTransform()
	}
}

class ConvexPolygonBlobCanvasRender extends Trait {
	onInitialize(graphics, points) {
		this.graphics = graphics
		this.points = points
	}

	onUpdate() {
		this.graphics.applyTransform(this.link.Transform)

		this.graphics.fillStyle = WHITE
		this.graphics.beginPath()
		this.graphics.moveTo(this.points[0], this.points[1])

		for (let i = 2, c = this.points.length; i < c; i += 2) {
			this.graphics.lineTo(this.points[i], this.points[i + 1])
		}

		this.graphics.closePath()
		this.graphics.fill()

		this.graphics.resetTransform()
	}
}

universe.add(class PointBlob extends Link {
	onInitialize() {
		this.name = "P0"
		this.Transform = userInteractor.UserInteraction.mousePosition
		this.collider = this.add(PointCollider)
	}
})

for (let [ name, x, y, keys ] of [
	[ "C1", 350, 250, [ "Digit2", "KeyQ", "KeyW", "KeyE" ] ],
	[ "C2", 350, 320, [ "KeyS", "KeyZ", "KeyX", "KeyC" ] ]
]) universe.add(class CircleBlob extends Link {
	onInitialize() {
		this.name = name
		this.add(Transform, x, y)
		this.add(DummyMovement, userInteractor.UserInteraction, keys, 15)
		this.collider = this.add(CircleCollider, 20)
		this.add(CircleBlobCanvasRender, graphics, 20)
	}
})

for (let [ name, x, y, keys ] of [
	[ "R1", 420, 250, [ "Digit5", "KeyR", "KeyT", "KeyY" ] ],
	[ "R2", 420, 320, [ "KeyG", "KeyV", "KeyB", "KeyN" ] ]
]) universe.add(class RectangleBlob extends Link {
	onInitialize() {
		this.name = name
		this.add(Transform, x, y)
		this.add(DummyMovement, userInteractor.UserInteraction, keys, 15)
		this.collider = this.add(RectangleCollider, 50, 30)
		this.add(RectangleBlobCanvasRender, graphics, 50, 30)
	}
})

for (let [ name, x, y, keys ] of [
	[ "G1", 490, 250, [ "Digit8", "KeyU", "KeyI", "KeyO" ] ],
	[ "G2", 490, 320, [ "KeyK", "KeyM", "Comma", "Period" ] ]
]) universe.add(class ConvexPolygonBlob extends Link {
	onInitialize() {
		this.name = name
		this.add(Transform, x, y)
		this.add(DummyMovement, userInteractor.UserInteraction, keys, 15)
		this.collider = this.add(ConvexPolygonCollider, [ 20,0 , 5,15 , -10,10 , -10,-10 , 5,-15 ])
		this.add(ConvexPolygonBlobCanvasRender, graphics, [ 20,0 , 5,15 , -10,10 , -10,-10 , 5,-15 ])
	}
})

class CollisionLogging extends Trait {
	onInitialize(graphics) {
		this.graphics = graphics
	}

	onUpdate() {
		const collidingObjects = Array.from(this.universe.links).filter(it => it.name)

		this.graphics.fillStyle = WHITE
		this.graphics.font = "12pt Source Code Pro"

		let i = 0
		for (const a of collidingObjects)
		for (const b of collidingObjects) if (a != b) {
			if (a.collider.collidesWith(b.collider)) {
				this.graphics.fillText(`'${a.name}' collides with '${b.name}'.`, 650, 50 + ++i * 25)
			}
		}
	}
}

const collisionLogger = universe.add(class CollisionLogger extends Link {
	onInitialize() {
		this.add(CollisionLogging, graphics)
	}
})
