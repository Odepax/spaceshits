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

class UserInteractor extends Link {
	onInitialize() {
		this.add(UserInteraction, this.universe[Global.canvas])
	}
}

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

		document.addEventListener("mouseup", event => {
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

		document.addEventListener("keyup", event => {
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

class WeaponEnergy extends Trait {
	onInitialize(energy, energyRegeneration = 30) {
		this.userInteraction = this.universe[Global.userInteraction]
		this.shootKey = this.universe[Global.keyShoot]

		this.energy = energy
		this.maxEnergy = energy
		this.energyRegeneration = energyRegeneration
	}

	onUpdate() {
		if (this.energy < this.maxEnergy && !this.userInteraction.isPressed(this.shootKey)) {
			this.energy += this.energyRegeneration * this.universe.tickTime
		}
	}
}

class CapacityEnergy extends Trait {
	onInitialize(energy, energyRegeneration = 20) {
		this.userInteraction = this.universe[Global.userInteraction]
		this.capacityKey = this.universe[Global.keySpecial]

		this.energy = 0
		this.maxEnergy = energy
		this.energyRegeneration = energyRegeneration
	}

	onUpdate() {
		if (this.energy < this.maxEnergy && !this.userInteraction.isPressed(this.capacityKey)) {
			this.energy += this.energyRegeneration * this.universe.tickTime
		}
	}
}

// -----------------------------------------------------------------

class Image2dRender extends Trait {
	onInitialize(imagePath, centerX, centerY) {
		this.graphics = this.universe[Global.graphics]
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
		super.onInitialize("./asset/cube.zombie.svg", 21, 21)
	}
}

class AkimboCube2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize("./asset/cube.dualgun.svg", 21, 21)
	}
}

class CrossCube2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize("./asset/cube.quadgun.svg", 21, 21)
	}
}

class HighSpeedCube2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize("./asset/cube.highspeed.svg", 21, 21)
	}
}

class SplittingCube2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize("./asset/cube.splitting.svg", 32, 32)
	}
}

class SplitOffspringCube2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize(randBetween(
			"./asset/cube.splitoffspring1.svg",
			"./asset/cube.splitoffspring2.svg"
		), 16, 16)
	}
}

class CubeFactory2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize("./asset/cube.factory.svg", 49, 44)
	}
}

class CrashCrab2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize("./asset/cube.crashcrab.svg", 13, 15)
	}
}

class CubeExplosionShard2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize("./asset/projectile.shard.svg", 18.3, 7)
	}
}

class CubeBullet2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize("./asset/projectile.cubeblaster.svg", 8, 8)
	}
}

class CubeHighSpeedBullet2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize("./asset/projectile.highspeed.svg", 8, 8)
	}
}

class PlayerShip2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize("./asset/player.ship.svg", 28.1, 31.1)
	}
}

class GatlingGun2dRender extends Image2dRender {
	onInitialize() {
		super.onInitialize("./asset/player.gatling.svg", 18, 3.5)
	}
}

class GatlingBullet2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize("./asset/projectile.gatling.svg", 16, 4)
	}
}

class BlasterGun2dRender extends Image2dRender {
	onInitialize() {
		super.onInitialize("./asset/player.blaster.svg", 12, 3)
	}
}

class BlasterBullet2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize("./asset/projectile.blaster.svg", 22, 10)
	}
}

class ShotgunGun2dRender extends Image2dRender {
	onInitialize() {
		super.onInitialize("./asset/player.shotgun.svg", 15, 3.3)
	}
}

class ShotgunBullet2dRender extends Image2dRender {
	onInitialize(graphics) {
		super.onInitialize("./asset/projectile.shotgun.svg", 16, 10)
	}
}

// -----------------------------------------------------------------

class Shield2dRender extends Trait {
	onInitialize(radius) {
		this.graphics = this.universe[Global.graphics]
		this.radius = radius
	}

	onUpdate() {
		this.graphics.applyTransform(this.link.Transform)
		const { health, maxHealth, } = this.link.Destroyable

		this.graphics.beginPath()
		this.graphics.arc(0, 0, this.radius, 0, 2 * PI)

		this.graphics.fillStyle = BLUE
		this.graphics.globalAlpha = 0.3 * health / maxHealth
		this.graphics.fill()
		this.graphics.globalAlpha = 1

		this.graphics.resetTransform()
	}
}

// -----------------------------------------------------------------

class HealthBar2dRender extends Trait {
	onInitialize() {
		this.graphics = this.universe[Global.graphics]
	}

	onUpdate() {
		const { health, maxHealth } = this.link.Destroyable

		if (health < maxHealth) {
			this.graphics.applyTransform(this.link.Transform, false)

			this.graphics.fillStyle = BLACK
			this.graphics.fillRect(-22, 34, 44, 8)

			this.graphics.fillStyle = RED
			this.graphics.fillRect(-20, 36, 40, 4)

			this.graphics.fillStyle = GREEN
			this.graphics.fillRect(-20, 36, 40 * health / maxHealth, 4)

			this.graphics.resetTransform()
		}
	}
}

class PlayerHealthBar2dRender extends Trait {
	onInitialize() {
		this.graphics = this.universe[Global.graphics]
	}

	onUpdate() {
		const { health, maxHealth } = this.link.Destroyable

		if (health < maxHealth) {
			this.graphics.applyTransform(this.link.Transform)

			this.graphics.beginPath()
			this.graphics.arc(20, -11, 12, -PI / 2, PI / 2)

			this.graphics.lineWidth = 3
			this.graphics.strokeStyle = RED
			this.graphics.stroke()

			this.graphics.beginPath()
			this.graphics.arc(20, -11, 12, (health / maxHealth) * -PI / 2, (health / maxHealth) * PI / 2)

			this.graphics.strokeStyle = GREEN
			this.graphics.stroke()

			this.graphics.resetTransform()
		}
	}
}

class PlayerWeaponEnergyBar2dRender extends Trait {
	onInitialize() {
		this.graphics = this.universe[Global.graphics]
	}

	onUpdate() {
		const { energy, maxEnergy } = this.link.WeaponEnergy

		if (energy < maxEnergy) {
			this.graphics.applyTransform(this.link.Transform)

			this.graphics.beginPath()
			this.graphics.arc(20, -11, 17, -PI / 3, PI / 3)

			this.graphics.lineWidth = 3
			this.graphics.strokeStyle = RED
			this.graphics.stroke()

			this.graphics.beginPath()
			this.graphics.arc(20, -11, 17, (energy / maxEnergy) * -PI / 3, (energy / maxEnergy) * PI / 3)

			this.graphics.strokeStyle = YELLOW
			this.graphics.stroke()

			this.graphics.resetTransform()
		}
	}
}

class PlayerCapacityEnergyBar2dRender extends Trait {
	onInitialize() {
		this.graphics = this.universe[Global.graphics]
	}

	onUpdate() {
		const { energy, maxEnergy } = this.link.CapacityEnergy

		if (energy < maxEnergy) {
			this.graphics.applyTransform(this.link.Transform)

			this.graphics.beginPath()
			this.graphics.arc(20, -11, 22, -PI / 4, PI / 4)

			this.graphics.lineWidth = 3
			this.graphics.strokeStyle = RED
			this.graphics.stroke()

			this.graphics.beginPath()
			this.graphics.arc(20, -11, 22, (energy / maxEnergy) * -PI / 4, (energy / maxEnergy) * PI / 4)

			this.graphics.strokeStyle = BLUE
			this.graphics.stroke()

			this.graphics.resetTransform()
		}
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

class GatlingBullet extends Projectile {
	onInitialize(transform) {
		super.onInitialize(transform, 1000, 4, Tag.enemy, 10 * this.universe[Global.playerDamageFactor])

		this.add(GatlingBullet2dRender)
	}
}

class BlasterBullet extends Projectile {
	onInitialize(transform) {
		super.onInitialize(transform, 900, 8, Tag.enemy, 20 * this.universe[Global.playerDamageFactor])

		this.add(BlasterBullet2dRender)
	}
}

class ShotgunBullet extends Projectile {
	onInitialize(transform) {
		super.onInitialize(transform, 800, 4, Tag.enemy, 15 * this.universe[Global.playerDamageFactor])

		this.add(ShotgunBullet2dRender)
	}
}

class CubeBullet extends Projectile {
	onInitialize(transform) {
		super.onInitialize(transform, 500, 7, Tag.player, 10)

		this.add(CubeBullet2dRender)
	}
}

class CubeHighSpeedBullet extends Projectile {
	onInitialize(transform) {
		super.onInitialize(transform, 500, 7, Tag.player, 20)

		this.add(CubeHighSpeedBullet2dRender)
	}
}

class CubeExplosionShard extends Projectile {
	onInitialize(transform) {
		super.onInitialize(transform, 600, 6, Tag.player, 10)

		this.add(CubeExplosionShard2dRender)
	}
}

// -----------------------------------------------------------------

class PlayerMovementController extends Trait {
	onInitialize(movementAcceleration = 1000, speedFactorAfterBounce = 0.5) {
		this.canvas = this.universe[Global.canvas]
		this.userInteraction = this.universe[Global.userInteraction]
		this.moveUpKey = this.universe[Global.keyMoveUp]
		this.moveLeftKey = this.universe[Global.keyMoveLeft]
		this.moveDownKey = this.universe[Global.keyMoveDown]
		this.moveRightKey = this.universe[Global.keyMoveRight]

		this.movementAcceleration = movementAcceleration
		this.speedFactorAfterBounce = speedFactorAfterBounce
	}

	onUpdate() {
		const targetPosition = this.userInteraction.mousePosition
		const shipPosition = this.link.Transform
		const { speed: shipSpeed, acceleration: shipAcceleration} = this.link.ForceBasedMovement

		shipPosition.a = shipPosition.angleToward(targetPosition)

		const moveUpKeyIsPressed = this.userInteraction.isPressed(this.moveUpKey)
		const moveLeftKeyIsPressed = this.userInteraction.isPressed(this.moveLeftKey)
		const moveDownKeyIsPressed = this.userInteraction.isPressed(this.moveDownKey)
		const moveRightKeyIsPressed = this.userInteraction.isPressed(this.moveRightKey)

		if (moveUpKeyIsPressed || moveDownKeyIsPressed || moveRightKeyIsPressed || moveLeftKeyIsPressed) {
			let movementAccelerationAngle = - PI / 2

			if (moveDownKeyIsPressed) movementAccelerationAngle += PI

			if (moveRightKeyIsPressed) {
				     if (moveUpKeyIsPressed)   movementAccelerationAngle += PI / 4
				else if (moveDownKeyIsPressed) movementAccelerationAngle -= PI / 4
				else                           movementAccelerationAngle += PI / 2
			} else if (moveLeftKeyIsPressed) {
				     if (moveUpKeyIsPressed)   movementAccelerationAngle -= PI / 4
				else if (moveDownKeyIsPressed) movementAccelerationAngle += PI / 4
				else                           movementAccelerationAngle -= PI / 2
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
	onInitialize(fireRate = 0.5, shotEnergyConsumption = 10) {
		this.userInteraction = this.universe[Global.userInteraction]
		this.shootKey = this.universe[Global.keyShoot]
		this.fireRate = fireRate * this.universe[Global.playerFirerateFactor]
		this.shotEnergyConsumption = shotEnergyConsumption
		this.timeEnlapsed = 0
	}

	onUpdate() {
		const weaponEnergy = this.link.WeaponEnergy

		this.timeEnlapsed += this.universe.tickTime

		if (this.fireRate < this.timeEnlapsed && this.userInteraction.isPressed(this.shootKey) && this.shotEnergyConsumption < weaponEnergy.energy) {
			this.timeEnlapsed = 0
			weaponEnergy.energy -= this.shotEnergyConsumption

			this.fire()
		}
	}
}

class GatlingGun extends PlayerGun {
	onInitialize(fireRate = 0.1) {
		super.onInitialize(fireRate, 2)
	}

	fire() {
		this.universe.add(GatlingBullet, this.link.Transform.clone().relativeOffset(30, 12))
	}
}

class BlasterGun extends PlayerGun {
	onInitialize(fireRate = 0.3) {
		super.onInitialize(fireRate, 4)
	}

	fire() {
		this.universe.add(BlasterBullet, this.link.Transform.clone().relativeOffset(30, 12))
	}
}

class ShotgunGun extends PlayerGun {
	onInitialize(fireRate = 0.3, spreadAngle = PI / 16) {
		super.onInitialize(fireRate, 12)
		this.spreadAngle = spreadAngle
	}

	fire() {
		for (let i = -this.spreadAngle; i < this.spreadAngle; i += this.spreadAngle * 2 / 3) {
			this.universe.add(ShotgunBullet, this.link.Transform.clone().relativeOffset(30, 12).apply(it => it.a += i))
		}
	}
}

// -----------------------------------------------------------------

class BlinkTeleportCapacity extends Trait {
	onInitialize() {
		this.userInteraction = this.universe[Global.userInteraction]
		this.capacityKey = this.universe[Global.keySpecial]
	}

	onUpdate() {
		const shipPosition = this.link.Transform
		const capacityEnergy = this.link.CapacityEnergy
		const mousePosition = this.userInteraction.mousePosition

		if (this.userInteraction.wasPressed(this.capacityKey) && capacityEnergy.maxEnergy < capacityEnergy.energy) {
			capacityEnergy.energy = 0
			shipPosition.x = mousePosition.x
			shipPosition.y = mousePosition.y
		}
	}
}

class RestaurationCapacity extends Trait {
	onInitialize() {
		this.userInteraction = this.universe[Global.userInteraction]
		this.capacityKey = this.universe[Global.keySpecial]
		this.remainingActivationTime = 0
	}

	onUpdate() {
		const destroyable = this.link.Destroyable
		const capacityEnergy = this.link.CapacityEnergy

		if (this.userInteraction.wasPressed(this.capacityKey) && capacityEnergy.maxEnergy < capacityEnergy.energy) {
			capacityEnergy.energy = 0
			destroyable.healthRegeneration = 10
			this.remainingActivationTime = 3
		}

		if (0 < this.remainingActivationTime) {
			this.remainingActivationTime -= this.universe.tickTime
		} else {
			destroyable.healthRegeneration = 0
		}
	}
}

class ShieldCapacity extends Trait {
	onInitialize() {
		this.userInteraction = this.universe[Global.userInteraction]
		this.capacityKey = this.universe[Global.keySpecial]
	}

	onUpdate() {
		const shipPosition = this.link.Transform
		const capacityEnergy = this.link.CapacityEnergy

		if (this.userInteraction.wasPressed(this.capacityKey) && capacityEnergy.maxEnergy < capacityEnergy.energy) {
			capacityEnergy.energy = 0
			this.universe.add(PlayerShield, shipPosition)
		}
	}
}

class PlayerShield extends Link {
	onInitialize(shieldedTarget) {
		this[Tag.player] = true

		this.Transform = shieldedTarget

		this.Collider = this.add(CircleCollider, 100)
		this.add(Destroyable, 100)
		this.add(Ephemeral, 3)

		this.add(Shield2dRender, 100)
	}
}

// -----------------------------------------------------------------

class CubeMovementController extends Trait {
	onInitialize() {
		this.canvas = this.universe[Global.canvas]
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

class CrashCrabMovementController extends Trait {
	onUpdate() {
		this.updateTarget()

		if (this.target) {
			const crabPosition = this.link.Transform
			const movement = this.link.AngularLinearMovement

			const a = crabPosition.angleToward(this.target.Transform)

			crabPosition.a = a
			movement.angle = a
		}
	}

	onRemoving() {
		const { x, y } = this.link.Transform
		const { width, height } = this.universe[Global.canvas]

		return x < 0 || width < x
		    || y < 0 || height < y
	}

	updateTarget() {
		if (!this.target || this.target.Destroyable.health < 0) {
			for (const link of this.universe.links) {
				if (link[Tag.player]) {
					return this.target = link
				}
			}

			this.target = null
		}
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

// -----------------------------------------------------------------

class CubeGun extends Trait {
	onInitialize(fireRate = 2) {
		this.fireRate = fireRate
		this.timeEnlapsed = 0
	}

	onUpdate() {
		this.timeEnlapsed += this.universe.tickTime

		if (this.fireRate < this.timeEnlapsed) {
			this.timeEnlapsed = 0

			this.fire()
		}
	}
}

class CubeDualGun extends CubeGun {
	fire() {
		const cubePosition = this.link.Transform

		this.universe.add(CubeBullet, cubePosition.clone().apply(it => it.a += PI / 4))
		this.universe.add(CubeBullet, cubePosition.clone().apply(it => it.a += -3 * PI / 4))
	}
}

class CubeQuadGun extends CubeGun {
	fire() {
		const cubePosition = this.link.Transform

		for (let i = 0; i < 4; ++i) {
			this.universe.add(CubeBullet, cubePosition.clone().apply(it => it.a += i * PI / 2 + PI / 4))
		}
	}
}

class CubeHighSpeedGun extends CubeGun {
	fire() {
		const cubePosition = this.link.Transform

		this.universe.add(CubeHighSpeedBullet, cubePosition.clone().apply(it => it.a))
		this.universe.add(CubeHighSpeedBullet, cubePosition.clone().apply(it => it.a += PI))
	}
}

class CrashCrabProductionLine extends CubeGun {
	fire() {
		const cubePosition = this.link.Transform

		const firstCrabPosition = cubePosition.clone().relativeAngularOffset(0, 62)
		const secondCrabPosition = cubePosition.clone().relativeAngularOffset(PI, 62)

		this.universe.add(CrashCrab, firstCrabPosition.x, firstCrabPosition.y, cubePosition.a)
		this.universe.add(CrashCrab, secondCrabPosition.x, secondCrabPosition.y, cubePosition.a + PI)
	}
}

class CubeExplosionOnDeath extends Trait {
	onRemoved() {
		for (let i = 0; i < 6; ++i) {
			this.universe.add(CubeExplosionShard, this.link.Transform.clone().apply(it => it.a = i * PI / 3))
		}
	}
}

class CubeSplitOnDeath extends Trait {
	onRemoved() {
		const cubePosition = this.link.Transform

		for (let i = 0; i < 4; ++i) {
			this.universe.add(SplitOffspringCube, cubePosition.x, cubePosition.y)
		}
	}
}

// -----------------------------------------------------------------

class InteractionLogger extends Link {
	onInitialize() {
		this.add(InteractionLogging)
	}
}

class InteractionLogging extends Trait {
	onInitialize() {
		this.userInteraction = this.universe[Global.userInteraction]
		this.graphics = this.universe[Global.graphics]
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

class Cube extends Link {
	onInitialize(x, y, radius = 22, damage = 100, health = 100, maxSpeed = 400) {
		this[Tag.enemy] = true

		this.add(Transform, x, y, rand(-PI, PI))
		this.add(LinearMovement, rand(-maxSpeed, maxSpeed), rand(-maxSpeed, maxSpeed))
		this.add(CubeMovementController)

		this.Collider = this.add(CircleCollider, radius)
		this.add(ContinuousRammingDamage, Tag.player, damage)

		this.add(Destroyable, health)
	}
}

class ZombieCube extends Cube {
	onInitialize(x, y) {
		super.onInitialize(x, y)

		this.add(CubeExplosionOnDeath)

		this.add(ZombieCube2dRender)
		this.add(HealthBar2dRender)
	}
}

class AkimboCube extends Cube {
	onInitialize(x, y) {
		super.onInitialize(x, y)

		this.add(CubeExplosionOnDeath)
		this.add(CubeDualGun, rand(2, 4))

		this.add(AkimboCube2dRender)
		this.add(HealthBar2dRender)
	}
}

class CrossCube extends Cube {
	onInitialize(x, y) {
		super.onInitialize(x, y)

		this.add(CubeExplosionOnDeath)
		this.add(CubeQuadGun, rand(2, 4))

		this.add(CrossCube2dRender)
		this.add(HealthBar2dRender)
	}
}

class HighSpeedCube extends Cube {
	onInitialize(x, y) {
		super.onInitialize(x, y, 22, 200, 100, 800)

		this.add(CubeHighSpeedGun, rand(2, 4))

		this.add(HighSpeedCube2dRender)
		this.add(HealthBar2dRender)
	}
}

class SplittingCube extends Cube {
	onInitialize(x, y) {
		super.onInitialize(x, y, 33, 100, 200)

		this.add(CubeSplitOnDeath)

		this.add(SplittingCube2dRender)
		this.add(HealthBar2dRender)
	}
}

class SplitOffspringCube extends Cube {
	onInitialize(x, y) {
		super.onInitialize(x, y, 17, 60)

		this.add(SplitOffspringCube2dRender)
		this.add(HealthBar2dRender)
	}
}

class CubeFactory extends Cube {
	onInitialize(x, y) {
		super.onInitialize(x, y, 48, 150, 300, 300)

		this.add(CrashCrabProductionLine, rand(4, 6))

		this.add(CubeFactory2dRender)
		this.add(HealthBar2dRender)
	}
}

class CrashCrab extends Link {
	onInitialize(x, y, a, radius = 14, damage = 100, health = 100, maxSpeed = 400) {
		this[Tag.enemy] = true

		this.add(Transform, x, y, a)
		this.add(AngularLinearMovement, a, rand(0, maxSpeed))
		this.add(CrashCrabMovementController)

		this.Collider = this.add(CircleCollider, radius)
		this.add(ContinuousRammingDamage, Tag.player, damage)

		this.add(Destroyable, health)

		this.add(CrashCrab2dRender)
		this.add(HealthBar2dRender)
	}
}

// -----------------------------------------------------------------

const Tag = {
	player: Symbol("Tag/Link: Player"),
	enemy: Symbol("Tag/Link: Enemy")
}

const Global = {
	canvas: Symbol("Global/Link: Universe canvas"),
	graphics: Symbol("Global/Link: Universe canvas graphics context"),
	userInteraction: Symbol("Global/Link: Universe user interaction"),

	keyMoveUp: Symbol("Global/Link: Move up key"),
	keyMoveLeft: Symbol("Global/Link: Move left key"),
	keyMoveDown: Symbol("Global/Link: Move down key"),
	keyMoveRight: Symbol("Global/Link: Move right key"),
	keyShoot: Symbol("Global/Link: Shoot key"),
	keySpecial: Symbol("Global/Link: Use special capacity key"),

	playerHealthFactor: Symbol("Global/Trait: Player health factor"),
	playerDamageFactor: Symbol("Global/Trait: Player damage factor"),
	playerFirerateFactor: Symbol("Global/Trait: Player fire rate factor"),
	playerAmmoCapFactor: Symbol("Global/Trait: Player ammo capacity factor"),
	playerAmmoRegenFactor: Symbol("Global/Trait: Player ammo regeneration factor"),
	playerAuxCapFactor: Symbol("Global/Trait: Player AUX capacity factor"),
	playerAuxRegenFactor: Symbol("Global/Trait: Player AUX regeneration factor")
}

// -----------------------------------------------------------------

class CanvasEraser extends Link {
	onInitialize() {
		this.add(CanvasErasing)
	}
}

class CanvasErasing extends Trait {
	onUpdate() {
		const canvas = this.universe[Global.canvas]
		const graphics = this.universe[Global.graphics]

		graphics.clearRect(0, 0, canvas.width, canvas.height)
	}
}

// -----------------------------------------------------------------

class Player extends Link {
	onInitialize(x, y, addGun, addCapacity) {
		this[Tag.player] = true

		this.add(Transform, x, y)

		this.add(ForceBasedMovement)
		this.add(PlayerMovementController)

		this.Collider = this.add(CircleCollider, 27)
		this.add(Destroyable, 100 * this.universe[Global.playerHealthFactor])
		this.add(WeaponEnergy, 100 * this.universe[Global.playerAmmoCapFactor], 30 * this.universe[Global.playerAmmoRegenFactor])
		this.add(CapacityEnergy, 100 * this.universe[Global.playerAuxCapFactor], 20 * this.universe[Global.playerAuxRegenFactor])

		this.add(PlayerShip2dRender)
		this.add(PlayerHealthBar2dRender)

		addGun(this)
		this.add(PlayerWeaponEnergyBar2dRender)

		addCapacity(this)
		this.add(PlayerCapacityEnergyBar2dRender)
	}
}
