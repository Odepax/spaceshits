import { Link, Universe } from "../../core/engine.js"
import { Colors } from "../../graphic/assets/colors.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { Render } from "../../graphic/render.js"
import { OnAddExplosion, OnRemoveExplosion } from "../../graphic/vfx.js"
import { AutoWeaponModule } from "../../logic/auto-weapon.js"
import { HostileBullet, HostileShip, HostileSmartTurret, HostileStuff, HostileTurret } from "../../logic/hostile.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { PlayerShip } from "../../logic/player.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { Random } from "../../math/random.js"
import { TargetFacing } from "../../math/target-facing.js"
import { Transform } from "../../math/transform.js"
import { Collider } from "../../physic/collision.js"
import { Motion } from "../../physic/motion.js"
import { TURRET_COLLISION_DAMAGE, TURRET_GUN_BULLET_DAMAGE, TURRET_GUN_BULLET_SPEED, TURRET_GUN_RELOAD_MAX, TURRET_GUN_RELOAD_MIN, TURRET_HP, TURRET_SMART_COLLISION_DAMAGE, TURRET_SMART_GUN_BULLET_DAMAGE, TURRET_SMART_GUN_BULLET_SPEED, TURRET_SMART_GUN_RELOAD_MAX, TURRET_SMART_GUN_RELOAD_MIN, TURRET_SMART_HP, TURRET_SMART_STEER } from "../game-balance.js"

/** @param {Transform} position */
export function turret(position) {
	return new Link(
		HostileStuff,
		HostileShip,
		HostileTurret,

		new Motion(position, undefined, Motion.ignoreEdges),

		new Collider(18),
		new RammingDamage(TURRET_COLLISION_DAMAGE, PlayerShip, RammingDamage.bounceOtherOnDamage),

		new HpGauge(TURRET_HP),

		new AutoWeaponModule(Random.between(TURRET_GUN_RELOAD_MIN, TURRET_GUN_RELOAD_MAX), turret => {
			const turretPosition = turret.get(Motion)[0].position

			return [ turretBullet(
				turretPosition
					.copy
					.relativeOffsetBy({ x: 39, y: 0 })
			) ]
		}),

		new Render(Sprites.turretBase, Sprites.turret),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.silver, Colors.yellow ], 75),
		new OnRemoveExplosion(0.5, [ Colors.yellow, Colors.black, Colors.grey, Colors.silver ], 150)
	)
}

/** @param {Transform} position */
export function smartTurret(position) {
	return new Link(
		HostileStuff,
		HostileShip,
		HostileSmartTurret,

		new Motion(position, undefined, Motion.ignoreEdges),

		new Collider(18),
		new RammingDamage(TURRET_SMART_COLLISION_DAMAGE, PlayerShip, RammingDamage.bounceOtherOnDamage),

		new HpGauge(TURRET_SMART_HP),

		new AutoWeaponModule(Random.between(TURRET_SMART_GUN_RELOAD_MIN, TURRET_SMART_GUN_RELOAD_MAX), turret => {
			const turretPosition = turret.get(Motion)[ 0 ].position

			return [ smartTurretBullet(
				turretPosition
					.copy
					.relativeOffsetBy({ x: 39, y: 0 })
			) ]
		}),

		new Render(Sprites.turretBase, Sprites.smartTurret),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.blue, Colors.purple ], 75),
		new OnRemoveExplosion(0.5, [ Colors.purple, Colors.black, Colors.grey, Colors.orange ], 150)
	)
}

/** @param {Transform} position */
function turretBullet(position) {
	return new Link(
		HostileStuff,
		HostileBullet,

		new Motion(position, Transform.angular(position.a, TURRET_GUN_BULLET_SPEED), Motion.removeOnEdges),

		new Collider(8),
		new RammingDamage(TURRET_GUN_BULLET_DAMAGE, PlayerShip, RammingDamage.removeOnDamage),

		new Render(Sprites.turretBullet),
		new OnRemoveExplosion(0.5, [ Colors.light, Colors.silver, Colors.white ], 18)
	)
}

/** @param {Transform} position */
function smartTurretBullet(position) {
	return new Link(
		HostileStuff,
		HostileBullet,

		new Motion(position, Transform.angular(position.a, TURRET_SMART_GUN_BULLET_SPEED), Motion.removeOnEdges),

		new Collider(8),
		new RammingDamage(TURRET_SMART_GUN_BULLET_DAMAGE, PlayerShip, RammingDamage.removeOnDamage),

		new Render(Sprites.smartTurretBullet),
		new OnRemoveExplosion(0.5, [ Colors.light, Colors.purple, Colors.blue ], 18)
	)
}

/** @implements {import("../../core/engine").Routine */
export class TurretAimRoutine {
	constructor(mark = HostileTurret) {
		/** @protected @type {Link} */
		this.player = null

		/** @protected @type {Set<Link>} */
		this.turrets = new Set()

		/** @private */
		this.mark = mark
	}

	/** @param {Link} link */
	onAdd(link) {
		if (link.has(PlayerShip))
			this.player = link

		else if (link.has(this.mark))
			this.turrets.add(link)
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null

		else
			this.turrets.delete(link)
	}

	onStep() {
		if (this.player) {
			const [ playerMotion ] = this.player.get(Motion)

			for (const turret of this.turrets) {
				const [ turretMotion ] = turret.get(Motion)

				this.steerTurret(turretMotion, playerMotion)
			}
		}
	}

	/** @param {Motion} turretMotion @param {Motion} playerMotion */
	steerTurret(turretMotion, playerMotion) {
		TargetFacing.instant(turretMotion.position, playerMotion.position)
	}
}

export class SmartTurretAimRoutine extends TurretAimRoutine {
	/** @param {Universe} universe */
	constructor(universe) {
		super(HostileSmartTurret)

		this.universe = universe
	}

	/** @param {Motion} turretMotion @param {Motion} playerMotion */
	steerTurret(turretMotion, playerMotion) {
		TargetFacing.anticipatedSmooth(
			turretMotion.position,
			turretMotion.velocity,
			playerMotion.position,
			playerMotion.velocity,
			TURRET_SMART_STEER,
			this.universe.clock.spf,
			TURRET_SMART_GUN_BULLET_SPEED
		)
	}
}
