
/**
 * @typedef {Object} ExplosionConfiguration
 *
 * @property {Number} [options.x = 0]
 * @property {Number} [options.y = 0]
 * @property {Time} lifeTime
 * @property {Distance} radius
 * @property {Number} damage
 */

/**
 * @implements {WorldObject}
 * @implements {Ephemeral}
 * @implements {Colliding}
 */
class Explosion extends Transform {
	/**
	 * @param {ExplosionConfiguration} options
	 */
	constructor({ x = 0, y = 0, lifeTime, radius, damage }) {
		super(x, y)

		Ephemeral.init(this, lifeTime)
		Colliding.init(this, 0, damage)

		this.finalRadius = radius
	}

	mustBeDeleted(world) {
		return Ephemeral.mustBeDeleted(this, world)
	}

	update(world) {
		Ephemeral.update(this, world)

		const explosionProgress = 1 - max(0, this.remainingLifeTime / this.lifeTime)

		this.collisionRadius = explosionProgress * this.finalRadius

		for (const object of world.objects) {
			if (object.collisionRadius && object.health && Colliding.test(this, object)) {
				object.health -= this.collisionDamage * this.universe.tickTime
			}
		}

		world.graphics.applyTransform(this)

		world.graphics.beginPath()
		world.graphics.arc(0, 0, this.collisionRadius, 0, 2 * PI)

		world.graphics.globalAlpha = 1 - explosionProgress
		world.graphics.fillStyle = Color.YELLOW
		world.graphics.fill()
		world.graphics.globalAlpha = 1

		world.graphics.resetTransform()
	}
}

// -----------------------------------------------------------------

const Defaults = {
	Shell: {
		get T1() { return { movementSpeed: 250, lifeTime: 1.5, radius: 2, explosion: { lifeTime: 1, radius:  5, damage: 10 } } },
		get T2() { return { movementSpeed: 200, lifeTime: 3.0, radius: 3, explosion: { lifeTime: 2, radius: 10, damage: 20 } } }
	},
	Missile: {
		get T1() { return { movementAcceleration: 250, rotationAcceleration: 2.5, lifeTime: 5, radius: 2, explosion: { lifeTime: 1, radius: 5, damage: 10 } } }
	},
	Turret: {
		get T1() { return { rotationSpeed: PI,     collisionRadius:  5, health:  50, healthRegeneration: 1, explosion: { lifeTime: 2, radius: 10, damage: 20 }, reloadTime: 0.3 } },
		get T2() { return { rotationSpeed: PI / 2, collisionRadius: 10, health: 100, healthRegeneration: 2, explosion: { lifeTime: 3, radius: 20, damage: 40 }, reloadTime: 0.6 } }
	},
	Core: {
		get T1() { return { collisionRadius:  5, health: 100, healthRegeneration: 1, explosion: { lifeTime: 2, radius:  50, damage: 100 } } },
		get T2() { return { collisionRadius: 10, health: 200, healthRegeneration: 1, explosion: { lifeTime: 3, radius: 100, damage: 200 } } },
		get T3() { return { collisionRadius: 15, health: 300, healthRegeneration: 1, explosion: { lifeTime: 4, radius: 150, damage: 300 } } }
	},
	Fighter: {
		get T1() { return { movementAcceleration: 120, rotationAcceleration: 1.6 } },
		get T2() { return { movementAcceleration: 110, rotationAcceleration: 0.7 } }
	},
	Gunship: {
		get T1() { return { movementAcceleration: 100, rotationAcceleration: 2.0 } },
		get T2() { return { movementAcceleration:  60, rotationAcceleration: 1.2 } }
	},
	Cruiser: {
		get T1() { return { movementAcceleration: 100, rotationAcceleration: 1.6 } }
	}
}

// -----------------------------------------------------------------

/**
 * @typedef {Object} AssetConfiguration
 *
 * @property {Transform} target
 * @property {Distance} collisionRadius
 * @property {Number} health
 * @property {Number} healthRegeneration
 * @property {Team} team
 * @property {ExplosionConfiguration} explosion
 */

/**
 * @implements {WorldObject}
 * @implements {Colliding}
 * @implements {Destroyable}
 * @implements {Teamed}
 * @abstract
 *
 * @method draw
 * @protected
 * @param {World} world
 */
class Asset extends Transform {
	/**
	 * @param {AssetConfiguration} options
	 */
	constructor({ target, collisionRadius, health, healthRegeneration, team, explosion }) {
		super(0, 0)

		this.target = target

		Colliding.init(this, collisionRadius)
		Destroyable.init(this, health, healthRegeneration)
		Teamed.init(this, team)

		this.explosion = explosion
	}

	mustBeDeleted(world) {
		return Destroyable.mustBeDeleted(this, world)
	}

	afterDelete(world) {
		world.add(new Explosion(this.explosion.apply({ x: this.x, y: this.y })))
	}

	update(world) {
		Destroyable.update(this, world)

		world.graphics.applyTransform(this)

		this.draw(world)

		world.graphics.resetTransform()
	}
}

class Core extends Asset {
	update(world) {
		this.rotateToward(this.target)

		super.update(world)
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.arc(0, 0, this.collisionRadius, 0, 2 * PI)

		world.graphics.fillStyle = this.team.mainColor
		world.graphics.fill()

		world.graphics.beginPath()
		world.graphics.moveTo(0, 0)
		world.graphics.lineTo(this.collisionRadius, 0)

		world.graphics.strokeStyle = Color.DARK
		world.graphics.lineWidth = 2
		world.graphics.lineCap = "round"
		world.graphics.stroke()
	}
}

/**
 * @typedef {Object} ShellConfiguration
 *
 * @property {Transform} transform
 * @property {Force} baseSpeed
 * @property {Distance} movementSpeed
 * @property {Time} lifeTime
 * @property {Distance} radius
 * @property {Team} team
 * @property {ExplosionConfiguration} explosion
 */

/**
 * @implements {WorldObject}
 * @implements {Moving.Linear}
 * @implements {Colliding}
 * @implements {Ephemeral}
 * @implements {Teamed}
 */
class Shell extends Transform {
	/**
	 * @param {ShellConfiguration} options
	 */
	constructor({ transform, baseSpeed, movementSpeed, lifeTime, radius, team, explosion }) {
		super(transform.x, transform.y, transform.a)

		Moving.Linear.initAngular(this, this.a, movementSpeed)

		this.speedX += baseSpeed.x
		this.speedY += baseSpeed.y

		Colliding.init(this, radius)
		Ephemeral.init(this, lifeTime)
		Teamed.init(this, team)

		this.explosion = explosion
	}

	mustBeDeleted(world) {
		return Ephemeral.mustBeDeleted(this, world) || Colliding.testAny(this, Teamed.hostiles(this, world.objects))
	}

	afterDelete(world) {
		world.add(new Explosion(this.explosion.apply({ x: this.x, y: this.y })))
	}

	update(world) {
		Ephemeral.update(this, world)
		Moving.Linear.update(this, world)

		world.graphics.applyTransform(this)

		world.graphics.beginPath()
		world.graphics.moveTo(-this.collisionRadius, 0)
		world.graphics.lineTo(+this.collisionRadius, 0)

		world.graphics.strokeStyle = Color.YELLOW
		world.graphics.lineWidth = this.collisionRadius * max(0.01, this.remainingLifeTime / this.lifeTime)
		world.graphics.lineCap = "round"
		world.graphics.stroke()

		world.graphics.resetTransform()
	}
}

/**
 * @typedef {Object} MissileConfiguration
 *
 * @property {Transform} transform
 * @property {Transform} target
 * @property {Force} baseSpeed
 * @property {Distance} movementAcceleration
 * @property {Angle} rotationAcceleration
 * @property {Time} lifeTime
 * @property {Distance} radius
 * @property {Team} team
 * @property {ExplosionConfiguration} explosion
 */

/**
 * @implements {WorldObject}
 * @implements {Moving}
 * @implements {Colliding}
 * @implements {Ephemeral}
 * @implements {Teamed}
 */
class Missile extends Transform {
	/**
	 * @param {MissileConfiguration} options
	 */
	constructor({ transform, target, baseSpeed, movementAcceleration, rotationAcceleration, lifeTime, radius, team, explosion }) {
		super(transform.x, transform.y, transform.a)

		this.target = target

		Moving.init(this)

		this.speed.x += baseSpeed.x
		this.speed.y += baseSpeed.y
		this.speed.a += baseSpeed.a

		this.movementAcceleration = movementAcceleration
		this.rotationAcceleration = rotationAcceleration

		Colliding.init(this, radius)
		Ephemeral.init(this, lifeTime)
		Teamed.init(this, team)

		this.explosion = explosion
	}

	mustBeDeleted(world) {
		return Ephemeral.mustBeDeleted(this, world) || Colliding.testAny(this, Teamed.hostiles(this, world.objects))
	}

	afterDelete(world) {
		world.add(new Explosion(this.explosion.apply({ x: this.x, y: this.y })))
	}

	update(world) {
		this.acceleration.a = sign(this.optimalAngleToward(this.target)) * this.rotationAcceleration
		this.acceleration.x = this.movementAcceleration * cos(this.a)
		this.acceleration.y = this.movementAcceleration * sin(this.a)

		Ephemeral.update(this, world)
		Moving.update(this, world)

		world.graphics.applyTransform(this)

		world.graphics.beginPath()
		world.graphics.moveTo(-this.collisionRadius, 0)
		world.graphics.lineTo(+this.collisionRadius, 0)

		world.graphics.strokeStyle = this.team.secondaryColor
		world.graphics.lineWidth = this.collisionRadius * max(0.01, this.remainingLifeTime / this.lifeTime)
		world.graphics.lineCap = "round"
		world.graphics.stroke()

		world.graphics.resetTransform()
	}
}

/**
 * @typedef {Object} TurretConfiguration
 *
 * @property {Transform} target
 * @property {Force} bulletBaseSpeed
 * @property {Angle} rotationSpeed
 * @property {Distance} collisionRadius
 * @property {Number} health
 * @property {Number} healthRegeneration
 * @property {Team} team
 * @property {ExplosionConfiguration} explosion
 * @property {Time} reloadTime
 */

/**
 * @abstract
 *
 * @method fire
 * @protected
 * @param {World} world
 */
class Turret extends Asset {
	/**
	 * @param {TurretConfiguration} options
	 */
	constructor({ target, bulletBaseSpeed, rotationSpeed, collisionRadius, health, healthRegeneration, team, explosion, reloadTime }) {
		super({ target, collisionRadius, health, healthRegeneration, team, explosion })

		this.bulletBaseSpeed = bulletBaseSpeed
		this.rotationSpeed = rotationSpeed
		this.reloadTime = reloadTime

		this.mustFire = false
		this.timeEnlapsed = 0

		this.leftRotationBound = undefined
		this.rightRotationBound = undefined
	}

	update(world) {
		let target = 0

		if (this.leftRotationBound == undefined) {
			target = this.angleToward(this.target)
		} else {
			target = Transform.prototype.constrainAngleIn.call({
				a: this.angleToward(this.target),

				optimalAngleTo(angle) {
					return Angle.optimalAngleBetween(this.a, angle)
				}
			}, this.leftRotationBound, this.rightRotationBound).a
		}

		let direction = this.optimalAngleTo(target)

		if (this.leftRotationBound != undefined && Angle.rightAngleBetween(this.leftRotationBound, this.rightRotationBound) > PI) {
			direction = -direction
		}

		this.a += this.rotationSpeed * this.universe.tickTime * direction

		if (this.mustFire && this.hasTargetInSight) {
			this.timeEnlapsed += this.universe.tickTime

			if (this.timeEnlapsed > this.reloadTime) {
				this.timeEnlapsed -= this.reloadTime

				this.fire(world)
			}
		}

		super.update(world)
	}

	/**
	 * @protected
	 */
	get hasTargetInSight() {
		return abs(this.optimalAngleToward(this.target)) < 0.5
	}
}

/**
 * @abstract
 */
class MissileLauncher extends Turret {
	/**
	 * @protected
	 */
	get hasTargetInSight() {
		return true
	}
}

// -----------------------------------------------------------------

/**
 * @interface TurretSlot
 *
 * @property {Distance} x
 * @property {Distance} y
 * @property {Turret} turret
 * @property {Angle} [leftRotationBound]
 * @property {Angle} [rightRotationBound]
 */

// -----------------------------------------------------------------

Turret.DG1H1Dash = class DG1H1Dash extends Turret {
	constructor(target, bulletBaseSpeed, team) {
		super(Defaults.Turret.T1.apply({ target, bulletBaseSpeed, team, reloadTime: 0.2 }))
	}

	fire(world) {
		world.add(new Shell(Defaults.Shell.T1.apply({
			transform: this.clone().relativeOffset(this.collisionRadius, 0).rotateBy(rand(-0.03, 0.03)),
			baseSpeed: this.bulletBaseSpeed,
			team: this.team
		})))
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.arc(0, 0, this.collisionRadius, 1, -1)

		world.graphics.strokeStyle = this.team.mainColor
		world.graphics.lineWidth = 2
		world.graphics.lineCap = "round"
		world.graphics.stroke()

		world.graphics.beginPath()

		world.graphics.moveTo(0, 0)
		world.graphics.lineTo(this.collisionRadius + 1, 0)

		world.graphics.strokeStyle = Color.GREY
		world.graphics.stroke()
	}
}

Turret.DG2H1Liner = class DG2H1Liner extends Turret {
	constructor(target, bulletBaseSpeed, team) {
		super(Defaults.Turret.T2.apply({ target, bulletBaseSpeed, team, reloadTime: 0.2 }))
	}

	fire(world) {
		world.add(new Shell(Defaults.Shell.T2.apply({
			transform: this.clone().relativeOffset(this.collisionRadius, 0).rotateBy(rand(-0.03, 0.03)),
			baseSpeed: this.bulletBaseSpeed,
			team: this.team
		})))
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.arc(0, 0, this.collisionRadius, 0.5, -0.5)

		world.graphics.strokeStyle = this.team.mainColor
		world.graphics.lineWidth = 2
		world.graphics.lineCap = "round"
		world.graphics.stroke()

		world.graphics.beginPath()

		world.graphics.moveTo(0, 0)
		world.graphics.lineTo(this.collisionRadius + 2, 0)

		world.graphics.strokeStyle = Color.GREY
		world.graphics.stroke()
	}
}

Turret.DH2M3Ravager = class DH2M3Ravager extends Turret {
	constructor(target, bulletBaseSpeed, team) {
		super(Defaults.Turret.T2.apply({ target, bulletBaseSpeed, team, reloadTime: 1 }))
	}

	fire(world) {
		for (const [ offsetY, extraBulletRotation ] of [
			[ -4, rand(-0.03, -0.01) ],
			[ 0, rand(-0.01, 0.01) ],
			[ 4, rand(0.01, 0.03) ]
		]) {
			world.add(new Shell(Defaults.Shell.T2.apply({
				transform: this.clone().relativeOffset(this.collisionRadius, offsetY).rotateBy(extraBulletRotation),
				baseSpeed: this.bulletBaseSpeed,
				team: this.team
			})))
		}
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.arc(0, 0, this.collisionRadius, 1, -1)

		world.graphics.strokeStyle = this.team.mainColor
		world.graphics.lineWidth = 2
		world.graphics.lineCap = "round"
		world.graphics.stroke()

		world.graphics.beginPath()

		world.graphics.moveTo(0, 0)
		world.graphics.lineTo(this.collisionRadius + 2, 0)

		world.graphics.moveTo(0, -4)
		world.graphics.lineTo(this.collisionRadius + 2, -4)

		world.graphics.moveTo(0, 4)
		world.graphics.lineTo(this.collisionRadius + 2, 4)

		world.graphics.strokeStyle = Color.GREY
		world.graphics.stroke()
	}
}

Turret.IM1M2Paparazzi = class IM1M2Paparazzi extends MissileLauncher {
	constructor(target, bulletBaseSpeed, team) {
		super(Defaults.Turret.T1.apply({ target, bulletBaseSpeed, team, reloadTime: 1 }))
	}

	fire(world) {
		world.add(new Missile(Defaults.Missile.T1.apply({
			transform: this.clone().relativeOffset(this.collisionRadius, 0),
			target: this.target,
			baseSpeed: this.bulletBaseSpeed,
			team: this.team
		})))

		world.add(new UniqueAction(world => {
			world.add(new Missile(Defaults.Missile.T1.apply({
				transform: this.clone().relativeOffset(this.collisionRadius, 0),
				target: this.target,
				baseSpeed: this.bulletBaseSpeed,
				team: this.team
			})))
		}, 0.2))
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.arc(0, 0, this.collisionRadius, 1, -1)

		world.graphics.strokeStyle = this.team.mainColor
		world.graphics.lineWidth = 2
		world.graphics.lineCap = "round"
		world.graphics.stroke()

		world.graphics.beginPath()

		world.graphics.moveTo(0, 0)
		world.graphics.lineTo(2, 0)

		world.graphics.moveTo(5, 0)
		world.graphics.lineTo(6, 0)

		world.graphics.strokeStyle = Color.GREY
		world.graphics.stroke()
	}
}

// -----------------------------------------------------------------

/**
 * @implements {WorldObject}
 * @implements {Transform}
 * @implements {Colliding}
 * @implements {Destroyable}
 * @implements {Teamed}
 */
class Shield {
	get x() { return this.transform.x }
	get y() { return this.transform.y }
	get a() { return this.transform.a }

	constructor(transform, team) {
		this.transform = transform

		Colliding.init(this, 100, 0)
		Destroyable.init(this, 500, 50)
		Teamed.init(this, team)
	}

	mustBeDeleted(world) {
		return Destroyable.mustBeDeleted(this, world)
	}

	update(world) {
		Destroyable.update(this, world)

		world.graphics.applyTransform(this.transform)

		world.graphics.beginPath()
		world.graphics.arc(0, 0, this.collisionRadius, 0, 2 * PI)

		world.graphics.globalAlpha = 0.5
		world.graphics.strokeStyle = this.team.secondaryColor
		world.graphics.lineWidth = 5 * this.health / this.maxHealth
		world.graphics.stroke()
		world.graphics.globalAlpha = 1

		world.graphics.resetTransform()
	}
}

// -----------------------------------------------------------------

/**
 * @typedef {Object} ShipConfiguration
 *
 * @property {Tranform} transform
 * @property {Tranform} target
 * @property {AssetConfiguration} core
 * @property {Team} team
 * @property {Distance} movementAcceleration
 * @property {Angle} rotationAcceleration
 */

/**
 * @implements {WorldObject}
 * @implements {Moving}
 * @implements {Teamed}
 * @abstract
 *
 * @property {Object} turrets
 * @protected
 * @readOnly
 *
 * @method draw
 * @protected
 * @param {World} world
 */
class Ship extends Transform {
	/**
	 * @param {ShipConfiguration} options
	 */
	constructor({ transform, target, core, team, movementAcceleration, rotationAcceleration }) {
		super(transform.x, transform.y, transform.a)

		this.target = target

		Moving.init(this)
		Teamed.init(this, team)

		this.movementAcceleration = movementAcceleration
		this.rotationAcceleration = rotationAcceleration

		this.core = new Core(core)
		this.turretSlots = new Set()
		this.mustFire = false
	}

	get target() { return this._target }
	set target(value) {
		this._target = value

		if (this.turretSlots) for (const slot of this.turretSlots) {
			slot.turret.target = value
		}

		if (this.core) {
			this.core.target = value
		}
	}

	afterAdd(world) {
		world.add(this.core)

		for (const slot of this.turretSlots) {
			world.add(slot.turret)
		}
	}

	afterDelete(world) {
		for (const slot of this.turretSlots) {
			world.delete(slot.turret)
		}

		world.delete(this.core)
	}

	mustBeDeleted(world) {
		return this.core.mustBeDeleted(world)
	}

	update(world) {
		Moving.update(this, world)

		this.core.offset(0, 0, this)

		for (const slot of this.turretSlots) {
			if (slot.turret.mustBeDeleted(world)) {
				this.turretSlots.delete(slot)
			} else {
				slot.turret.relativeOffset(slot.x, slot.y, this)

				if (slot.leftRotationBound != undefined) {
					slot.turret.leftRotationBound = Angle.normalize(this.a + slot.leftRotationBound)
					slot.turret.rightRotationBound = Angle.normalize(this.a + slot.rightRotationBound)
				}

				slot.turret.rotateBy(this.speed.a * this.universe.tickTime)
				slot.turret.mustFire = this.mustFire
			}
		}

		world.graphics.applyTransform(this)

		this.draw(world)

		world.graphics.resetTransform()
	}
}

/**
 * @abstract
 *
 * @property {Object} turrets
 * @protected
 * @readOnly
 * @property {Turret} turrets.front
 */
Ship.Pollen = class Pollen extends Ship {
	constructor({ transform, target, team }) {
		super(Defaults.Gunship.T1.apply({ transform, target, team, core: Defaults.Core.T1.apply({ target, team }) }))

		this.turretSlots.add({ x: 15.4, y: 0, turret: this.turrets.front, leftRotationBound: -0.78, rightRotationBound: 0.78 })
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.moveTo(-10.4, 0)
		world.graphics.lineTo(-6.4, 15)
		world.graphics.lineTo(8.6, 15)
		world.graphics.lineTo(6.6, 7.5)
		world.graphics.lineTo(15.4, 7.5)
		world.graphics.lineTo(15.4, 7)
		world.graphics.bezierCurveTo(6, 6.4, 6, -6.4, 15.4, -7)
		world.graphics.lineTo(15.4, -7)
		world.graphics.lineTo(15.4, -7.5)
		world.graphics.lineTo(6.6, -7.5)
		world.graphics.lineTo(8.6, -15)
		world.graphics.lineTo(-6.4, -15)
		world.graphics.closePath()

		world.graphics.fillStyle = Color.DARK
		world.graphics.fill()
	}
}

Ship.Pollen.WG1ADG1 = class WG1ADG1 extends Ship.Pollen {
	get turrets() { return {
		front: new Turret.DG1H1Dash(this.target, this.speed, this.team)
	} }
}

Ship.Pollen.WG1BIM1 = class WG1BIM1 extends Ship.Pollen {
	get turrets() { return {
		front: new Turret.IM1M2Paparazzi(this.target, this.speed, this.team)
	} }
}

/**
 * @abstract
 *
 * @property {Object} turrets
 * @protected
 * @readOnly
 * @property {Turret} turrets.left
 * @property {Turret} turrets.right
 */
Ship.Moth = class Moth extends Ship {
	constructor({ transform, target, team }) {
		super(Defaults.Fighter.T1.apply({ transform, target, team, core: Defaults.Core.T1.apply({ target, team }) }))
		
		const turrets = this.turrets
		
		this.turretSlots.add({ x: 7.5, y: 17.9, turret: turrets.right, leftRotationBound: -0.42, rightRotationBound: 0.95 })
		this.turretSlots.add({ x: 7.5, y: -17.9, turret: turrets.left, leftRotationBound: -0.95, rightRotationBound: 0.42 })
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.moveTo(-13.8, 7.4)
		world.graphics.lineTo(-4.8, 9.9)
		world.graphics.lineTo(-10.2, 30)
		world.graphics.lineTo(4.8, 30)
		world.graphics.lineTo(6.2, 24.9)
		world.graphics.bezierCurveTo(-3, 22.8, -0.3, 8.8, 9.8, 11.5)
		world.graphics.lineTo(12.8, 0)
		world.graphics.lineTo(9.8, -11.5)
		world.graphics.bezierCurveTo(-0.3, -8.8, -3, -22.8, 6.2, -24.9)
		world.graphics.lineTo(4.8, -30)
		world.graphics.lineTo(-10.2, -30)
		world.graphics.lineTo(-4.8, -9.9)
		world.graphics.lineTo(-13.8, -7.4)
		world.graphics.closePath()

		world.graphics.fillStyle = Color.DARK
		world.graphics.fill()
	}
}

Ship.Moth.MF1ADG2 = class MF1ADG2 extends Ship.Moth {
	get turrets() { return {
		left: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		right: new Turret.DG1H1Dash(this.target, this.speed, this.team)
	} }
}

Ship.Moth.MF1BIM2 = class MF1BIM2 extends Ship.Moth {
	get turrets() { return {
		left: new Turret.IM1M2Paparazzi(this.target, this.speed, this.team),
		right: new Turret.IM1M2Paparazzi(this.target, this.speed, this.team)
	} }
}

/**
 * @abstract
 *
 * @property {Object} turrets
 * @protected
 * @readOnly
 * @property {Turret} turrets.frontLeft
 * @property {Turret} turrets.middleLeft
 * @property {Turret} turrets.backLeft
 * @property {Turret} turrets.frontRight
 * @property {Turret} turrets.middleRight
 * @property {Turret} turrets.backRight
 */
Ship.Scarab = class Scarab extends Ship {
	constructor({ transform, target, team }) {
		super(Defaults.Cruiser.T1.apply({ transform, target, team, core: Defaults.Core.T1.apply({ target, team }) }))

		const turrets = this.turrets

		this.turretSlots.add({ x: 19, y: 18.5, turret: turrets.frontRight, leftRotationBound: 0.52, rightRotationBound: 2.07 })
		this.turretSlots.add({ x: -3.5, y: 22.6, turret: turrets.middleRight, leftRotationBound: 0.37, rightRotationBound: 2.60 })
		this.turretSlots.add({ x: -21.2, y: 16, turret: turrets.backRight, leftRotationBound: 1.06, rightRotationBound: 2.60 })
		this.turretSlots.add({ x: 19, y: -18.5, turret: turrets.frontLeft, leftRotationBound: -2.07, rightRotationBound: -0.52 })
		this.turretSlots.add({ x: -3.5, y: -22.6, turret: turrets.middleLeft, leftRotationBound: -2.60, rightRotationBound: -0.37 })
		this.turretSlots.add({ x: -21.2, y: -16, turret: turrets.backLeft, leftRotationBound: -2.60, rightRotationBound: -1.06 })
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.moveTo(-24.1, 0)
		world.graphics.lineTo(-33.5, 2.6)
		world.graphics.lineTo(-33.5, 12.5)
		world.graphics.lineTo(-27.9, 14)
		world.graphics.bezierCurveTo(-25.6, 6, -12.7, 7.4, -14.4, 17.6)
		world.graphics.lineTo(-10.3, 18.8)
		world.graphics.bezierCurveTo(-9, 14, -3.2, 11.8, 1, 15.3)
		world.graphics.lineTo(7.5, 7.6)
		world.graphics.lineTo(11.5, 20.6)
		world.graphics.lineTo(12.2, 20.3)
		world.graphics.bezierCurveTo(10.2, 12.2, 22.3, 7.3, 25.7, 16.7)
		world.graphics.lineTo(26.5, 16.5)
		world.graphics.lineTo(26.5, 9.5)
		world.graphics.lineTo(34, 7.5)
		world.graphics.lineTo(34, -7.5)
		world.graphics.lineTo(26.5, -9.5)
		world.graphics.lineTo(26.5, -16.5)
		world.graphics.lineTo(25.7, -16.7)
		world.graphics.bezierCurveTo(22.3, -7.3, 10.2, -12.2, 12.2, -20.3)
		world.graphics.lineTo(11.5, -20.6)
		world.graphics.lineTo(7.5, -7.6)
		world.graphics.lineTo(1, -15.3)
		world.graphics.bezierCurveTo(-3.2, -11.8, -9, -14, -10.3, -18.8)
		world.graphics.lineTo(-14.4, -17.6)
		world.graphics.bezierCurveTo(-12.7, -7.4, -25.6, -6, -27.9, -14)
		world.graphics.lineTo(-33.5, -12.5)
		world.graphics.lineTo(-33.5, -2.6)
		world.graphics.closePath()

		world.graphics.fillStyle = Color.DARK
		world.graphics.fill()
	}
}

Ship.Scarab.XC1ADG6 = class XC1ADG6 extends Ship.Scarab {
	get turrets() { return {
		frontRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		middleRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		backRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		frontLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		middleLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		backLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team)
	} }
}

Ship.Scarab.XC1BDG4IM2 = class XC1BDG4IM2 extends Ship.Scarab {
	get turrets() { return {
		frontRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		middleRight: new Turret.IM1M2Paparazzi(this.target, this.speed, this.team),
		backRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		frontLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		middleLeft: new Turret.IM1M2Paparazzi(this.target, this.speed, this.team),
		backLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team)
	} }
}

/**
 * @abstract
 *
 * @property {Object} turrets
 * @protected
 * @readOnly
 * @property {Turret} turrets.eyeLeft
 * @property {Turret} turrets.frontLeft
 * @property {Turret} turrets.middleLeft
 * @property {Turret} turrets.backLeft
 * @property {Turret} turrets.eyeRight
 * @property {Turret} turrets.frontRight
 * @property {Turret} turrets.middleRight
 * @property {Turret} turrets.backRight
 */
Ship.Wasp = class Wasp extends Ship {
	constructor({ transform, target, team }) {
		super(Defaults.Cruiser.T1.apply({ transform, target, team, core: Defaults.Core.T1.apply({ target, team }) }))

		const turrets = this.turrets

		this.turretSlots.add({ x: 21.6, y: 12.2, turret: turrets.eyeRight, leftRotationBound: 0.48, rightRotationBound: 1.40 })
		this.turretSlots.add({ x: -1.5, y: 19.6, turret: turrets.frontRight, leftRotationBound: 1.11, rightRotationBound: 1.88 })
		this.turretSlots.add({ x: -16.5, y: 27.1, turret: turrets.middleRight, leftRotationBound: 0.32, rightRotationBound: 1.88 })
		this.turretSlots.add({ x: -31.5, y: 34.6, turret: turrets.backRight, leftRotationBound: 0.32, rightRotationBound: 3.05 })
		this.turretSlots.add({ x: 21.6, y: -12.2, turret: turrets.eyeLeft, leftRotationBound: -1.40, rightRotationBound: -0.48 })
		this.turretSlots.add({ x: -1.5, y: -19.6, turret: turrets.frontLeft, leftRotationBound: -1.88, rightRotationBound: -1.11 })
		this.turretSlots.add({ x: -16.5, y: -27.1, turret: turrets.middleLeft, leftRotationBound: -1.88, rightRotationBound: -0.32 })
		this.turretSlots.add({ x: -31.5, y: -34.6, turret: turrets.backLeft, leftRotationBound: -3.05, rightRotationBound: -0.32 })
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.moveTo(-19, 0)
		world.graphics.lineTo(-10.9, 4.7)
		world.graphics.lineTo(-16.5, 4.7)
		world.graphics.lineTo(-46.5, 19.7)
		world.graphics.lineTo(-31.5, 19.7)
		world.graphics.lineTo(-44.5, 23.7)
		world.graphics.lineTo(-36.9, 30.2)
		world.graphics.bezierCurveTo(-33.6, 26.4, -27.9, 26.9, -25.3, 31.6)
		world.graphics.lineTo(-22.8, 30.4)
		world.graphics.bezierCurveTo(-26.5, 21.6, -14.7, 16, -10.3, 24.1)
		world.graphics.lineTo(-7.8, 22.9)
		world.graphics.bezierCurveTo(-12.1, 10.5, 7.6, 8.7, 5.2, 21.9)
		world.graphics.lineTo(12.8, 24.4)
		world.graphics.lineTo(17.5, 17.9)
		world.graphics.bezierCurveTo(8.6, 9.7, 22.8, -1.4, 28.3, 10.1)
		world.graphics.lineTo(35.9, 7.6)
		world.graphics.lineTo(48.9, 0)
		world.graphics.lineTo(35.9, -7.6)
		world.graphics.lineTo(28.3, -10.1)
		world.graphics.bezierCurveTo(22.8, 1.4, 8.6, -9.7, 17.5, -17.9)
		world.graphics.lineTo(12.8, -24.4)
		world.graphics.lineTo(5.2, -21.9)
		world.graphics.bezierCurveTo(7.6, -8.7, -12.1, -10.5, -7.8, -22.9)
		world.graphics.lineTo(-10.3, -24.1)
		world.graphics.bezierCurveTo(-14.7, -16, -26.5, -21.6, -22.8, -30.4)
		world.graphics.lineTo(-25.3, -31.6)
		world.graphics.bezierCurveTo(-27.9, -26.9, -33.6, -26.4, -36.9, -30.2)
		world.graphics.lineTo(-44.5, -23.7)
		world.graphics.lineTo(-31.5, -19.7)
		world.graphics.lineTo(-46.5, -19.7)
		world.graphics.lineTo(-16.5, -4.7)
		world.graphics.lineTo(-10.9, -4.7)
		world.graphics.closePath()

		world.graphics.fillStyle = Color.DARK
		world.graphics.fill()
	}
}

Ship.Wasp.AC1ADG8 = class AC1ADG8 extends Ship.Wasp {
	get turrets() { return {
		eyeRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		frontRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		middleRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		backRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		eyeLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		frontLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		middleLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		backLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team)
	} }
}

Ship.Wasp.AC1BDG6IM2 = class AC1BDG6IM2 extends Ship.Wasp {
	get turrets() { return {
		eyeRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		frontRight: new Turret.IM1M2Paparazzi(this.target, this.speed, this.team),
		middleRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		backRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		eyeLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		frontLeft: new Turret.IM1M2Paparazzi(this.target, this.speed, this.team),
		middleLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		backLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team)
	} }
}

Ship.Wasp.AC1CDG4IM4 = class AC1CDG4IM4 extends Ship.Wasp {
	get turrets() { return {
		eyeRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		frontRight: new Turret.IM1M2Paparazzi(this.target, this.speed, this.team),
		middleRight: new Turret.IM1M2Paparazzi(this.target, this.speed, this.team),
		backRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		eyeLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		frontLeft: new Turret.IM1M2Paparazzi(this.target, this.speed, this.team),
		middleLeft: new Turret.IM1M2Paparazzi(this.target, this.speed, this.team),
		backLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team)
	} }
}

Ship.Wasp.AC1DDG2IM6 = class AC1DDG2IM6 extends Ship.Wasp {
	get turrets() { return {
		eyeRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		frontRight: new Turret.IM1M2Paparazzi(this.target, this.speed, this.team),
		middleRight: new Turret.IM1M2Paparazzi(this.target, this.speed, this.team),
		backRight: new Turret.IM1M2Paparazzi(this.target, this.speed, this.team),
		eyeLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		frontLeft: new Turret.IM1M2Paparazzi(this.target, this.speed, this.team),
		middleLeft: new Turret.IM1M2Paparazzi(this.target, this.speed, this.team),
		backLeft: new Turret.IM1M2Paparazzi(this.target, this.speed, this.team)
	} }
}

/**
 * @abstract
 *
 * @property {Object} turrets
 * @protected
 * @readOnly
 * @property {Turret} turrets.front
 * @property {Turret} turrets.clawLeft
 * @property {Turret} turrets.clawRight
 * @property {Turret} turrets.armLeft
 * @property {Turret} turrets.armRight
 * @property {Turret} turrets.flankLeft
 * @property {Turret} turrets.flankRight
 * @property {Turret} turrets.backLeft
 * @property {Turret} turrets.backRight
 * @property {Turret} turrets.tail
 */
Ship.Scorpion = class Scorpion extends Ship {
	constructor({ transform, target, team }) {
		super(Defaults.Gunship.T2.apply({ transform, target, team, core: Defaults.Core.T2.apply({ target, team }) }))

		const turrets = this.turrets

		this.turretSlots.add({ x: 37.3, y: 0, turret: turrets.front, leftRotationBound: -0.77, rightRotationBound: 0.77 })
		this.turretSlots.add({ x: 13.2, y: 29.6, turret: turrets.armRight, leftRotationBound: 1.41, rightRotationBound: 2.52 })
		this.turretSlots.add({ x: -10.9, y: 26.6, turret: turrets.flankRight, leftRotationBound: 1.18, rightRotationBound: 2.53 })
		this.turretSlots.add({ x: -29.8, y: 15.2, turret: turrets.backRight, leftRotationBound: 1.33, rightRotationBound: 2.63 })
		this.turretSlots.add({ x: 13.2, y: -29.6, turret: turrets.armLeft, leftRotationBound: -2.52, rightRotationBound: -1.41 })
		this.turretSlots.add({ x: -10.9, y: -26.6, turret: turrets.flankLeft, leftRotationBound: -2.53, rightRotationBound: -1.18 })
		this.turretSlots.add({ x: -29.8, y: -15.2, turret: turrets.backLeft, leftRotationBound: -2.63, rightRotationBound: -1.33 })
		this.turretSlots.add({ x: -68.6, y: 0, turret: turrets.tail, leftRotationBound: 2.55, rightRotationBound: -2.55 })
		this.turretSlots.add({ x: 47.5, y: 31.8, turret: turrets.clawRight, leftRotationBound: -1.22, rightRotationBound: 1.19 })
		this.turretSlots.add({ x: 47.5, y: -31.8, turret: turrets.clawLeft, leftRotationBound: -1.19, rightRotationBound: 1.22 })
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.moveTo(-68.7, -18.7)
		world.graphics.lineTo(-68.7, -12)
		world.graphics.bezierCurveTo(-52.5, -10.9, -52.5, 10.9, -68.7, 12)
		world.graphics.lineTo(-68.7, 18.7)
		world.graphics.lineTo(-47.4, 8.1)
		world.graphics.lineTo(-44.5, 17.5)
		world.graphics.lineTo(-38, 9.7)
		world.graphics.lineTo(-35.5, 11)
		world.graphics.bezierCurveTo(-30, 4.1, -19.6, 10.6, -23.8, 18.7)
		world.graphics.lineTo(-20.9, 28.1)
		world.graphics.lineTo(-17.5, 24.1)
		world.graphics.bezierCurveTo(-14.9, 17.1, -2.6, 18.1, -4.2, 28.3)
		world.graphics.lineTo(-2.3, 34.4)
		world.graphics.lineTo(3.6, 27.5)
		world.graphics.lineTo(6.5, 27.3)
		world.graphics.bezierCurveTo(8.5, 20, 21, 20.9, 20.1, 30.4)
		world.graphics.lineTo(26.4, 34.7)
		world.graphics.lineTo(20, 40.2)
		world.graphics.lineTo(33.1, 43.9)
		world.graphics.lineTo(40.5, 41.5)
		world.graphics.bezierCurveTo(34.1, 36.9, 33.5, 27.1, 40.6, 22)
		world.graphics.lineTo(33.2, 19.6)
		world.graphics.lineTo(26.5, 10.3)
		world.graphics.lineTo(37.3, 7.4)
		world.graphics.lineTo(37.3, 7)
		world.graphics.bezierCurveTo(28.1, 6.6, 28.1, -6.6, 37.3, -7)
		world.graphics.lineTo(37.3, -7.4)
		world.graphics.lineTo(26.5, -10.3)
		world.graphics.lineTo(33.2, -19.6)
		world.graphics.lineTo(40.6, -22)
		world.graphics.bezierCurveTo(33.5, -27.1, 34.1, -36.9, 40.5, -41.5)
		world.graphics.lineTo(33.1, -43.9)
		world.graphics.lineTo(20, -40.2)
		world.graphics.lineTo(26.4, -34.7)
		world.graphics.lineTo(20.1, -30.4)
		world.graphics.bezierCurveTo(21, -20.9, 8.5, -20, 6.5, -27.3)
		world.graphics.lineTo(3.6, -27.5)
		world.graphics.lineTo(-2.3, -34.4)
		world.graphics.lineTo(-4.2, -28.3)
		world.graphics.bezierCurveTo(-2.6, -18.1, -14.9, -17.1, -17.5, -24.1)
		world.graphics.lineTo(-20.9, -28.1)
		world.graphics.lineTo(-23.8, -18.7)
		world.graphics.bezierCurveTo(-19.6, -10.6, -30, -4.1, -35.5, -11)
		world.graphics.lineTo(-38, -9.7)
		world.graphics.lineTo(-44.5, -17.5)
		world.graphics.lineTo(-47.4, -8.1)
		world.graphics.closePath()

		world.graphics.fillStyle = Color.DARK
		world.graphics.fill()
	}
}

Ship.Scorpion.YG2ADG10 = class YG2ADG10 extends Ship.Scorpion {
	get turrets() { return {
		front: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		armRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		flankRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		backRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		armLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		flankLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		backLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		tail: new Turret.DG2H1Liner(this.target, this.speed, this.team),
		clawRight: new Turret.DG2H1Liner(this.target, this.speed, this.team),
		clawLeft: new Turret.DG2H1Liner(this.target, this.speed, this.team)
	} }
}

Ship.Scorpion.YG2BDG8DH2 = class YG2BDG8DH2 extends Ship.Scorpion {
	get turrets() { return {
		front: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		armRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		flankRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		backRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		armLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		flankLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		backLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		tail: new Turret.DG2H1Liner(this.target, this.speed, this.team),
		clawRight: new Turret.DH2M3Ravager(this.target, this.speed, this.team),
		clawLeft: new Turret.DH2M3Ravager(this.target, this.speed, this.team)
	} }
}

/**
 * @abstract
 *
 * @property {Object} turrets
 * @protected
 * @readOnly
 * @property {Turret} turrets.front
 * @property {Turret} turrets.eyeLeft
 * @property {Turret} turrets.eyeRight
 * @property {Turret} turrets.wingLeft
 * @property {Turret} turrets.wingRight
 */
Ship.Skate = class Skate extends Ship {
	constructor({ transform, target, team }) {
		super(Defaults.Fighter.T2.apply({ transform, target, team, core: Defaults.Core.T2.apply({ target, team }) }))

		const turrets = this.turrets

		this.turretSlots.add({ x: 22.5, y: 0, turret: turrets.front, leftRotationBound: -0.72, rightRotationBound: 0.72 })
		this.turretSlots.add({ x: 15, y: 24.9, turret: turrets.eyeRight, leftRotationBound: -0.21, rightRotationBound: 1.13 })
		this.turretSlots.add({ x: 15, y: -24.9, turret: turrets.eyeLeft, leftRotationBound: -1.13, rightRotationBound: 0.21 })
		this.turretSlots.add({ x: 6.9, y: 51.3, turret: turrets.wingRight, leftRotationBound: -0.30, rightRotationBound: 1.16 })
		this.turretSlots.add({ x: 6.9, y: -51.3, turret: turrets.wingLeft, leftRotationBound: -1.16, rightRotationBound: 0.30 })
	}

	draw(world) {
		world.graphics.beginPath()
		world.graphics.moveTo(-15, 3.5)
		world.graphics.lineTo(-28, 7.5)
		world.graphics.lineTo(-15, 18.6)
		world.graphics.lineTo(-3.8, 21.6)
		world.graphics.lineTo(-8.1, 37.6)
		world.graphics.lineTo(-15.5, 37.6)
		world.graphics.lineTo(-10.2, 60.7)
		world.graphics.lineTo(-16.1, 82.6)
		world.graphics.lineTo(0.4, 61.3)
		world.graphics.bezierCurveTo(-10.9, 52.9, -3, 36.3, 10.4, 39.8)
		world.graphics.lineTo(12.6, 31.8)
		world.graphics.bezierCurveTo(3.6, 27.9, 9.1, 14.3, 18.8, 19.4)
		world.graphics.lineTo(28, 11.7)
		world.graphics.lineTo(21, 9.5)
		world.graphics.lineTo(22.7, 7.1)
		world.graphics.bezierCurveTo(13, 6.9, 13, -6.9, 22.7, -7.1)
		world.graphics.lineTo(21, -9.5)
		world.graphics.lineTo(28, -11.7)
		world.graphics.lineTo(18.8, -19.4)
		world.graphics.bezierCurveTo(9.1, -14.3, 3.6, -27.9, 12.6, -31.8)
		world.graphics.lineTo(10.4, -39.8)
		world.graphics.bezierCurveTo(-3, -36.3, -10.9, -52.9, 0.4, -61.3)
		world.graphics.lineTo(-16.1, -82.6)
		world.graphics.lineTo(-10.2, -60.7)
		world.graphics.lineTo(-15.5, -37.6)
		world.graphics.lineTo(-8.1, -37.6)
		world.graphics.lineTo(-3.8, -21.6)
		world.graphics.lineTo(-15, -18.6)
		world.graphics.lineTo(-28, -7.5)
		world.graphics.lineTo(-15, -3.5)
		world.graphics.closePath()

		world.graphics.fillStyle = Color.DARK
		world.graphics.fill()
	}
}

Ship.Skate.MF2ADG5 = class MF2ADG5 extends Ship.Skate {
	get turrets() { return {
		front: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		eyeRight: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		eyeLeft: new Turret.DG1H1Dash(this.target, this.speed, this.team),
		wingRight: new Turret.DG2H1Liner(this.target, this.speed, this.team),
		wingLeft: new Turret.DG2H1Liner(this.target, this.speed, this.team)
	} }
}

// -----------------------------------------------------------------

/**
 * @implements {WorldObject}
 */
class KeyboardShipController {
	/**
	 * @param {Ship} ship
	 */
	constructor(ship) {
		this.ship = ship
	}

	mustBeDeleted(world) {
		return this.ship.mustBeDeleted(world)
	}

	update(world) {
			 if (world.input.isPressed("KeyD")) this.ship.acceleration.a = +this.ship.rotationAcceleration
		else if (world.input.isPressed("KeyA")) this.ship.acceleration.a = -this.ship.rotationAcceleration
		else                                    this.ship.acceleration.a = 0

		if (world.input.isPressed("KeyW") || world.input.isPressed("KeyS") || world.input.isPressed("KeyE") || world.input.isPressed("KeyQ")) {
			let a = this.ship.a

			if (world.input.isPressed("KeyS")) {
				a += PI
			}

			if (world.input.isPressed("KeyE")) {
				if (world.input.isPressed("KeyW")) {
					a += PI / 4
				} else if (world.input.isPressed("KeyS")) {
					a -= PI / 4
				} else {
					a += PI / 2
				}
			} else if (world.input.isPressed("KeyQ")) {
				if (world.input.isPressed("KeyW")) {
					a -= PI / 4
				} else if (world.input.isPressed("KeyS")) {
					a += PI / 4
				} else {
					a -= PI / 2
				}
			}

			this.ship.acceleration.x = this.ship.movementAcceleration * cos(a)
			this.ship.acceleration.y = this.ship.movementAcceleration * sin(a)
		} else {
			this.ship.acceleration.x = 0
			this.ship.acceleration.y = 0
		}

		if (world.input.isPressed("MouseLeft")) {
			this.ship.mustFire = true
		} else {
			this.ship.mustFire = false
		}
	}
}

/**
 * @implements {WorldObject}
 */
class RotatingMouseShipController {
	/**
	 * @param {Ship} ship
	 */
	constructor(ship) {
		this.ship = ship
	}

	mustBeDeleted(world) {
		return this.ship.mustBeDeleted(world)
	}

	update(world) {
		// #magicnumber
		// @see http://graph-plotter.cours-de-math.eu
		// f: [ -PI ; PI ] -> [ -1.1 ; 1.1 ]
		// f(x) = atan(x * 3) * 0.7
		this.ship.acceleration.a = this.ship.rotationAcceleration * atan(this.ship.optimalAngleToward(this.ship.target) * 3) * 0.7

		if (world.input.isPressed("KeyW") || world.input.isPressed("KeyS") || world.input.isPressed("KeyD") || world.input.isPressed("KeyA")) {
			let a = this.ship.a

			if (world.input.isPressed("KeyS")) {
				a += PI
			}

			if (world.input.isPressed("KeyD")) {
				if (world.input.isPressed("KeyW")) {
					a += PI / 4
				} else if (world.input.isPressed("KeyS")) {
					a -= PI / 4
				} else {
					a += PI / 2
				}
			} else if (world.input.isPressed("KeyA")) {
				if (world.input.isPressed("KeyW")) {
					a -= PI / 4
				} else if (world.input.isPressed("KeyS")) {
					a += PI / 4
				} else {
					a -= PI / 2
				}
			}

			this.ship.acceleration.x = this.ship.movementAcceleration * cos(a)
			this.ship.acceleration.y = this.ship.movementAcceleration * sin(a)
		} else {
			this.ship.acceleration.x = 0
			this.ship.acceleration.y = 0
		}

		if (world.input.isPressed("MouseLeft")) {
			this.ship.mustFire = true
		} else {
			this.ship.mustFire = false
		}
	}
}

/**
 * @implements {WorldObject}
 */
class AutomaticShipController {
	/**
	 * @param {Ship} ship
	 */
	constructor(ship) {
		this.ship = ship
		this.attackAngle = 0
		this.attackDistance = rand(100, 200)
		this.rotationDirection = randBetween(-1, 1) / PI
		this.switchRotationDirection = new IndefinitelyRepeatedAction(() => {
			if(rand(0, 1) < 0.1) {
				this.rotationDirection *= -1
			}
		}, 1)
	}

	mustBeDeleted(world) {
		return this.ship.mustBeDeleted(world)
	}

	afterAdd(world) {
		world.add(this.switchRotationDirection)
	}

	afterDelete(world) {
		world.delete(this.switchRotationDirection)
	}

	update(world) {
		this.attackAngle = Angle.normalize(this.attackAngle + this.ship.rotationAcceleration * this.rotationDirection * this.universe.tickTime)

		// #magicnumber
		// @see http://graph-plotter.cours-de-math.eu
		// f: [ -PI ; PI ] -> [ -1.1 ; 1.1 ]
		// f(x) = atan(x * 3) * 0.7
		this.ship.acceleration.a = this.ship.rotationAcceleration * atan(this.ship.optimalAngleToward(this.ship.target) * 3) * 0.7

		const directionAngle = this.ship.angleToward(this.ship.target.clone().angularOffset(this.attackAngle, this.attackDistance))

		this.ship.acceleration.x = this.ship.movementAcceleration * cos(directionAngle)
		this.ship.acceleration.y = this.ship.movementAcceleration * sin(directionAngle)

		if (this.ship.distanceToward(this.ship.target) < 500) {
			this.ship.mustFire = true
		} else {
			this.ship.mustFire = false
		}
	}
}

// -----------------------------------------------------------------

const world = new World(canvas)

world.add({
	update(world) {
		if (world.input.wasPressed("MouseLeft")) {
			const team = Team.BLUE

			const target = randBetween(
				...Array.from(world.objects)
					.filter(it => it instanceof Ship && !Teamed.test(it, { team }))
			)

			const shipType = randBetween(
				Ship.Wasp.AC1ADG8,
				Ship.Wasp.AC1BDG6IM2,
				Ship.Wasp.AC1CDG4IM4,
				Ship.Wasp.AC1DDG2IM6
			)

			world.input.mousePosition.apply(({ x, y }) => {
				const ship = new shipType({ transform: new Transform(x, y, rand(-PI, PI)), target, team })

				world.add(ship)
				world.add(new AutomaticShipController(ship))
			})
		} else if (world.input.wasPressed("MouseRight")) {
			world.input.mousePosition.apply(({ x, y }) => world.add(new Explosion(Defaults.Core.T3.explosion.apply({ x, y }))))
		}
	}
})

function randShip() {
	return randBetween(
		Ship.Pollen.WG1ADG1,
		Ship.Pollen.WG1BIM1,
		Ship.Moth.MF1ADG2,
		Ship.Moth.MF1BIM2,
		Ship.Scarab.XC1ADG6,
		Ship.Scarab.XC1BDG4IM2
	)
}

for (let i = 0; i < 7; ++i) {
	const enemy = new (randShip())({ transform: new Transform(rand(200, 1900), rand(100, 900), rand(-PI, PI)), target: new Transform(0, 0), team: Team.RED })

	world.add(enemy)
	world.add(new AutomaticShipController(enemy))

	const ally = new (randShip())({ transform: new Transform(rand(200, 1900), rand(100, 900), rand(-PI, PI)), target: enemy, team: Team.GREEN })

	world.add(ally)
	world.add(new AutomaticShipController(ally))

	enemy.target = ally
}

world.run()

if (DEBUG) {
	world.add({
		timeEnlapsed: 0,
		records: new Map([
			[ player.acceleration, [] ],
			[ player.speed, [] ],
			[ player, [] ]
		]),

		/** Debugger. */
		update(world) {
			this.timeEnlapsed += this.universe.tickTime

			let i = 0

			world.graphics.fillStyle = Color.GREEN
			world.graphics.font = "bold 16px monospace"

			world.graphics.fillText("Time: " + this.timeEnlapsed, 10, 10 + 16 * ++i)
			world.graphics.fillText("FPS: " + world.timeDelta * 1000, 10, 10 + 16 * ++i)
			world.graphics.fillText("Objects: " + world.objects.size, 10, 10 + 16 * ++i)
			world.graphics.fillText("Keys: " + Array.from(world.input.currentlyPressedKeys).join(", "), 10, 10 + 16 * ++i)

			for (const [ desc, [ t, c ] ] of new Map([
				[ "Mouse  - T", [ world.input.mousePosition, Color.GREY ] ],
				[ "World  - F", [ player.friction, Color.GREY ] ],
				[ "Player - A", [ player.acceleration, Color.RED ] ],
				[ "       - S", [ player.speed, Color.YELLOW ] ],
				[ "       - T", [ player, Color.GREEN ] ]
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

					this.records.get(t).push(Transform.prototype.clone.call(t))

					let j = 0
					for (const record of this.records.get(t)) {
						this.barAt(0, j, record.x / 3.9)
						this.barAt(1, j, record.y / 2)
						this.barAt(2, j, record.a * 145)

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
