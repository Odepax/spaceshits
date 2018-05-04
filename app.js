let logCount = 500
function log() {
	if (--logCount > 0) {
		console.log(...arguments)
	}
}

const PI = Math.PI
const abs = Math.abs
const sign = Math.sign
const sin = Math.sin
const cos = Math.cos
const atan2 = Math.atan2
const sqrt = Math.sqrt
const min = Math.min
const max = Math.max

function absMin(a, b) {
	return abs(a) < abs(b) ? a : b
}

function absMax(a, b) {
	return abs(a) > abs(b) ? a : b
}

function rand(min, max) {
	return Math.random() * (max - min) + min
}

function randBetween() {
	return arguments[parseInt(Math.random() * arguments.length)]
}

/**
 * @typedef {String} Color
 */
const Color = {
	RED: "crimson",
	ORANGE: "darkorange",
	YELLOW: "gold",
	GREEN: "greenyellow",
	TEAL: "mediumseagreen",
	BLUE: "deepskyblue",
	PURPLE: "mediumpurple",
	PINK: "hotpink",
	WHITE: "ghostwhite",
	LIGHT: "silver",
	GREY: "gray",
	DARK: "darkslategray",
	BLACK: "black"
}

/**
 * @typedef {Number} Time
 * @description In `s`.
 */

/**
 * @typedef {Number} Distance
 * @description In `px` or `px/s`.
 */

/**
 * @interface Position
 *
 * @property {DistanceValue} x
 * @memberOf Position
 * @required
 * 
 * @property {DistanceValue} y
 * @memberOf Position
 * @required
 */

/**
 * @typedef {Number} Angle
 * @description The implementation must ensure the value is always between [ -PI, PI ].
 */

/**
 * @param {Transform} transform
 */
CanvasRenderingContext2D.prototype.applyTransform = function applyTransform(transform, rotate = true) {
	this.translate(transform.x, transform.y)
	
	rotate && this.rotate(transform.a)
}

CanvasRenderingContext2D.prototype.resetTransform = function resetTransform() {
	this.setTransform(1, 0, 0, 1, 0, 0)
}

/**
 * @interface WorldObject
 * 
 * @method update
 * @memberOf WorldObject
 * @required
 * @param {World} world
 *
 * @method beforeAdd
 * @memberOf WorldObject
 * @optional
 * @param {World} world
 *
 * @method afterAdd
 * @memberOf WorldObject
 * @optional
 * @param {World} world
 *
 * @method mustBeDeleted
 * @memberOf WorldObject
 * @optional
 * @param {World} world
 * @return {Boolean}
 *
 * @method beforeDelete
 * @memberOf WorldObject
 * @optional
 * @param {World} world
 *
 * @method afterDelete
 * @memberOf WorldObject
 * @optional
 * @param {World} world
 */

/**
 * @implements {WorldObject}
 */
class Input {
	/**
	 * @param {HTMLElement} observedElement
	 */
	constructor(observedElement) {
		this.mouseTransform = new Transform(0, 0)
		
		this.currentlyPressedKeys = new Set()

		this.pressedKeys = new Set()
		this.releasedKeys = new Set()
		
		this.pressedKeys.next = new Set()
		this.releasedKeys.next = new Set()
		
		this.observe(observedElement)
	}

	/**
	 * @private
	 * @param {HTMLElement} element
	 */
	observe(element) {
		element.addEventListener("mousemove", event => {
			this.mouseTransform.x = event.offsetX
			this.mouseTransform.y = event.offsetY
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

			this.pressedKeys.next.add(event.code)
		}, false)
		
		element.addEventListener("keyup", event => {
			if (event.code != "F5" && event.code != "F11" && event.code != "F12") {
				event.preventDefault()
			}

			this.releasedKeys.next.add(event.code)
		}, false)
	}

	update() {
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
	
	/**
	 * @param {String} key
	 * @return {Boolean}
	 */
	isPressed(key) {
		return this.currentlyPressedKeys.has(key)
	}

	/**
	 * @param {String} key
	 * @return {Boolean}
	 */
	wasPressed(key) {
		return this.pressedKeys.has(key)
	}

	/**
	 * @param {String} key
	 * @return {Boolean}
	 */
	wasReleased(key) {
		return this.releasedKeys.has(key)
	}
}

class World {
	/**
	 * @param {HTMLCanvasElement} canvas
	 */
	constructor(canvas) {
		this.graphics = canvas.getContext("2d")

		this.objects = new Set()
		this.input = new Input(this.graphics.canvas.parentElement)

		this.isRunning = false
		this.lastTimestamp = 0

		this.timeFactor = 1
		this.timeDelta = 0
		this.timeEnlapsed = 0
	}
	
	/**
	 * @param {WorldObject} object
	 */
	add(object) {
        object.beforeAdd && object.beforeAdd(this)
		
        this.objects.add(object)
		
        object.afterAdd && object.afterAdd(this)
	}
	
	/**
	 * @param {WorldObject} object
	 */
	delete(object) {
        object.beforeDelete && object.beforeDelete(this)
		
        this.objects.delete(object)
		
        object.afterDelete && object.afterDelete(this)
	}
	
	run() {
		this.isRunning = true

		requestAnimationFrame(currentTimestamp => {
			this.lastTimestamp = currentTimestamp

			requestAnimationFrame(currentTimestamp => this.frame(currentTimestamp))
		})
	}

	freeze() {
		this.isRunning = false
	}

	/**
	 * @private
	 */
	frame(currentTimestamp) {
		this.timeDelta = (currentTimestamp - this.lastTimestamp) / 1000
		this.timeEnlapsed = this.timeDelta * this.timeFactor
		this.lastTimestamp = currentTimestamp
		
		this.graphics.clearRect(0, 0, this.graphics.canvas.width, this.graphics.canvas.height)

		for (const object of this.objects) {
			object.update(this)

			if (object.mustBeDeleted && object.mustBeDeleted(this)) {
				this.delete(object)
			}
		}

		this.input.update()
		
		if (this.isRunning) {
			requestAnimationFrame(currentTimestamp => this.frame(currentTimestamp))
		}
	}
}

/**
 * @implements {WorldObject}
 */
class UniqueAction {
	/**
	 * @param {Function} callback
	 * @param {Time} timeout
	 */
	constructor(callback, timeout) {
		this.callback = callback
		this.timeout = timeout
		
		this.timeEnlapsed = 0
	}
	
	update(world) {
		this.timeEnlapsed += world.timeEnlapsed

		if (this.timeEnlapsed > this.timeout) {
			this.callback(world)
		}
	}
	
	mustBeDeleted(world) {
		return this.timeEnlapsed > this.timeout
	}
}

/**
 * @implements {WorldObject}
 */
class IndefinitelyRepeatedAction {
	/**
	 * @param {Function} callback
	 * @param {Time} interval
	 */
	constructor(callback, interval) {
		this.callback = callback
		this.interval = interval
		
		this.timeEnlapsed = 0
	}
	
	update(world) {
		this.timeEnlapsed += world.timeEnlapsed

		if (this.timeEnlapsed > this.interval) {
			this.timeEnlapsed -= this.interval
			
			this.callback(world)
		}
	}
}

/**
 * @implements {WorldObject}
 */
class RepeatedAction {
	/**
	 * @param {Function} callback
	 * @param {Time} interval
	 * @param {Number} callCount
	 */
	constructor(callback, interval, callCount) {
		this.callback = callback
		this.interval = interval
		this.callCount = callCount
		
		this.timeEnlapsed = 0
	}
	
	update(world) {
		this.timeEnlapsed += world.timeEnlapsed

		if (this.timeEnlapsed > this.interval) {
			this.timeEnlapsed -= this.interval
			--this.callCount
			
			this.callback(world)
		}
	}
	
	mustBeDeleted(world) {
		return this.callCount == 0
	}
}

/**
 * @implements {Position}
 * @implements {AngleObject}
 */
class Transform {
	/**
	 * @param {Angle} angle
	 * @return {AngleValue}
	 */
	static normalizedAngle(angle) {
		if (typeof angle == "object") {
			angle = angle.a
		}

		while (angle > +PI) angle -= 2 * PI
		while (angle < -PI) angle += 2 * PI
		
		return angle
	}

	/**
	 * @param {Position} one
	 * @param {Position} two
	 * @return {Distance}
	 */
	static distanceBetween(one, two) {
		const x = one.x - two.x
		const y = one.y - two.y

		return sqrt(x * x + y * y)
	}

	/**
	 * @param {Angle} base
	 * @param {Angle} target
	 * @return {AngleValue}
	 */
	static optimalAngleBetween(base, target) {
		let distance = (typeof target == "object" ? target.a : target) - (typeof base == "object" ? base.a : base)

		return Transform.normalizedAngle(distance)
	}

	/**
	 * @param {Angle} base
	 * @param {Angle} target
	 * @return {AngleValue} Always negative.
	 */
	static leftAngleBetween(base, target) {
		const distance = Transform.optimalAngleBetween(base, target)

		return distance > 0 ? distance - 2 * PI : distance
	}

	/**
	 * @param {Angle} base
	 * @param {Angle} target
	 * @return {AngleValue} Always positive.
	 */
	static rightAngleBetween(base, target) {
		const distance = Transform.optimalAngleBetween(base, target)

		return distance < 0 ? distance + 2 * PI : distance
	}
	
	/**
	 * @param {Position} base
	 * @param {Position} target
	 * @return {AngleValue}
	 */
	static angleTo(base, target) {
		return atan2(target.y - base.y, target.x - base.x)
	}

	/**
	 * @param {Transform} other
	 * @return {Transform}
	 */
	static clone(other) {
		return new Transform(other.x, other.y, other.a)
	}

	/**
	 * @param {Transform} other
	 * @param {Distance} offsetX
	 * @param {Distance} offsetY
	 * @param {Angle} [offsetA]
	 * @return {Transform}
     */
	static cloneWithOffset(other, offsetX, offsetY, offsetA = 0) {
		return new Transform(other.x + offsetX, other.y + offsetY, other.a + (typeof offsetA == "object" ? offsetA.a : offsetA))
	}

	/**
	 * @param {Transform} other
	 * @param {Angle} angle
	 * @param {Distance} distance
	 * @param {Boolean} [rotate]
	 * @return {Transform}
	 */
	static cloneWithAngularOffset(other, angle, distance, rotate = true) {
		if (typeof angle == "object") {
			angle = angle.a
		}

		return new Transform(other.x + distance * cos(angle), other.y + distance * sin(angle), rotate ? angle : other.a)
	}

	/**
	 * @param {Position} one
	 * @param {Position} two
	 * @return {Transform}
	 */
	static middle(one, two) {
		return new Transform((one.x + two.x) / 2, (one.y + two.y) / 2)
	}

	/**
	 * @param {Distance} x
	 * @param {Distance} y
	 * @param {AngleValue} [a]
	 */
	constructor(x, y, a = 0) {
		this.x = x
		this.y = y
		this.a = a
	}
	
	get a() {
		this._a = Transform.normalizedAngle(this._a)

		return this._a
	}
	
	set a(value) {
		this._a = value
	}
}

const TransformUpdate = {
	/**
	 * @param {Position} subject Is modified.
	 * @param {Position} model
	 * @param {Distance} offsetX
	 * @param {Distance} offsetY
	 */
	offset(subject, model, offsetX, offsetY) {
		subject.x = model.x + offsetX
		subject.y = model.y + offsetY
	},

	/**
	 * @param {Position} subject Is modified.
	 * @param {Position} model
	 * @param {Angle} angle
	 * @param {Distance} distance
	 */
	angularOffset(subject, model, angle, distance) {
		if (typeof angle == "object") {
			angle = angle.a
		}

		subject.x = model.x + cos(angle) * distance
		subject.y = model.y + sin(angle) * distance
	},

	/**
	 * @param {Position} subject Is modified.
	 * @param {Transform} model
	 * @param {Distance} offsetX
	 * @param {Distance} offsetY
	 */
	relativeOffset(subject, model, offsetX, offsetY) {
		subject.x = model.x + cos(model.a) * offsetX - sin(model.a) * offsetY
		subject.y = model.y + sin(model.a) * offsetX + cos(model.a) * offsetY
	},

	/**
	 * @param {Position} subject Is modified.
	 * @param {Transform} model
	 * @param {Angle} angle
	 * @param {Distance} distance
	 */
	relativeAngularOffset(subject, model, angle, distance) {
		if (typeof angle == "object") {
			angle = angle.a
		}

		subject.x = model.x + cos(model.a + angle) * distance
		subject.y = model.y + sin(model.a + angle) * distance
	},

	/**
	 * @param {AngleObject} subject Is modified.
	 * @param {Angle} model
	 * @param {Angle} [offsetAngle]
	 */
	similarAngle(subject, model, offsetAngle = 0) {
		subject.a = (typeof model == "object" ? model.a : model) + (typeof offsetAngle == "object" ? offsetAngle.a : offsetAngle)
	},

	/**
	 * @param {Transform} subject Is modified.
	 * @param {Position} model
	 * @param {Angle} [offsetAngle]
	 */
	directedAngle(subject, model, offsetAngle = 0) {
		subject.a = Transform.angleTo(subject, model) + (typeof offsetAngle == "object" ? offsetAngle.a : offsetAngle)
	},

	/**
	 * @param {AngleObject} subject Is modified.
	 * @param {Angle} leftBound
	 * @param {Angle} rightBound
	 */
	constrainAngleInArc(subject, leftBound, rightBound) {
		const arcSize = Transform.rightAngleBetween(leftBound, rightBound)
		const relativeAngle = Transform.rightAngleBetween(leftBound, subject.a)

		if (relativeAngle > arcSize) {
			const distancetoLeftBound = 2 * PI - relativeAngle
			const distanceToRightBound = abs(Transform.optimalAngleBetween(subject.a, rightBound))

			subject.a = distancetoLeftBound < distanceToRightBound ? leftBound : rightBound
		}
	},

	/**
	 * @param {Position} subject Is modified.
	 * @param {Position} modelA
	 * @param {Position} modelB
	 */
	middle(subject, modelA, modelB) {
		subject.x = (modelA.x + modelB.x) / 2
		subject.y = (modelA.y + modelB.y) / 2
	}
}

/**
 * @implements {Position}
 * @implements {AngleObject}
 * @implements {WorldObject}
 */
class Force {
	/**
	 * @param {Force} other
	 * @param {Distance} addX
	 * @param {Distance} addY
	 * @param {Angle} [addA]
	 * @return {Force}
     */
	static cloneFromBase(other, addX, addY, addA = 0) {
		return new Force(other.x + addX, other.y + addY, other.a + (typeof addA == "object" ? addA.a : addA))
	}

	/**
	 * @param {Distance} x
	 * @param {Distance} y
	 * @param {AngleValue} [a]
	 */
	constructor(x, y, a = 0) {
		this.x = x
		this.y = y
		this.a = a
		
		this.subjects = new Set()
	}

	update(world) {
		for (const subject of this.subjects) {
			subject.x += this.x * world.timeEnlapsed
			subject.y += this.y * world.timeEnlapsed
			subject.a += this.a * world.timeEnlapsed
		}
	}

	/**
	 * @param {Transform | Force} subject
	 */
	applyTo(subject) {
		this.subjects.add(subject)
	}

	/**
	 * @param {Transform | Force} subject
	 */
	release(subject) {
		this.subjects.delete(subject)
	}

	releaseAll() {
		this.subjects.clear()
	}
}

class Friction extends Force {
	/**
	 * @param {Distance} x
	 * @param {Distance} y
	 * @param {AngleValue} [a]
	 */
	constructor(x, y, a = 0) {
		super(x, y, a)
	}
	
	update(world) {
		for (const subject of this.subjects) {
			subject.x = abs(subject.x) < 0.001 ? 0 : subject.x - sign(subject.x) * min(abs(this.x), abs(subject.x)) * world.timeEnlapsed
			subject.y = abs(subject.y) < 0.001 ? 0 : subject.y - sign(subject.y) * min(abs(this.y), abs(subject.y)) * world.timeEnlapsed
			subject.a = abs(subject.a) < 0.001 ? 0 : subject.a - sign(subject.a) * min(abs(this.a), abs(subject.a)) * world.timeEnlapsed
		}
	}
}

// -----------------------------------------------------------------

/**
 * @implements {WorldObject}
 * @abstract
 *
 * @method draw
 * @memberOf Turret
 * @protected
 * @param {World} world
 *
 * @method fire
 * @memberOf Turret
 * @protected
 * @param {World} world
 */
class Turret {
	/**
	 * @param {Object} options
	 * @param {Transform} options.targetTransform
	 * @param {Force} options.bulletBaseSpeed
	 * @param {AngleValue} options.rotationSpeed
	 * @param {AngleValue} options.rotationLeftBound
	 * @param {AngleValue} options.rotationRightBound
	 * @param {Distance} options.size
	 * @param {Color} options.color
	 * @param {Number} options.health
	 * @param {Number} options.healthRegeneration
	 * @param {Time} options.reloadTime
	 */
	constructor({ targetTransform, bulletBaseSpeed, rotationSpeed, rotationLeftBound, rotationRightBound, size, color, health, healthRegeneration, reloadTime }) {
		this.transform = new Transform(0, 0)
		this.targetTransform = targetTransform
		this.bulletBaseSpeed = bulletBaseSpeed
		
		this.rotationSpeed = rotationSpeed
		this.rotationLeftBound = rotationLeftBound
		this.rotationRightBound = rotationRightBound
	
		this.size = size
		this.color = color

		this.health = health
		this.maxHealth = health
		this.healthRegeneration = healthRegeneration

		this.isFiring = false
		this.reloadTime = reloadTime
		this.timeEnlapsed = 0
	}

	mustBeDeleted(world) {
		return this.health < 0
	}

	update(world) {
		const target = { a: Transform.angleTo(this.transform, this.targetTransform) }
		
		TransformUpdate.constrainAngleInArc(target, this.rotationLeftBound, this.rotationRightBound)

		let direction = Transform.optimalAngleBetween(this.transform, target.a)

		if (Transform.rightAngleBetween(this.rotationLeftBound, this.rotationRightBound) > PI) {
			direction = -direction
		}

		this.transform.a += this.rotationSpeed * world.timeEnlapsed * direction

		if (this.isFiring && abs(Transform.optimalAngleBetween(this.transform.a, Transform.angleTo(this.transform, this.targetTransform))) < 0.5) {
			this.timeEnlapsed += world.timeEnlapsed

			if (this.timeEnlapsed > this.reloadTime) {
				this.timeEnlapsed -= this.reloadTime
				
				this.fire(world)
			}
		}

		world.graphics.applyTransform(this.transform)

		this.draw(world)

		world.graphics.resetTransform()
	}
}

/**
 * @implements {WorldObject}
 * @abstract
 *
 * @method draw
 * @memberOf Bullet
 * @protected
 * @optional
 * @param {World} world
 */
Turret.Bullet = class Bullet {
	/**
	 * @param {Object} options
	 * @param {Transform} options.transform
	 * @param {Distance} options.speed
	 * @param {Force} options.baseSpeed
	 * @param {Distance} options.size
	 * @param {Time} options.lifeTime
	 */
	constructor({ transform, speed, baseSpeed, size, lifeTime }) {
		this.transform = transform
		this.speed = Force.cloneFromBase(baseSpeed, speed * cos(this.transform.a), speed * sin(this.transform.a))
		this.size = size
		this.remainingLifeTime = lifeTime
		this.lifeTime = lifeTime
	}

	beforeAdd(world) {
		this.speed.applyTo(this.transform)

		world.add(this.speed)
	}

	afterDelete(world) {
		this.speed.releaseAll()

		world.delete(this.speed)
	}
	
	mustBeDeleted(world) {
		return (this.remainingLifeTime -= world.timeEnlapsed) < 0
	}
	
	update(world) {
		world.graphics.applyTransform(this.transform)
		
		this.draw(world)

		world.graphics.resetTransform()
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.moveTo(-this.size, 0)
		world.graphics.lineTo(+this.size, 0)
		
		world.graphics.strokeStyle = Color.YELLOW
		world.graphics.lineWidth = this.size * this.remainingLifeTime / this.lifeTime
		world.graphics.lineCap = "round"
		world.graphics.stroke()
	}
}

class ThunderTurret extends Turret {
	/**
	 * @param {Transform} targetTransform
	 * @param {Force} bulletBaseSpeed
	 * @param {Color} color
	 */
	constructor(targetTransform, bulletBaseSpeed, color) {
		super({
			targetTransform,
			bulletBaseSpeed,
			rotationSpeed: 4,
			rotationLeftBound: 0,
			rotationRightBound: 0,
			size: 20,
			color,
			health: 100,
			healthRegeneration: 0,
			reloadTime: rand(0.2, 0.3)
		})
	}

	fire(world) {
		world.add(new ThunderTurret.Bullet(Transform.cloneWithAngularOffset(this.transform, this.transform.a + rand(-0.02, 0.02), this.size, true), this.bulletBaseSpeed))
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.moveTo(5, -6)
		world.graphics.lineTo(2, -7)
		world.graphics.lineTo(-7, 0)
		world.graphics.lineTo(2, 7)
		world.graphics.lineTo(5, 6)

		world.graphics.strokeStyle = this.color
		world.graphics.lineWidth = 2
		world.graphics.lineCap = "round"
		world.graphics.stroke()

		world.graphics.beginPath()
		world.graphics.moveTo(3, -2)
		world.graphics.lineTo(15, -2)
		world.graphics.moveTo(3, 2)
		world.graphics.lineTo(15, 2)

		world.graphics.strokeStyle = Color.GREY
		world.graphics.stroke()
	}
}

ThunderTurret.Bullet = class ThunderBullet extends Turret.Bullet {
	/**
	 * @param {Transform} transform
	 * @param {Force} baseSpeed
	 */
	constructor(transform, baseSpeed) {
		super({
			transform,
			speed: rand(170, 230),
			baseSpeed,
			size: 2,
			lifeTime: 3
		})
	}
}

class VulcanTurret extends Turret {
	/**
	 * @param {Transform} targetTransform
	 * @param {Force} bulletBaseSpeed
	 * @param {Color} color
	 */
	constructor(targetTransform, bulletBaseSpeed, color) {
		super({
			targetTransform,
			bulletBaseSpeed,
			rotationSpeed: 3,
			rotationLeftBound: 0,
			rotationRightBound: 0,
			size: 25,
			color,
			health: 100,
			healthRegeneration: 0,
			reloadTime: rand(0.2, 0.4)
		})
	}

	fire(world) {
		for (let i = -2; i < 3; ++i) {
			const bullet = new VulcanTurret.Bullet(Transform.cloneWithAngularOffset(this.transform, this.transform.a + i * 0.1, this.size, false), this.bulletBaseSpeed)

			bullet.transform.a += rand(i * 0.1, i * 0.1 + 0.1)
			
			world.add(bullet)
		}
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.moveTo(7, -10)
		world.graphics.lineTo(1, -12)
		world.graphics.lineTo(-10, 0)
		world.graphics.lineTo(1, 12)
		world.graphics.lineTo(7, 10)

		world.graphics.strokeStyle = this.color
		world.graphics.lineWidth = 2
		world.graphics.lineCap = "round"
		world.graphics.stroke()

		world.graphics.beginPath()
		world.graphics.moveTo(3, -6)
		world.graphics.lineTo(18, -6)
		world.graphics.moveTo(3, -2)
		world.graphics.lineTo(18, -2)
		world.graphics.moveTo(3, 2)
		world.graphics.lineTo(18, 2)
		world.graphics.moveTo(3, 6)
		world.graphics.lineTo(18, 6)

		world.graphics.strokeStyle = Color.GREY
		world.graphics.stroke()
	}
}

VulcanTurret.Bullet = class VulcanBullet extends Turret.Bullet {
	/**
	 * @param {Transform} transform
	 * @param {Force} baseSpeed
	 */
	constructor(transform, baseSpeed) {
		super({
			transform,
			speed: rand(150, 210),
			baseSpeed,
			size: 2,
			lifeTime: 1
		})
	}
}

class RavagerTurret extends Turret {
	/**
	 * @param {Transform} targetTransform
	 * @param {Force} bulletBaseSpeed
	 * @param {Color} color
	 */
	constructor(targetTransform, bulletBaseSpeed, color) {
		super({
			targetTransform,
			bulletBaseSpeed,
			rotationSpeed: 2,
			rotationLeftBound: 0,
			rotationRightBound: 0,
			size: 30,
			color,
			health: 100,
			healthRegeneration: 0,
			reloadTime: rand(1.2, 1.3)
		})
	}

	fire(world) {
		world.add(new RavagerTurret.Bullet(Transform.cloneWithAngularOffset(this.transform, this.transform.a + rand(-0.03, 0.01), this.size, true), this.bulletBaseSpeed))

		world.add(new UniqueAction(world => {
			world.add(new RavagerTurret.Bullet(Transform.cloneWithAngularOffset(this.transform, this.transform.a + rand(-0.01, 0.03), this.size, true), this.bulletBaseSpeed))
		}, 0.1))
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.arc(0, 0, 10, 1, -1)

		world.graphics.strokeStyle = this.color
		world.graphics.lineWidth = 2
		world.graphics.lineCap = "round"
		world.graphics.stroke()

		world.graphics.beginPath()
		world.graphics.moveTo(6, -4)
		world.graphics.lineTo(24, -4)
		world.graphics.moveTo(6, 0)
		world.graphics.lineTo(24, 0)
		world.graphics.moveTo(6, 4)
		world.graphics.lineTo(24, 4)

		world.graphics.strokeStyle = Color.GREY
		world.graphics.stroke()
	}
}

RavagerTurret.Bullet = class RavagerBullet extends Turret.Bullet {
	/**
	 * @param {Transform} transform
	 * @param {Force} baseSpeed
	 */
	constructor(transform, baseSpeed) {
		super({
			transform,
			speed: rand(180, 200),
			baseSpeed,
			size: 3,
			lifeTime: 5
		})
	}
}

class AuroraTurret extends Turret {
	/**
	 * @param {Transform} targetTransform
	 * @param {Force} bulletBaseSpeed
	 * @param {Color} color
	 */
	constructor(targetTransform, bulletBaseSpeed, color) {
		super({
			targetTransform,
			bulletBaseSpeed,
			rotationSpeed: 2,
			rotationLeftBound: 0,
			rotationRightBound: 0,
			size: 30,
			color,
			health: 100,
			healthRegeneration: 0,
			reloadTime: rand(1.4, 1.6)
		})
	}

	fire(world) {
		world.add(new AuroraTurret.Bullet(Transform.cloneWithAngularOffset(this.transform, this.transform.a + rand(-0.01, 0.01), this.size, true), this.bulletBaseSpeed))
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.arc(0, 0, 10, 0.7, -0.7)

		world.graphics.strokeStyle = this.color
		world.graphics.lineWidth = 2
		world.graphics.lineCap = "round"
		world.graphics.stroke()

		world.graphics.beginPath()
		world.graphics.moveTo(0, -2)
		world.graphics.lineTo(25, -2)
		world.graphics.moveTo(0, 2)
		world.graphics.lineTo(25, 2)

		world.graphics.strokeStyle = Color.GREY
		world.graphics.stroke()
	}
}

AuroraTurret.Bullet = class AuroraBullet extends Turret.Bullet {
	/**
	 * @param {Transform} transform
	 * @param {Force} baseSpeed
	 */
	constructor(transform, baseSpeed) {
		super({
			transform,
			speed: rand(220, 260),
			baseSpeed,
			size: 4,
			lifeTime: 5
		})
	}
}

class StormTurret extends Turret {
	/**
	 * @param {Transform} targetTransform
	 * @param {Force} bulletBaseSpeed
	 * @param {Color} color
	 */
	constructor(targetTransform, bulletBaseSpeed, color) {
		super({
			targetTransform,
			bulletBaseSpeed,
			rotationSpeed: 2,
			rotationLeftBound: 0,
			rotationRightBound: 0,
			size: 30,
			color,
			health: 100,
			healthRegeneration: 0,
			reloadTime: rand(0.1, 0.2)
		})
	}

	fire(world) {
		const bullets = [
			new StormTurret.Bullet(Transform.cloneWithAngularOffset(this.transform, this.transform.a + 0.4, this.size, false), this.bulletBaseSpeed),
			new StormTurret.Bullet(Transform.cloneWithAngularOffset(this.transform, this.transform.a - 0.4, this.size, false), this.bulletBaseSpeed)
		]

		bullets[0].transform.a += rand(-0.02, 0.02)
		bullets[1].transform.a += rand(-0.02, 0.02)

		world.add(bullets[0])
		world.add(bullets[1])
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.moveTo(-10, -16)
		world.graphics.lineTo(-10, -5)
		world.graphics.lineTo(8, 0)
		world.graphics.lineTo(-10, 5)
		world.graphics.lineTo(-10, 16)

		world.graphics.strokeStyle = this.color
		world.graphics.lineWidth = 2
		world.graphics.lineCap = "round"
		world.graphics.stroke()

		world.graphics.beginPath()
		world.graphics.moveTo(-6, -13)
		world.graphics.lineTo(20, -13)
		world.graphics.moveTo(-6, -9)
		world.graphics.lineTo(20, -9)
		world.graphics.moveTo(-6, 9)
		world.graphics.lineTo(20, 9)
		world.graphics.moveTo(-6, 13)
		world.graphics.lineTo(20, 13)

		world.graphics.strokeStyle = Color.GREY
		world.graphics.stroke()
	}
}

StormTurret.Bullet = class StormBullet extends Turret.Bullet {
	/**
	 * @param {Transform} transform
	 * @param {Force} baseSpeed
	 */
	constructor(transform, baseSpeed) {
		super({
			transform,
			speed: rand(170, 230),
			baseSpeed,
			size: 2,
			lifeTime: 3
		})
	}
}

class HurricaneTurret extends Turret {
	/**
	 * @param {Transform} targetTransform
	 * @param {Force} bulletBaseSpeed
	 * @param {Color} color
	 */
	constructor(targetTransform, bulletBaseSpeed, color) {
		super({
			targetTransform,
			bulletBaseSpeed,
			rotationSpeed: 1,
			rotationLeftBound: 0,
			rotationRightBound: 0,
			size: 40,
			color,
			health: 100,
			healthRegeneration: 0,
			reloadTime: rand(0.2, 0.3)
		})
	}

	fire(world) {
		for (const i of [ 0.55, 0.4, 0.25 ]) {
			world.add(new UniqueAction(world => {
				const bullets = [
					new StormTurret.Bullet(Transform.cloneWithAngularOffset(this.transform, this.transform.a + +i, this.size, false), this.bulletBaseSpeed),
					new StormTurret.Bullet(Transform.cloneWithAngularOffset(this.transform, this.transform.a + -i, this.size, false), this.bulletBaseSpeed)
				]
				
				bullets[0].transform.a += rand(-0.02, 0.02)
				bullets[1].transform.a += rand(-0.02, 0.02)

				world.add(bullets[0])
				world.add(bullets[1])
			}, i / 3))
		}
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.moveTo(-22, -21)
		world.graphics.lineTo(-13, -6)
		world.graphics.lineTo(10, 0)
		world.graphics.lineTo(-13, 6)
		world.graphics.lineTo(-22, 21)

		world.graphics.strokeStyle = this.color
		world.graphics.lineWidth = 2
		world.graphics.lineCap = "round"
		world.graphics.stroke()

		world.graphics.beginPath()
		world.graphics.moveTo(-16, -18)
		world.graphics.lineTo(23, -18)
		world.graphics.moveTo(-13, -14)
		world.graphics.lineTo(27, -14)
		world.graphics.moveTo(-10, -10)
		world.graphics.lineTo(30, -10)
		world.graphics.moveTo(-10, 10)
		world.graphics.lineTo(30, 10)
		world.graphics.moveTo(-13, 14)
		world.graphics.lineTo(27, 14)
		world.graphics.moveTo(-16, 18)
		world.graphics.lineTo(23, 18)

		world.graphics.strokeStyle = Color.GREY
		world.graphics.stroke()
	}
}

HurricaneTurret.Bullet = class HurricaneBullet extends Turret.Bullet {
	/**
	 * @param {Transform} transform
	 * @param {Force} baseSpeed
	 */
	constructor(transform, baseSpeed) {
		super({
			transform,
			speed: rand(180, 240),
			baseSpeed,
			size: 2,
			lifeTime: 3
		})
	}
}

// -----------------------------------------------------------------

/**
 * @implements {WorldObject}
 */
class LOML {
	/**
	 * @param {Transform} targetTransform
	 * @param {Force} bulletBaseSpeed
	 * @param {Color} color
	 */
	constructor(targetTransform, bulletBaseSpeed, color) {
		this.transform = new Transform(0, 0)
		this.targetTransform = targetTransform
		this.bulletBaseSpeed = bulletBaseSpeed

		this.color = color

		this.reloadTime = rand(2.5, 3.5)
		this.timeEnlapsed = 0
		this.isFiring = false
	}

	update(world) {
		if (this.isFiring) {
			this.timeEnlapsed += world.timeEnlapsed

			if (this.timeEnlapsed > this.reloadTime) {
				this.timeEnlapsed -= this.reloadTime

				this.fire(world)
			}
		}

		this.draw(world)
	}

	fire(world) {
		let i = 0
		for (const angle of [ -0.5, -0.2, 0.2, 0.5 ]) {
			world.add(new UniqueAction(world => {
				world.add(new LOML.Missile({
					transform: Transform.cloneWithAngularOffset(this.transform, this.transform.a + angle, 12, false),
					targetTransform: this.targetTransform,
					baseSpeed: this.bulletBaseSpeed,
					movementAcceleration: 200,
					movementSpeed: 200,
					rotationAcceleration: 4,
					rotationSpeed: 4
				}))
			}, 0.1 * ++i))
		}
	}

	draw(world) {
		world.graphics.applyTransform(this.transform)

		world.graphics.beginPath()
		world.graphics.moveTo(0, -10)
		world.graphics.lineTo(0, 10)

		world.graphics.strokeStyle = this.color
		world.graphics.lineWidth = 2
		world.graphics.lineCap = "round"
		world.graphics.stroke()

		world.graphics.beginPath()
		world.graphics.moveTo(4, -8)
		world.graphics.lineTo(8, -8)
		world.graphics.moveTo(4, -4)
		world.graphics.lineTo(8, -4)
		world.graphics.moveTo(4, 0)
		world.graphics.lineTo(8, 0)
		world.graphics.moveTo(4, +4)
		world.graphics.lineTo(8, +4)
		world.graphics.moveTo(4, +8)
		world.graphics.lineTo(8, +8)

		world.graphics.strokeStyle = Color.GREY
		world.graphics.stroke()

		world.graphics.resetTransform()
	}
}

/**
 * @implements {WorldObject}
 */
LOML.Missile = class Missile {
	constructor({ transform, targetTransform, baseSpeed, movementAcceleration, movementSpeed, rotationAcceleration, rotationSpeed }) {
		this.friction = new Friction(0, 0, 0)
		this.acceleration = new Force(0, 0, 0)
		this.speed = Force.cloneFromBase(baseSpeed, 100 * cos(transform.a), 100 * sin(transform.a))

		this.transform = transform
		this.targetTransform = targetTransform

		this.movementAcceleration = movementAcceleration
		this.movementSpeed = movementSpeed
		this.rotationAcceleration = rotationAcceleration
		this.rotationSpeed = rotationSpeed

		this.size = 2
		this.remainingLifeTime = 7
		this.lifeTime = 7
	}
	
	beforeAdd(world) {
		this.friction.applyTo(this.speed)
		this.acceleration.applyTo(this.speed)
		this.speed.applyTo(this.transform)
		
		world.add(this.friction)
		world.add(this.acceleration)
		world.add(this.speed)
	}

	afterDelete(world) {
		this.friction.releaseAll()
		this.acceleration.releaseAll()
		this.speed.releaseAll()

		world.delete(this.speed)
		world.delete(this.acceleration)
		world.delete(this.friction)
	}

	mustBeDeleted(world) {
		return (this.remainingLifeTime -= world.timeEnlapsed) < 0
	}

	update(world) {
		this.acceleration.x = this.movementAcceleration * cos(this.transform.a)
		this.acceleration.y = this.movementAcceleration * sin(this.transform.a)
		this.acceleration.a = this.rotationAcceleration * sign(Transform.optimalAngleBetween(this.transform.a, Transform.angleTo(this.transform, this.targetTransform)))
		
		this.friction.x = this.speed.x * this.movementAcceleration / this.movementSpeed
		this.friction.y = this.speed.y * this.movementAcceleration / this.movementSpeed
		this.friction.a = this.speed.a * this.rotationAcceleration / this.rotationSpeed

		world.graphics.applyTransform(this.transform)
		
		this.draw(world)

		world.graphics.resetTransform()
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.moveTo(-this.size, 0)
		world.graphics.lineTo(+this.size, 0)
		
		world.graphics.strokeStyle = Color.YELLOW
		world.graphics.lineWidth = this.size * this.remainingLifeTime / this.lifeTime
		world.graphics.lineCap = "round"
		world.graphics.stroke()
	}
}

// -----------------------------------------------------------------

class TurretSlot {
	/**
	 * @param {Distance} offsetX
	 * @param {Distance} offsetY
	 * @param {AngleValue} rotationLeftBound
	 * @param {AngleValue} rotationRightBound
	 * @param {Turret} turret
	 */
	constructor(offsetX, offsetY, rotationLeftBound, rotationRightBound, turret) {
		this.offsetX = offsetX
		this.offsetY = offsetY
		this.rotationLeftBound = rotationLeftBound
		this.rotationRightBound = rotationRightBound
		this.turret = turret
	}
}

class LOMLSlot {
	/**
	 * @param {Distance} offsetX
	 * @param {Distance} offsetY
	 * @param {AngleValue} offsetA
	 * @param {LOML} loml
	 */
	constructor(offsetX, offsetY, offsetA, loml) {
		this.offsetX = offsetX
		this.offsetY = offsetY
		this.offsetA = offsetA
		this.loml = loml
	}
}

/**
 * @implements {WorldObject}
 */
class ShipCore {
	/**
	 * @param {Transform} targetTransform
	 * @param {Color} color
	 */
	constructor(targetTransform, color) {
		this.transform = new Transform(0, 0)
		this.targetTransform = targetTransform

		this.color = color
	}
	
	update(world) {
		TransformUpdate.directedAngle(this.transform, this.targetTransform)
		
		world.graphics.applyTransform(this.transform)
		
		world.graphics.beginPath()
		world.graphics.arc(0, 0, 15, 0, 2 * PI)

		world.graphics.fillStyle = this.color
		world.graphics.fill()

		world.graphics.beginPath()
		world.graphics.moveTo(-3, -4)
		world.graphics.lineTo(3, 0)
		world.graphics.lineTo(-3, 4)

		world.graphics.strokeStyle = Color.DARK
		world.graphics.lineWidth = 2
		world.graphics.lineCap = "round"
		world.graphics.stroke()

		world.graphics.resetTransform()
	}
}

/**
 * @implements {WorldObject}
 * @abstract
 *
 * @method draw
 * @memberOf Ship
 * @protected
 * @param {World} world
 */
class Ship {
	/**
	 * @param {Object} options
	 * @param {Transform} options.transform
	 * @param {Transform} options.targetTransform
	 * @param {Distance} options.movementAcceleration
	 * @param {Distance} options.movementSpeed
	 * @param {Angle} options.rotationAcceleration
	 * @param {Angle} options.rotationSpeed
	 * @param {Color} options.color
	 * @param {Number} options.health
	 * @param {Number} options.healthRegeneration
	 * @param {TurretSlot[]} options.turretSlots
	 * @param {LOMLSlot[]} options.lomlSlots
	 */
	constructor({ transform, targetTransform, movementAcceleration, movementSpeed, rotationAcceleration, rotationSpeed, color, health, healthRegeneration, turretSlots, lomlSlots }) {
		this.friction = new Friction(0, 0, 0)
		this.acceleration = new Force(0, 0, 0)
		this.speed = new Force(0, 0, 0)

		this.transform = transform
		this.targetTransform = targetTransform

		this.movementAcceleration = movementAcceleration
		this.movementSpeed = movementSpeed
		this.rotationAcceleration = rotationAcceleration
		this.rotationSpeed = rotationSpeed
		
		this.color = color

		this.health = health
		this.healthRegeneration = healthRegeneration

		this.core = new ShipCore(targetTransform, color)
		this.turretSlots = turretSlots
		this.lomlSlots = lomlSlots
		this.isFiring = false
	}
	
	beforeAdd(world) {
		this.friction.applyTo(this.speed)
		this.acceleration.applyTo(this.speed)
		this.speed.applyTo(this.transform)
		
		world.add(this.friction)
		world.add(this.acceleration)
		world.add(this.speed)
	}
	
	afterAdd(world) {
		world.add(this.core)

		for (const slot of this.turretSlots) slot.turret && world.add(slot.turret)
		for (const slot of this.lomlSlots) slot.loml && world.add(slot.loml)
	}

	afterDelete(world) {
		this.friction.releaseAll()
		this.acceleration.releaseAll()
		this.speed.releaseAll()

		world.delete(this.speed)
		world.delete(this.acceleration)
		world.delete(this.friction)

		for (const slot of this.turretSlots) slot.turret && world.delete(slot.turret)
		for (const slot of this.lomlSlots) slot.loml && world.delete(slot.loml)

		world.delete(this.core)
	}

	mustBeDeleted(world) {
		return this.health < 0
	}

	update(world) {
		this.acceleration.x = 0
		this.acceleration.y = 0
		this.acceleration.a = 0
		
		if (world.input.isPressed("KeyD")) this.acceleration.a = +this.rotationAcceleration
		if (world.input.isPressed("KeyA")) this.acceleration.a = -this.rotationAcceleration
		
		if (world.input.isPressed("KeyW")) {
			this.acceleration.x = this.movementAcceleration * cos(this.transform.a)
			this.acceleration.y = this.movementAcceleration * sin(this.transform.a)
		}
		
		if (world.input.isPressed("KeyS")) {
			this.acceleration.x = -this.movementAcceleration * cos(this.transform.a)
			this.acceleration.y = -this.movementAcceleration * sin(this.transform.a)
		}

		this.friction.x = this.speed.x * this.movementAcceleration / this.movementSpeed
		this.friction.y = this.speed.y * this.movementAcceleration / this.movementSpeed
		this.friction.a = this.speed.a * this.rotationAcceleration / this.rotationSpeed

		TransformUpdate.offset(this.core.transform, this.transform, 0, 0)

		for (const slot of this.turretSlots) {
			if (slot.turret) {
				TransformUpdate.relativeOffset(slot.turret.transform, this.transform, slot.offsetX, slot.offsetY)
				
				slot.turret.rotationLeftBound = Transform.normalizedAngle(this.transform.a + slot.rotationLeftBound)
				slot.turret.rotationRightBound = Transform.normalizedAngle(this.transform.a + slot.rotationRightBound)
				slot.turret.transform.a += this.speed.a * world.timeEnlapsed

				slot.turret.isFiring = this.isFiring
			}
		}

		for (const slot of this.lomlSlots) {
			if (slot.loml) {
				TransformUpdate.relativeOffset(slot.loml.transform, this.transform, slot.offsetX, slot.offsetY)
				TransformUpdate.similarAngle(slot.loml.transform, this.transform, slot.offsetA)
				
				slot.loml.isFiring = this.isFiring
			}
		}

		world.graphics.applyTransform(this.transform)

		this.draw(world)

		world.graphics.resetTransform()
	}
}

class DartShip extends Ship {
	constructor(transform, targetTransform, color) {
		super({
			transform,
			targetTransform,
			movementAcceleration: 130,
			movementSpeed: 140,
			rotationAcceleration: 2,
			rotationSpeed: 2,
			color,
			health: 100,
			healthRegeneration: 0,
			turretSlots: null,
			lomlSlots: null
		})

		this.turretSlots = [
			new TurretSlot(-26, +38, -0.28, 1.2, new RavagerTurret(targetTransform, this.speed, color)),
			new TurretSlot(-26, -38, -1.2, 0.28, new AuroraTurret(targetTransform, this.speed, color))
		]

		this.lomlSlots = []
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.moveTo(-61, 0)
		world.graphics.lineTo(-68, 26)
		world.graphics.lineTo(-74, 24)
		world.graphics.lineTo(-74, 48)
		world.graphics.lineTo(-26, 60)
		world.graphics.lineTo(-26, 56)
		world.graphics.bezierCurveTo(-66, 48, -38, -2, -10, 26)
		world.graphics.lineTo(84, 0)
		world.graphics.lineTo(-10, -26)
		world.graphics.bezierCurveTo( -38, 2, -66, -48, -26, -56)
		world.graphics.lineTo(-26, -60)
		world.graphics.lineTo(-74, -48)
		world.graphics.lineTo(-74, -24)
		world.graphics.lineTo(-68, -26)
		world.graphics.closePath()

		world.graphics.fillStyle = Color.DARK
		world.graphics.fill()
	}
}

class SiegeShip extends Ship {
	constructor(transform, targetTransform, color) {
		super({
			transform,
			targetTransform,
			movementAcceleration: 130,
			movementSpeed: 140,
			rotationAcceleration: 2,
			rotationSpeed: 2,
			color,
			health: 100,
			healthRegeneration: 0,
			turretSlots: null,
			lomlSlots: null
		})

		this.turretSlots = [
			new TurretSlot(-49, -39, -2.72, -0.30, new ThunderTurret(targetTransform, this.speed, color)),
			new TurretSlot(-49, +39, +0.30, +2.72, new ThunderTurret(targetTransform, this.speed, color)),
			new TurretSlot(105, -26, -2.86, -0.15, new ThunderTurret(targetTransform, this.speed, color)),
			new TurretSlot(105, +26, +0.15, +2.86, new ThunderTurret(targetTransform, this.speed, color))
		]

		this.lomlSlots = [
			new LOMLSlot(48, -12, -PI / 2, new LOML(targetTransform, this.speed, color)),
			new LOMLSlot(48, +12, +PI / 2, new LOML(targetTransform, this.speed, color)),
			new LOMLSlot(72, -12, -PI / 2, new LOML(targetTransform, this.speed, color)),
			new LOMLSlot(72, +12, +PI / 2, new LOML(targetTransform, this.speed, color)),
			new LOMLSlot(-2, -35, -PI / 2, new LOML(targetTransform, this.speed, color)),
			new LOMLSlot(-2, +35, +PI / 2, new LOML(targetTransform, this.speed, color))
		]
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.moveTo(-28, 0)
		world.graphics.lineTo(-32, -13)
		world.graphics.lineTo(-58, -15)
		world.graphics.lineTo(-67, -40)
		world.graphics.lineTo(-62, -40)
		world.graphics.bezierCurveTo(-61, -20, -37, -24, -37, -39)
		world.graphics.lineTo(-16, -32)
		world.graphics.lineTo(13, -32)
		world.graphics.lineTo(28, -28)
		world.graphics.lineTo(36, -9)
		world.graphics.lineTo(85, -9)
		world.graphics.lineTo(90, -24)
		world.graphics.lineTo(93, -25)
		world.graphics.bezierCurveTo(95, -9, 116, -11, 117, -25)
		world.graphics.lineTo(121, -24)
		world.graphics.bezierCurveTo(129, -3, 129, 3, 121, 24)
		world.graphics.lineTo(117, 25)
		world.graphics.bezierCurveTo(116, 11, 95, 9, 93, 25)
		world.graphics.lineTo(90, 24)
		world.graphics.lineTo(85, 9)
		world.graphics.lineTo(36, 9)
		world.graphics.lineTo(28, 28)
		world.graphics.lineTo(13, 32)
		world.graphics.lineTo(-16, 32)
		world.graphics.lineTo(-37, 39)
		world.graphics.bezierCurveTo(-37, 24, -61, 20, -62, 40)
		world.graphics.lineTo(-67, 40)
		world.graphics.lineTo(-58, 15)
		world.graphics.lineTo(-32, 13)
		world.graphics.closePath()

		world.graphics.fillStyle = Color.DARK
		world.graphics.fill()
	}
}

// -----------------------------------------------------------------

const world = new World(canvas)

const player = new SiegeShip(new Transform(200, 200), world.input.mouseTransform, Color.TEAL)

// TODO
// ----
//
// [x] Scaling bug => scale up the ship.
// [x] Rotate turrets with ship.
// [x] Mv force transmission from ship to bullets. => TECH DEBT
// [ ] Acceleration / max speed bug.
// [ ] Constrain angle to arc > 180deg bug.

world.add(player)
world.add({
	update(world) {
		if (world.input.isPressed("MouseLeft")) {
			player.isFiring = true
		} else {
			player.isFiring = false
		}
	}
})

world.run()

/*
const player = {
	friction: new Friction(0, 0, 0),
	acceleration: new Force(0, 0, 0),
	speed: new Force(0, 0, 0),
	transform: new Transform(20, 250, 0),
	
	beforeAdd(world) {
		this.friction.applyTo(this.speed)
		this.acceleration.applyTo(this.speed)
		this.speed.applyTo(this.transform)
		
		world.add(this.friction)
		world.add(this.acceleration)
		world.add(this.speed)
	},
	
	afterAdd(world) {
		const ship = new ScorpionShip(0, 0, Color.RED)
		
		ship.transform = this.transform
		
		world.add(ship)
	},
	
	update(world) {
		this.acceleration.a = 0
		this.acceleration.x = 0
		this.acceleration.y = 0
		
		if (world.input.isPressed("KeyD")) this.acceleration.a = +0.3
		if (world.input.isPressed("KeyA")) this.acceleration.a = -0.3
		
		if (world.input.isPressed("KeyW")) {
			this.acceleration.x = 30 * cos(this.transform.a)
			this.acceleration.y = 30 * sin(this.transform.a)
		}
		
		if (world.input.isPressed("KeyS")) {
			this.acceleration.x = -30 * cos(this.transform.a)
			this.acceleration.y = -30 * sin(this.transform.a)
		}

		this.friction.a = this.speed.a / 2
		this.friction.x = this.speed.x / 2
		this.friction.y = this.speed.y / 2
	}
}
*/

/*
i = 0
for (const c in Color) {
	const s = new ScorpionShip(++i * 60, 600, Color[c])
	s.transform.a = 1
	world.add(s)
}
*/

if (DEBUG) {
	world.add({
		timeEnlaped: 0,
		records: new Map([
			[ player.acceleration, [] ],
			[ player.speed, [] ],
			[ player.transform, [] ]
		]),

		/** Debugger. */
		update(world) {
			this.timeEnlaped += world.timeEnlapsed

			let i = 0

			world.graphics.fillStyle = Color.GREEN
			world.graphics.font = "bold 16px monospace"

			world.graphics.fillText("Time: " + this.timeEnlaped, 10, 10 + 16 * ++i)
			world.graphics.fillText("FPS: " + world.timeDelta * 1000, 10, 10 + 16 * ++i)
			world.graphics.fillText("Objects: " + world.objects.size, 10, 10 + 16 * ++i)
			world.graphics.fillText("Keys: " + Array.from(world.input.currentlyPressedKeys).join(", "), 10, 10 + 16 * ++i)

			for (const [ desc, [ t, c ] ] of new Map([
				[ "World  - F", [ player.friction, Color.GREY ] ],
				[ "Player - A", [ player.acceleration, Color.RED ] ],
				[ "       - S", [ player.speed, Color.YELLOW ] ],
				[ "       - T", [ player.transform, Color.GREEN ] ]
			])) {
				world.graphics.fillStyle = c

				world.graphics.fillText(desc + ":", 10, 26 + 16 * i)
				world.graphics.fillText("X = " + (typeof t.x == "function" ? t.x(player.speed, t) : t.x), 130, 26 + 16 * i)
				world.graphics.fillText("Y = " + (typeof t.y == "function" ? t.y(player.speed, t) : t.y), 360, 26 + 16 * i)
				world.graphics.fillText("A = " + (typeof t.a == "function" ? t.a(player.speed, t) : t.a), 590, 26 + 16 * i)

				if (c != Color.GREY) {
					if (this.records.get(t).length > world.graphics.canvas.width / 3) {
						this.records.set(t, [])
					}

					this.records.get(t).push(Transform.clone(t))

					let j = 0
					for (const record of this.records.get(t)) {
						this.barAt(0, j, record.x * 2)
						this.barAt(1, j, record.y)
						this.barAt(2, j, record.a * 100)

						++j
					}
				}

				++i
			}
		},

		barAt(graph, time, value) {
			world.graphics.fillRect(
				graph * world.graphics.canvas.width / 3 + time - 1,
				world.graphics.canvas.height / 2 - value - 1,
				2,
				2
			)
		}
	})
}
