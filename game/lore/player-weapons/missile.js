import { Link } from "../../core/engine.js"
import { Transform } from "../../math/transform.js"
import { Collider } from "../../physic/collision.js"
import { Motion } from "../../physic/motion.js"
import { MissileControl } from "../../logic/missile-control.js"
import { Tags } from "../tags.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { Render } from "../../graphic/render.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { AuraFx, OnRemoveExplosion } from "../../graphic/vfx.js"
import { Colors } from "../../graphic/assets/colors.js"
import { UserInputRegistry } from "../../ux/user-input-capture.js"
import { GameKeeper } from "../game-keeper.js"
import { Universe } from "../../core/engine.js"
import { Player, PlayerEnergy } from "../player.js"
import { Flag } from "../../math/flag.js"
import { TargetFacing } from "../../math/target-facing.js"

class MissileBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		const r = 7

		super(
			new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),
			new MissileControl(Math.PI),

			new Collider(r, Tags.player | Tags.bullet),
			new RammingDamage(9, Tags.hostile | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.playerMissileBullet),
			new OnRemoveExplosion(r / 15, [ Colors.black, Colors.grey, Colors.purple, Colors.pink ], r * 1.5)
		)
	}
}

class DoubleMissileBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		const r = 7

		super(
			new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),
			new MissileControl(Math.PI),

			new Collider(r, Tags.player | Tags.bullet),
			new RammingDamage(9, Tags.hostile | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.playerDoubleMissileBullet),
			new OnRemoveExplosion(r / 15, [ Colors.black, Colors.grey, Colors.purple, Colors.pink ], r * 1.5)
		)
	}
}

/** @implements {import("../../core/engine").Routine} */
export class MissilePlayerWeaponRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe */
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
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player) {
			this.player = link
			this.player.get(PlayerEnergy)[0].weaponConsumption = 5

			this.universe.add(new Link(this.autolock, new AuraFx(37, Colors.red)))
		}

		else {
			const [ collider, missileControl ] = link.get(Collider, MissileControl)

			if (collider)
				if (Flag.contains(collider.tag, Tags.hostile | Tags.ship))
					this.hostiles.add(link)

				else if (missileControl && Flag.contains(collider.tag, Tags.player | Tags.bullet))
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
		const [ playerEnergy ] = this.player.get(PlayerEnergy)

		if (
			   this.nextShotTime < this.universe.clock.time // Has reloaded?
			&& playerEnergy.weaponConsumption <= playerEnergy.weapon // Has energy?
			&& this.userInput.isPressed(this.game.keyBindings.shoot) // Has order?
		) {
			this.nextShotTime = this.universe.clock.time + this.reloadTime
			playerEnergy.weapon -= playerEnergy.weaponConsumption

			const bullet = new MissileBullet(
				this.player.get(Motion)[0]
					.position
					.copy
					.rotateBy(this.nextFireAngle *= -1)
					.relativeOffsetBy({ x: 37, y: 0 })
			)

			this.universe.add(bullet)
		}

		if (playerEnergy.weapon < playerEnergy.weaponMax)
			playerEnergy.weapon += playerEnergy.weaponRegen * this.universe.clock.spf
	}
}

/** @implements {import("../../core/engine").Routine} */
export class DoubleMissilePlayerWeaponRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe */
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
		this.fireAngles = [ -0.4, -0.1, +0.1, +0.4 ]
		this.nextFireAngle = 0
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player) {
			this.player = link
			this.player.get(PlayerEnergy)[0].weaponConsumption = 5

			this.universe.add(new Link(this.autolock, new AuraFx(37, Colors.red)))
		}

		else {
			const [ collider, missileControl ] = link.get(Collider, MissileControl)

			if (collider)
				if (Flag.contains(collider.tag, Tags.hostile | Tags.ship))
					this.hostiles.add(link)

				else if (missileControl && Flag.contains(collider.tag, Tags.player | Tags.bullet))
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
		const [ playerEnergy ] = this.player.get(PlayerEnergy)

		if (
			   this.nextShotTime < this.universe.clock.time // Has reloaded?
			&& playerEnergy.weaponConsumption <= playerEnergy.weapon // Has energy?
			&& this.userInput.isPressed(this.game.keyBindings.shoot) // Has order?
		) {
			this.nextShotTime = this.universe.clock.time + this.reloadTime
			playerEnergy.weapon -= playerEnergy.weaponConsumption

			const bullet = new DoubleMissileBullet(
				this.player.get(Motion)[0]
					.position
					.copy
					.rotateBy(this.fireAngles[++this.nextFireAngle % this.fireAngles.length])
					.relativeOffsetBy({ x: 37, y: 0 })
			)

			this.universe.add(bullet)
		}

		if (playerEnergy.weapon < playerEnergy.weaponMax)
			playerEnergy.weapon += playerEnergy.weaponRegen * this.universe.clock.spf
	}
}
