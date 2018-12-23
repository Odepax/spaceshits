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

const Collision = {
	testCircles(circle1X, circle1Y, circle1Radius, circle2X, circle2Y, circle2Radius) {
		return square(circle2X - circle1X) + square(circle2Y - circle1Y) < square(circle2Radius + circle1Radius)
	},

	testUnrotatedRectangles(rectangle1Left, rectangle1Top, rectangle1Right, rectangle1Bottom, rectangle2Left, rectangle2Top, rectangle2Right, rectangle2Bottom) {
		return !(
			   rectangle1Right  < rectangle2Left || rectangle2Right  < rectangle1Left
			|| rectangle1Bottom < rectangle2Top  || rectangle2Bottom < rectangle1Top
		)
	},

	testRotatedConvexPolygonWithCircle(polygonPoints, circleX, circleY, circleRadius) {
		const polygonProjectionAxes = this.getNormals(polygonPoints)

		for (let i = 0, c = polygonProjectionAxes.length; i < c; i += 2) {
			const projectionAxisX = polygonProjectionAxes[i]
			const projectionAxisY = polygonProjectionAxes[i + 1]

			if (this.polygonAndCircleProjectionHasAGap(polygonPoints, circleX, circleY, circleRadius, projectionAxisX, projectionAxisY)) {
				return false
			}
		}

		return true;
	},

	testRotatedConvexPolygons(polygon1Points, polygon2Points) {
		const polygon1ProjectionAxes = this.getNormals(polygon1Points)

		for (let i = 0, c = polygon1ProjectionAxes.length; i < c; i += 2) {
			const projectionAxisX = polygon1ProjectionAxes[i]
			const projectionAxisY = polygon1ProjectionAxes[i + 1]

			if (this.polygonsProjectionHasAGap(polygon1Points, polygon2Points, projectionAxisX, projectionAxisY)) {
				return false
			}
		}

		const polygon2ProjectionAxes = this.getNormals(polygon2Points)

		for (let i = 0, c = polygon2ProjectionAxes.length; i < c; i += 2) {
			const projectionAxisX = polygon2ProjectionAxes[i]
			const projectionAxisY = polygon2ProjectionAxes[i + 1]

			if (this.polygonsProjectionHasAGap(polygon1Points, polygon2Points, projectionAxisX, projectionAxisY)) {
				return false
			}
		}

		return true;
	},

	getNormals(polygonPoints) {
		const normalVectors = []

		for (let i = 0, c = polygonPoints.length - 2; i < c; i += 2) {
			// Left-hand normal (x:y => -y:x).
			normalVectors.push(
				polygonPoints[i + 1] - polygonPoints[i + 3],
				polygonPoints[i + 2] - polygonPoints[i]
			)
		}

		return normalVectors
	},

	polygonsProjectionHasAGap(polygon1Points, polygon2Points, projectionAxisX, projectionAxisY) {
		const [ polygon1ProjectionMin, polygon1ProjectionMax ] = this.projectPolygon(polygon1Points, projectionAxisX, projectionAxisY)
		const [ polygon2ProjectionMin, polygon2ProjectionMax ] = this.projectPolygon(polygon2Points, projectionAxisX, projectionAxisY)

		return polygon1ProjectionMax < polygon2ProjectionMin || polygon2ProjectionMax < polygon1ProjectionMin
	},

	polygonAndCircleProjectionHasAGap(polygonPoints, circleX, circleY, circleRadius, projectionAxisX, projectionAxisY) {
		const [ polygonProjectionMin, polygonProjectionMax ] = this.projectPolygon(polygonPoints, projectionAxisX, projectionAxisY)
		const [ circleProjectionMin, circleProjectionMax ] = this.projectCircle(circleX, circleY, circleRadius, projectionAxisX, projectionAxisY)

		return polygonProjectionMax < circleProjectionMin || circleProjectionMax < polygonProjectionMin
	},

	projectPolygon(polygonPoints, baseVectorX, baseVectorY) {
		let min = polygonPoints[0] * baseVectorX + polygonPoints[1] * baseVectorY // Dot product.
		let max = min

		for (let i = 2, c = polygonPoints.length; i < c; i += 2) {
			const projection = polygonPoints[i] * baseVectorX + polygonPoints[i + 1] * baseVectorY // Dot product.

			     if (projection < min) min = projection
			else if (max < projection) max = projection
		}

		return [ min, max ]
	},

	projectCircle(circleX, circleY, circleRadius, baseVectorX, baseVectorY) {
		const projection = circleX * baseVectorX + circleY * baseVectorY // Dot product.
		const baseVectorLength = sqrt(baseVectorX * baseVectorX + baseVectorY * baseVectorY)

		return [ projection - circleRadius * baseVectorLength, projection + circleRadius * baseVectorLength ]
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

class CircleCollider extends Collider {
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

class ConvexPolygonCollider extends Collider {
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

// -----------------------------------------------------------------

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

// -----------------------------------------------------------------

class CanvasErasing extends Trait {
	onInitialize(graphics) {
		this.graphics = graphics
	}

	onUpdate() {
		this.graphics.clearRect(0, 0, this.graphics.canvas.width, this.graphics.canvas.height)
	}
}

class Image2dRender extends Trait {
	onInitialize(graphics, imagePath, centerX, centerY) {
		this.graphics = graphics
		this.image = new Image().apply(image => image.src = imagePath)
		this.centerX = -centerX
		this.centerY = -centerY
	}

	onUpdate() {
		this.graphics.applyTransform(this.link.Transform)
		this.graphics.drawImage(this.image, this.centerX, this.centerY)
		this.graphics.resetTransform()
	}
}

class ZombieCube2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize(graphics, "./asset/cube.zombie.svg", 21, 21)
	}
}

class AkimboCube2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize(graphics, "./asset/cube.dualgun.svg", 21, 21)
	}
}

class CrossCube2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize(graphics, "./asset/cube.quadgun.svg", 21, 21)
	}
}

class HighSpeedCube2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize(graphics, "./asset/cube.highspeed.svg", 21, 21)
	}
}

class CubeExplosionShard2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize(graphics, "./asset/projectile.shard.svg", 18.3, 7)
	}
}

class CubeBullet2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize(graphics, "./asset/projectile.cubeblaster.svg", 8, 8)
	}
}

class CubeHighSpeedBullet2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize(graphics, "./asset/projectile.highspeed.svg", 8, 8)
	}
}

class PlayerShip2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize(graphics, "./asset/player.ship.svg", 29, 31.2)
	}
}

class GatlingBullet2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize(graphics, "./asset/projectile.gatling.svg", 16, 4)
	}
}

// -----------------------------------------------------------------

class HealthBar2dRender extends Trait {
	onInitialize(graphics) {
		this.graphics = graphics
	}

	onUpdate() {
		const { health, maxHealth } = this.link.Destroyable

		this.graphics.applyTransform(this.link.Transform, false)

		this.graphics.fillStyle = RED
		this.graphics.fillRect(-30, 40, 60, 8)

		this.graphics.fillStyle = GREEN
		this.graphics.fillRect(-30, 40, 60 * health / maxHealth, 8)

		this.graphics.resetTransform()
	}
}

// -----------------------------------------------------------------

class Projectile extends Link {
	onInitialize(transform, speed, radius, targetTag, damage) {
		this.Transform = transform

		this.add(AngularLinearMovement, transform.a, speed)

		this.Collider = this.add(CircleCollider, radius)

		this.add(Ephemeral, 2)
		this.add(InstantRammingDamage, targetTag, damage)
	}
}

class PlayerBullet extends Projectile {
	onInitialize(transform) {
		super.onInitialize(transform, 1000, 4, Tag.enemy, 10)

		this.add(GatlingBullet2dRender, graphics)
	}
}

class CubeBullet extends Projectile {
	onInitialize(transform) {
		super.onInitialize(transform, 500, 7, Tag.player, 10)

		this.add(CubeBullet2dRender, graphics)
	}
}

class CubeHighSpeedBullet extends Projectile {
	onInitialize(transform) {
		super.onInitialize(transform, 500, 7, Tag.player, 20)

		this.add(CubeHighSpeedBullet2dRender, graphics)
	}
}

class CubeExplosionShard extends Projectile {
	onInitialize(transform) {
		super.onInitialize(transform, 600, 6, Tag.player, 10)

		this.add(CubeExplosionShard2dRender, graphics)
	}
}

// -----------------------------------------------------------------

class PlayerMovementController extends Trait {
	onInitialize(userInteraction, canvas, movementAcceleration = 1000, speedFactorAfterBounce = 0.5) {
		this.userInteraction = userInteraction
		this.canvas = canvas

		this.movementAcceleration = movementAcceleration
		this.speedFactorAfterBounce = speedFactorAfterBounce
	}

	onUpdate() {
		const targetPosition = this.userInteraction.mousePosition
		const shipPosition = this.link.Transform
		const { speed: shipSpeed, acceleration: shipAcceleration} = this.link.ForceBasedMovement

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

		     if (shipPosition.y < 0)                  { shipPosition.y = 0                  ; shipSpeed.y *= -this.speedFactorAfterBounce }
		else if (this.canvas.height < shipPosition.y) { shipPosition.y = this.canvas.height ; shipSpeed.y *= -this.speedFactorAfterBounce }

		     if (shipPosition.x < 0)                 { shipPosition.x = 0                 ; shipSpeed.x *= -this.speedFactorAfterBounce }
		else if (this.canvas.width < shipPosition.x) { shipPosition.x = this.canvas.width ; shipSpeed.x *= -this.speedFactorAfterBounce }
	}
}

class PlayerGun extends Trait {
	onInitialize(userInteraction, fireRate = 0.1) {
		this.userInteraction = userInteraction
		this.fireRate = fireRate
		this.timeEnlapsed = 0
	}

	onUpdate() {
		this.timeEnlapsed += this.universe.tickTime

		if (this.fireRate < this.timeEnlapsed && this.userInteraction.isPressed("MouseLeft")) {
			this.timeEnlapsed = 0
			this.universe.add(PlayerBullet, this.link.Transform.clone().relativeOffset(30, 12))
		}
	}
}

// -----------------------------------------------------------------

class CubeMovementController extends Trait {
	onInitialize(canvas) {
		this.canvas = canvas
		this.rotationSpeed = randBetween(-1, 1)
	}

	onUpdate() {
		const cubePosition = this.link.Transform
		const cubeSpeed = this.link.LinearMovement

		     if (cubePosition.y < 0)                  { cubePosition.y = 0                  ; cubeSpeed.speedY *= -1 }
		else if (this.canvas.height < cubePosition.y) { cubePosition.y = this.canvas.height ; cubeSpeed.speedY *= -1 }

		     if (cubePosition.x < 0)                 { cubePosition.x = 0                 ; cubeSpeed.speedX *= -1 }
		else if (this.canvas.width < cubePosition.x) { cubePosition.x = this.canvas.width ; cubeSpeed.speedX *= -1 }

		cubePosition.a += this.rotationSpeed * this.universe.tickTime
	}
}

class ContinuousRammingDamage extends Trait {
	onInitialize(targetTag, damage) {
		this.targetTag = targetTag
		this.damage = damage
	}

	onUpdate() {
		for (const target of this.universe.links) {
			if (target[this.targetTag] && this.link.Collider.collidesWith(target.Collider)) {
				target.Destroyable.health -= this.damage * this.universe.tickTime
			}
		}
	}
}

class InstantRammingDamage extends Trait {
	onInitialize(targetTag, damage) {
		this.targetTag = targetTag
		this.damage = damage
	}

	onUpdate() {
		for (const target of this.universe.links) {
			if (target[this.targetTag] && this.link.Collider.collidesWith(target.Collider)) {
				target.Destroyable.health -= this.damage

				this.universe.remove(this.link)
			}
		}
	}
}

class CubeDualGun extends Trait {
	onInitialize(fireRate = 2) {
		this.fireRate = fireRate
		this.timeEnlapsed = 0
	}

	onUpdate() {
		this.timeEnlapsed += this.universe.tickTime

		if (this.fireRate < this.timeEnlapsed) {
			this.timeEnlapsed = 0

			const cubePosition = this.link.Transform

			this.universe.add(CubeBullet, cubePosition.clone().apply(it => it.a += PI / 4))
			this.universe.add(CubeBullet, cubePosition.clone().apply(it => it.a += -3 * PI / 4))
		}
	}
}

class CubeHighSpeedGun extends Trait {
	onInitialize(fireRate = 2) {
		this.fireRate = fireRate
		this.timeEnlapsed = 0
	}

	onUpdate() {
		this.timeEnlapsed += this.universe.tickTime

		if (this.fireRate < this.timeEnlapsed) {
			this.timeEnlapsed = 0

			const cubePosition = this.link.Transform

			this.universe.add(CubeHighSpeedBullet, cubePosition.clone().apply(it => it.a))
			this.universe.add(CubeHighSpeedBullet, cubePosition.clone().apply(it => it.a += PI))
		}
	}
}

class CubeQuadGun extends Trait {
	onInitialize(fireRate = 2) {
		this.fireRate = fireRate
		this.timeEnlapsed = 0
	}

	onUpdate() {
		this.timeEnlapsed += this.universe.tickTime

		if (this.fireRate < this.timeEnlapsed) {
			this.timeEnlapsed = 0

			const cubePosition = this.link.Transform

			for (let i = 0; i < 4; ++i) {
				this.universe.add(CubeBullet, cubePosition.clone().apply(it => it.a += i * PI / 2 + PI / 4))
			}
		}
	}
}

class CubeExplosionOnDeath extends Trait {
	onRemoved() {
		for (let i = 0; i < 6; ++i) {
			this.universe.add(CubeExplosionShard, this.link.Transform.clone().apply(it => it.a = i * PI / 3))
		}
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
		this.graphics.fillText(`FPS ...................... ${~~(0.5 + 1 / this.universe.tickTime)}`, 50, 50 + ++i * 25)
		this.graphics.fillText(`Link count ............... ${this.universe.links.size}`, 50, 50 + ++i * 25)
		this.graphics.fillText(`Trait count .............. ${this.universe.traits.size}`, 50, 50 + ++i * 25)
	}
}

// -----------------------------------------------------------------

const Tag = {
	player: Symbol("Tag/Link: Player"),
	enemy: Symbol("Tag/Link: Enemy")
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

const player = universe.add(class Player extends Link {
	onInitialize() {
		this[Tag.player] = true

		this.add(Transform, canvas.width / 2, canvas.height / 2)

		this.add(ForceBasedMovement)
		this.add(PlayerMovementController, userInteractor.UserInteraction, canvas)

		this.add(PlayerGun, userInteractor.UserInteraction)

		this.Collider = this.add(CircleCollider, 27)
		this.add(Destroyable, 100)

		this.add(PlayerShip2dRender, graphics)
		this.add(HealthBar2dRender, graphics)
	}
})

class Cube extends Link {
	onInitialize(x, y, radius = 22, damage = 100, health = 100, maxSpeed = 400) {
		this[Tag.enemy] = true

		this.add(Transform, x, y, rand(-PI, PI))
		this.add(LinearMovement, rand(-maxSpeed, maxSpeed), rand(-maxSpeed, maxSpeed))
		this.add(CubeMovementController, canvas)

		this.Collider = this.add(CircleCollider, radius)
		this.add(ContinuousRammingDamage, Tag.player, damage)

		this.add(Destroyable, health)
		this.add(CubeExplosionOnDeath)
	}
}

class ZombieCube extends Cube {
	onInitialize(x, y) {
		super.onInitialize(x, y)

		this.add(ZombieCube2dRender, graphics)
		this.add(HealthBar2dRender, graphics)
	}
}

class AkimboCube extends Cube {
	onInitialize(x, y) {
		super.onInitialize(x, y)

		this.add(CubeDualGun, rand(2, 4))

		this.add(AkimboCube2dRender, graphics)
		this.add(HealthBar2dRender, graphics)
	}
}

class CrossCube extends Cube {
	onInitialize(x, y) {
		super.onInitialize(x, y)

		this.add(CubeQuadGun, rand(2, 4))

		this.add(CrossCube2dRender, graphics)
		this.add(HealthBar2dRender, graphics)
	}
}

class HighSpeedCube extends Cube {
	onInitialize(x, y) {
		super.onInitialize(x, y, 22, 200, 100, 800)

		this.add(CubeHighSpeedGun, rand(2, 4))

		this.add(HighSpeedCube2dRender, graphics)
		this.add(HealthBar2dRender, graphics)
	}
}

for (let i = 0, c = ~~(new URLSearchParams(location.search).get("cubes")) || 10; i < c; ++i) {
	universe.add(
		randBetween(ZombieCube, AkimboCube, CrossCube, HighSpeedCube),
		rand(0, canvas.width),
		rand(0, canvas.height)
	)
}
