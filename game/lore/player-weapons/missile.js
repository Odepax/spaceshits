import { Link, Universe } from "../../core/engine.js"
import { Colors } from "../../graphic/assets/colors.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { Render } from "../../graphic/render.js"
import { OnRemoveExplosion } from "../../graphic/vfx.js"
import { HostileShip } from "../../logic/hostile.js"
import { MissileControl } from "../../logic/missile-control.js"
import { PlayerBullet, PlayerMissile, PlayerStuff, PlayerWeaponRoutine } from "../../logic/player.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { TargetFacing } from "../../math/target-facing.js"
import { Transform } from "../../math/transform.js"
import { Collider } from "../../physic/collision.js"
import { Motion } from "../../physic/motion.js"
import { UserInputRegistry } from "../../ux/user-input-capture.js"
import { GameKeeper } from "../game-keeper.js"

/** @param {Transform} position */
function missileBullet(position) {
	return new Link(
		PlayerStuff,
		PlayerBullet,
		PlayerMissile,

		new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),
		new MissileControl(Math.PI),

		new Collider(7),
		new RammingDamage(9, HostileShip, RammingDamage.removeOnDamage),

		new Render(Sprites.playerMissileBullet),
		new OnRemoveExplosion(0.5, [ Colors.black, Colors.grey, Colors.purple, Colors.pink ], 10)
	)
}

/** @param {Transform} position */
function doubleMissileBullet(position) {
	return new Link(
		PlayerStuff,
		PlayerBullet,
		PlayerMissile,

		new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),
		new MissileControl(Math.PI),

		new Collider(7),
		new RammingDamage(9, HostileShip, RammingDamage.removeOnDamage),

		new Render(Sprites.playerDoubleMissileBullet),
		new OnRemoveExplosion(0.5, [ Colors.black, Colors.grey, Colors.purple, Colors.pink ], 10)
	)
}

/** @implements {import("../../core/engine").Routine} */
export class MissilePlayerWeaponRoutine extends PlayerWeaponRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		super(userInput, game, universe, 0.19, 19)

		this.nextFireAngle = 0.4
	}

	/** @protected */
	fire() {
		const playerPosition = this.player.get(Motion)[0].position

		this.universe.add(missileBullet(
			playerPosition
				.copy
				.rotateBy(this.nextFireAngle *= -1)
				.relativeOffsetBy({ x: 37, y: 0 })
		))
	}
}

/** @implements {import("../../core/engine").Routine} */
export class DoubleMissilePlayerWeaponRoutine extends PlayerWeaponRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		super(userInput, game, universe, 0.19, 19)

		this.fireAngles = [ -0.4, -0.1, +0.1, +0.4 ]
		this.nextFireAngle = 0
	}

	/** @protected */
	fire() {
		const playerPosition = this.player.get(Motion)[0].position

		this.universe.add(doubleMissileBullet(
			playerPosition
				.copy
				.rotateBy(this.fireAngles[++this.nextFireAngle % this.fireAngles.length])
				.relativeOffsetBy({ x: 37, y: 0 })
		))
	}
}

/** @implements {import("../../core/engine").Routine} */
export class PlayerMissileControlRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		this.userInput = userInput
		this.game = game
		this.universe = universe

		/** @private @type {Set<Link>} */
		this.missiles = new Set()

		/** @private @type {Set<Link>} */
		this.hostiles = new Set()

		/** @private */
		this.autolock = new Motion(this.userInput.mousePosition, undefined, Motion.ignoreEdges)
	}

	/** @param {Link} link */
	onAdd(link) {
		if (link.has(PlayerShip))
			this.universe.add(new Link(
				this.autolock,
				new AuraFx(37, Colors.red)
			))

		else if (link.has(PlayerMissile))
			this.missiles.add(link)

		else if (link.has(HostileShip))
			this.hostiles.add(link)
	}

	/** @param {Link} link */
	onRemove(link) {
		if (this.missiles.delete(link))
			;

		else if (this.hostiles.delete(link) && this.hostiles.size == 0)
			this.autolock.position = this.userInput.mousePosition
	}

	onStep() {
		if (this.missiles.size == 0 || this.hostiles.size == 0)
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
}
