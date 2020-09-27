import { Link } from "../core/engine.js"
import { Colors } from "../graphic/assets/colors.js"
import { Sprites } from "../graphic/assets/sprites.js"
import { Render } from "../graphic/render.js"
import { OnAddExplosion, OnRemoveExplosion } from "../graphic/vfx.js"
import { HostileShip } from "../logic/hostile.js"
import { HpGauge } from "../logic/life-and-death.js"
import { PlayerEnergy, PlayerShip, PlayerStuff } from "../logic/player.js"
import { RammingDamage } from "../logic/ramming-damage.js"
import { Collider } from "../physic/collision.js"
import { Motion } from "../physic/motion.js"

/** @param {Transform} position @param {Transform} velocity @param {Sprite} sprite */
export function player(position, velocity, sprite) {
	return new Link(
		PlayerStuff,
		PlayerShip,

		new Motion(position, velocity, 0.6),

		new Collider(28),
		new RammingDamage(23, HostileShip, RammingDamage.bounceOnDamage),

		new HpGauge(101),
		new PlayerEnergy(),

		new Render(sprite),
		new OnAddExplosion(2, [ Colors.black, Colors.grey, Colors.orange, Colors.purple ], 300),
		new OnRemoveExplosion(1, [ Colors.light, Colors.grey, Colors.orange, Colors.purple ], 600)
	)
}

/** @param {Transform} position */
export function turretPlayer(position) {
	return new Link(
		PlayerStuff,
		PlayerShip,

		new Motion(position, undefined, Motion.ignoreEdges),

		new Collider(18),
		new RammingDamage(23, HostileShip, RammingDamage.bounceOtherOnDamage),

		new HpGauge(101),
		new PlayerEnergy(),

		new Render(Sprites.turretBossBase, Sprites.turretBoss),
		new OnAddExplosion(2, [ Colors.black, Colors.grey, Colors.orange, Colors.purple ], 300),
		new OnRemoveExplosion(1, [ Colors.light, Colors.grey, Colors.orange, Colors.purple ], 600)
	)
}
