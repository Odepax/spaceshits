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

	optimalAngleTo(angle) {
		return Angle.optimalAngleBetween(this.a, angle)
	}

	leftAngleTo(angle) {
		return Angle.leftAngleBetween(this.a, angle)
	}

	rightAngleTo(angle) {
		return Angle.rightAngleBetween(this.a, angle)
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

	rotateLike(angle) {
		this.a = angle

		return this
	}

	rotateBy(angle) {
		this.a += angle

		return this
	}

	rotateToward(target) {
		this.a = this.angleToward(target)

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

class Collision extends Trait {
	onInitialize(collisionRadius, collisionDamage = 0) {
		this.collisionRadius = collisionRadius
		this.collisionDamage = collisionDamage
	}

	collidesWith(other) {
		return this.link.Transform.distanceToward(other.link.Transform) < this.collisionRadius + other.collisionRadius
	}

	collidesWithAny(others) {
		for (const other of others) {
			if (this.collidesWith(other)) {
				return true
			}
		}

		return false
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
		this.graphics.fillText(`Last universe tick ....... ${this.universe.tickTime}`, 50, 50 + ++i * 25)
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

class PlayerBounceOnScreenEdges extends Trait {
	onInitialize(screenWidth, screenHeight, speedFactorAfterBounce = 0.5) {
		this.screenWidth = screenWidth
		this.screenHeight = screenHeight
		this.speedFactorAfterBounce = speedFactorAfterBounce
	}

	onUpdate() {
		const shipPosition = this.link.Transform
		const shipSpeed = this.link.ForceBasedMovement.speed

		     if (shipPosition.y < 0)                 { shipPosition.y = 0                 ; shipSpeed.y *= -this.speedFactorAfterBounce }
		else if (this.screenHeight < shipPosition.y) { shipPosition.y = this.screenHeight ; shipSpeed.y *= -this.speedFactorAfterBounce }

		     if (shipPosition.x < 0)                { shipPosition.x = 0                ; shipSpeed.x *= -this.speedFactorAfterBounce }
		else if (this.screenWidth < shipPosition.x) { shipPosition.x = this.screenWidth ; shipSpeed.x *= -this.speedFactorAfterBounce }
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

const player = universe.add(class Player extends Link {
	onInitialize() {
		this.add(Transform, 250, 250)
		this.add(ForceBasedMovement)
		this.add(PlayerMovementController, userInteractor.UserInteraction, 600)
		this.add(DraftShipCanvasRender, graphics)
		this.add(PlayerBounceOnScreenEdges, canvas.width, canvas.height)
	}
})
