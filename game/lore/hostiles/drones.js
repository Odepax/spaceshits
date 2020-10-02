import { Link, Universe } from "../../core/engine.js"
import { Colors } from "../../graphic/assets/colors.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { Render } from "../../graphic/render.js"
import { OnAddExplosion, OnRemoveExplosion } from "../../graphic/vfx.js"
import { AutoWeaponModule } from "../../logic/auto-weapon.js"
import { HostileBullet, HostileDrone, HostileShip, HostileStuff } from "../../logic/hostile.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { PlayerShip } from "../../logic/player.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { Random } from "../../math/random.js"
import { TargetFacing } from "../../math/target-facing.js"
import { Transform } from "../../math/transform.js"
import { Collider } from "../../physic/collision.js"
import { Motion } from "../../physic/motion.js"
import { DRONE_ANY_STEER, DRONE_COLLISION_DAMAGE, DRONE_COMBAT_BULLET_DAMAGE, DRONE_COMBAT_BULLET_SPEED, DRONE_COMBAT_COLLISION_DAMAGE, DRONE_COMBAT_GUN_RELOAD_MAX, DRONE_COMBAT_GUN_RELOAD_MIN, DRONE_COMBAT_HP, DRONE_COMBAT_SPEED_MAX, DRONE_COMBAT_SPEED_MIN, DRONE_HP, DRONE_SPEED_MAX, DRONE_SPEED_MIN } from "../game-balance.js"

/** @param {Transform} position */
export function drone(position) {
	return new Link(
		HostileStuff,
		HostileShip,
		HostileDrone,

		new Motion(position, Transform.angular(position.a, Random.between(DRONE_SPEED_MIN, DRONE_SPEED_MAX)), 1),

		new Collider(16),
		new RammingDamage(DRONE_COLLISION_DAMAGE, PlayerShip, RammingDamage.bounceOnDamage),

		new HpGauge(DRONE_HP),

		new Render(Sprites.drone),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.silver, Colors.blue ], 60),
		new OnRemoveExplosion(0.5, [ Colors.blue, Colors.black, Colors.grey, Colors.silver ], 120)
	)
}

/** @param {Transform} position */
export function combatDrone(position) {
	return new Link(
		HostileStuff,
		HostileShip,
		HostileDrone,

		new Motion(position, Transform.angular(Random.angle(), Random.between(DRONE_COMBAT_SPEED_MIN, DRONE_COMBAT_SPEED_MAX)), 1),

		new Collider(16),
		new RammingDamage(DRONE_COMBAT_COLLISION_DAMAGE, PlayerShip, RammingDamage.bounceOtherOnDamage),

		new HpGauge(DRONE_COMBAT_HP),

		new AutoWeaponModule(Random.between(DRONE_COMBAT_GUN_RELOAD_MIN, DRONE_COMBAT_GUN_RELOAD_MAX), drone => {
			const dronePosition = drone.get(Motion)[0].position

			return [ -9, +9 ].map(i => combatDroneBullet(
				dronePosition
					.copy
					.relativeOffsetBy({ x: 30.6, y: i })
			))
		}),

		new Render(Sprites.combatDrone),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.blue, Colors.purple ], 60),
		new OnRemoveExplosion(0.5, [ Colors.purple, Colors.black, Colors.grey, Colors.pink ], 120)
	)
}

/** @param {Transform} position */
function combatDroneBullet(position) {
	return new Link(
		HostileStuff,
		HostileBullet,

		new Motion(position, Transform.angular(position.a, DRONE_COMBAT_BULLET_SPEED), Motion.removeOnEdges),

		new Collider(7),
		new RammingDamage(DRONE_COMBAT_BULLET_DAMAGE, PlayerShip, RammingDamage.removeOnDamage),

		new Render(Sprites.combatDroneBullet),
		new OnRemoveExplosion(0.5, [ Colors.light, Colors.purple, Colors.blue ], 15)
	)
}

/** @implements {import("../../core/engine").Routine */
export class DroneAimRoutine {
	/** @param {Universe} universe */
	constructor(universe) {
		this.universe = universe
		/** @private @type {Link} */
		this.player = null

		/** @private @type {Set<Link>} */
		this.drones = new Set()
	}

	/** @param {Link} link */
	onAdd(link) {
		if (link.has(PlayerShip))
			this.player = link

		else if (link.has(HostileDrone))
			this.drones.add(link)
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null

		else
			this.drones.delete(link)
	}

	onStep() {
		if (this.player)
		for (const drone of this.drones) {
			const [ { position: dronePosition, velocity: droneVelocity } ] = drone.get(Motion)
			const [ { position: playerPosition } ] = this.player.get(Motion)

			if (dronePosition.squaredLengthTo(playerPosition) < 400 ** 2)
				TargetFacing.smooth(
					dronePosition,
					droneVelocity,
					playerPosition,
					DRONE_ANY_STEER,
					this.universe.clock.spf
				)

			else
				droneVelocity.a = Math.PI / 4
		}
	}
}
