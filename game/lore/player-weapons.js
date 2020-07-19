import { UserInputCapturer } from "../ux/user-input-capture.js"
import { GameKeeper } from "./game-keeper.js"
import { Universe, Link } from "../core/engine.js"
import { Player } from "./player.js"
import { Motion } from "../physic/motion.js"
import { Transform } from "../math/transform.js"
import { Tags } from "./tags.js"
import { Sprites } from "../graphic/assets/sprites.js"
import { OnRemoveExplosion, AuraFx } from "../graphic/vfx.js"
import { Collider } from "../physic/collision.js"
import { RammingDamage } from "../logic/ramming-damage.js"
import { Colors } from "../graphic/assets/colors.js"
import { Render } from "../graphic/render.js"
import { Random } from "../math/random.js"
import { TargetFacing } from "../math/target-facing.js"
import { MissileControl } from "../logic/missile-control.js"

// TODO: Should we have one file per weapon?

class GatlingBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		// TODO: refactor player bullets (wait for other factors...)
		super(
			new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges), 

			new Collider(7, Tags.player | Tags.bullet),
			new RammingDamage(9, Tags.hostile | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.playerGatlingBullet),
			new OnRemoveExplosion(7 /* Collider.radius */ / 15, [ Colors.black, Colors.grey, Colors.yellow, Colors.orange ], 7 /* Collider.radius */ * 1.5)
		)
	}
}

/** @implements {import("../core/engine").Routine} */
export class GatlingPlayerWeaponRoutine {
	/** @param {UserInputCapturer} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		this.userInput = userInput
		this.game = game
		this.universe = universe

		/** @private @type {Player} */
		this.player = null

		this.nextShotTime = Number.NEGATIVE_INFINITY
		this.reloadTime = 0.13

		this.energy = this.energyMax = 113
		this.energyRegen = 23
		this.energyConsumption = 5
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player)
			this.player = link
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null
	}

	onStep() {
		if (!this.player)
			return

		if (
			   this.nextShotTime < this.universe.clock.time // Has reloaded?
			&& this.energyConsumption <= this.energy // Has energy?
			&& this.userInput.isPressed(this.game.keyBindings.shoot) // Has order?
		) {
			this.nextShotTime = this.universe.clock.time + this.reloadTime
			this.energy -= this.energyConsumption

			const bullet = new GatlingBullet(
				this.player.get(Motion)[0]
					.position
					.copy
					.relativeOffsetBy({ x: 37, y: 0 })
			)

			// TODO: rotate bullet (if needed).
			// TODO: Apply damage boosters.

			this.universe.add(bullet)
		}

		if (this.energy < this.energyMax)
			this.energy += this.energyRegen * this.universe.clock.spf
	}
}


// ----



class ShockgunBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		// TODO: refactor player bullets (wait for other factors...)
		super(
			new Motion(position, Transform.angular(position.a, 700), Motion.removeOnEdges), 

			new Collider(7, Tags.player | Tags.bullet),
			new RammingDamage(9, Tags.hostile | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.playerShockgunBullet),
			new OnRemoveExplosion(7 /* Collider.radius */ / 15, [ Colors.black, Colors.grey, Colors.green, Colors.teal ], 7 /* Collider.radius */ * 1.5)
		)
	}
}

/** @implements {import("../core/engine").Routine} */
export class ShockgunPlayerWeaponRoutine {
	/** @param {UserInputCapturer} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		this.userInput = userInput
		this.game = game
		this.universe = universe

		/** @private @type {Player} */
		this.player = null

		this.nextShotTime = Number.NEGATIVE_INFINITY
		this.reloadTime = 0.37

		this.energy = this.energyMax = 113
		this.energyRegen = 23
		this.energyConsumption = 9
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player)
			this.player = link
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null
	}

	onStep() {
		if (!this.player)
			return

		if (
			   this.nextShotTime < this.universe.clock.time // Has reloaded?
			&& this.energyConsumption <= this.energy // Has energy?
			&& this.userInput.isPressed(this.game.keyBindings.shoot) // Has order?
		) {
			this.nextShotTime = this.universe.clock.time + this.reloadTime
			this.energy -= this.energyConsumption

			for (const i of [ -0.33, -0.11, +0.11, +0.33 ]) {
				const bullet = new ShockgunBullet(
					this.player.get(Motion)[0]
						.position
						.copy
						.rotateBy(i)
						.relativeOffsetBy({ x: 37, y: 0 })
				)

				// TODO: rotate bullet (if needed).
				// TODO: Apply damage boosters.

				this.universe.add(bullet)
			}
		}

		if (this.energy < this.energyMax)
			this.energy += this.energyRegen * this.universe.clock.spf
	}
}

// ----



class MissileBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		// TODO: refactor player bullets (wait for other factors...)
		super(
			new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),
			new MissileControl(Math.PI),

			new Collider(7, Tags.player | Tags.bullet),
			new RammingDamage(9, Tags.hostile | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.playerMissileBullet),
			new OnRemoveExplosion(7 /* Collider.radius */ / 15, [ Colors.black, Colors.grey, Colors.purple, Colors.pink ], 7 /* Collider.radius */ * 1.5)
		)
	}
}

/** @implements {import("../core/engine").Routine} */
export class MissilePlayerWeaponRoutine {
	/** @param {UserInputCapturer} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		this.userInput = userInput
		this.game = game
		this.universe = universe

		/** @private @type {Player} */
		this.player = null

		/** @private @type {Set<Link>} */
		this.missiles = new Set()

		/** @private @type {Set<Link>} */
		this.hostiles = new Set()

		/** @private */
		this.autolock = new Motion(this.userInput.mousePosition, undefined, Motion.ignoreEdges)

		this.nextShotTime = Number.NEGATIVE_INFINITY
		this.reloadTime = 0.13
		this.nextFireAngle = 0.4

		this.energy = this.energyMax = 113
		this.energyRegen = 23
		this.energyConsumption = 7
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player) {
			this.player = link

			this.universe.add(new Link(this.autolock, new AuraFx(37, Colors.red)))
		}

		else {
			const [ collider, missileControl ] = link.get(Collider, MissileControl)

			if (collider)
				if (Tags.match(collider.tag, Tags.hostile | Tags.ship))
					this.hostiles.add(link)

				else if (missileControl && Tags.match(collider.tag, Tags.player | Tags.bullet))
					this.missiles.add(link)
		}
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null

		else if (this.missiles.delete(link))
			;

		else if (this.hostiles.delete(link) && this.hostiles.size == 0)
			this.autolock.position = this.userInput.mousePosition
	}

	onStep() {
		if (this.player) {
			this.fireMoreMissiles()
			this.steerMissiles()
		}
	}

	/** @private */
	steerMissiles() {
		if (this.hostiles.size == 0)
			return;

		let closestHostilePosition = this.userInput.mousePosition
		let closestHostileDistance = Number.POSITIVE_INFINITY

		for (const hostile of this.hostiles) {
			const hostilePosition = hostile.get(Motion)[0].position
			const hostileDistance = hostilePosition.squaredLengthTo(this.userInput.mousePosition)

			if (hostileDistance < closestHostileDistance) {
				closestHostilePosition = hostilePosition
				closestHostileDistance = hostileDistance
			}
		}

		this.autolock.position = closestHostilePosition

		for (const missile of this.missiles) {
			const [ missileMotion, missileControl ] = missile.get(Motion, MissileControl)

			TargetFacing.smooth(
				missileMotion.position,
				missileMotion.velocity,
				closestHostilePosition,
				missileControl.steeringSpeed,
				this.universe.clock.spf
			)

			// Forward chasing.
			missileMotion.velocity.d = missileMotion.position.a
		}
	}

	/** @private */
	fireMoreMissiles() {
		if (
			   this.nextShotTime < this.universe.clock.time // Has reloaded?
			&& this.energyConsumption <= this.energy // Has energy?
			&& this.userInput.isPressed(this.game.keyBindings.shoot) // Has order?
		) {
			this.nextShotTime = this.universe.clock.time + this.reloadTime
			this.energy -= this.energyConsumption

			const bullet = new MissileBullet(
				this.player.get(Motion)[0]
					.position
					.copy
					.rotateBy(this.nextFireAngle *= -1)
					.relativeOffsetBy({ x: 37, y: 0 })
			)

			// TODO: rotate bullet (if needed).
			// TODO: Apply damage boosters.

			this.universe.add(bullet)
		}

		if (this.energy < this.energyMax)
			this.energy += this.energyRegen * this.universe.clock.spf
	}
}


// ----



class ChargerSBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		// TODO: refactor player bullets (wait for other factors...)
		super(
			new Motion(position, Transform.angular(position.a, Random.between(400, 800)), Motion.removeOnEdges), 

			new Collider(7, Tags.player | Tags.bullet),
			new RammingDamage(9, Tags.hostile | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.playerChargerBulletS),
			new OnRemoveExplosion(7 /* Collider.radius */ / 15, [ Colors.black, Colors.grey, Colors.red, Colors.orange ], 7 /* Collider.radius */ * 1.5)
		)
	}
}

class ChargerLBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		// TODO: refactor player bullets (wait for other factors...)
		super(
			new Motion(position, Transform.angular(position.a, Random.between(500, 700)), Motion.removeOnEdges),

			new Collider(7, Tags.player | Tags.bullet),
			new RammingDamage(9, Tags.hostile | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.playerChargerBulletL),
			new OnRemoveExplosion(7 /* Collider.radius */ / 15, [ Colors.black, Colors.grey, Colors.red, Colors.orange ], 7 /* Collider.radius */ * 1.5)
		)
	}
}

/** @implements {import("../core/engine").Routine} */
export class ChargerPlayerWeaponRoutine {
	/** @param {UserInputCapturer} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		this.userInput = userInput
		this.game = game
		this.universe = universe

		/** @private @type {Player} */
		this.player = null

		this.charge = 0

		this.energy = this.energyMax = 113
		this.energyRegen = 23
		this.energyConsumption = 47
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player)
			this.player = link
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null
	}

	onStep() {
		if (!this.player)
			return

		if (
			   this.userInput.isPressed(this.game.keyBindings.shoot) // Must charge?
			&& 0 < this.energy // Has energy?
		) {
			const transfer = Math.min(this.energyConsumption * this.universe.clock.spf, this.energy)

			this.charge += transfer
			this.energy -= transfer
		}

		else if (
			   this.userInput.wasReleased(this.game.keyBindings.shoot) // Must fire?
			&& 0 < this.charge // Has charged?
		) {
			const largeBulletCost = 7
			const smallBulletCost = 3

			const playerPosition = this.player.get(Motion)[0].position

			while (smallBulletCost < this.charge) {
				if (0 <= this.charge - largeBulletCost) {
					this.charge -= largeBulletCost

					this.universe.add(new ChargerLBullet(
						playerPosition
							.copy
							.rotateBy(Random.between(-0.22, +0.22))
							.relativeOffsetBy({ x: 37, y: 0 })
					))
				}

				if (0 <= this.charge - smallBulletCost) {
					this.charge -= smallBulletCost

					this.universe.add(new ChargerSBullet(
						playerPosition
							.copy
							.rotateBy(Random.between(-0.22, +0.22))
							.relativeOffsetBy({ x: 37, y: 0 })
					))
				}
			}

			this.charge = 0
		}

		else if (this.energy < this.energyMax)
			this.energy += this.energyRegen * this.universe.clock.spf
	}
}
