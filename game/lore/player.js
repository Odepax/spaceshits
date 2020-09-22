import { Link } from "../core/engine.js"
import { Colors } from "../graphic/assets/colors.js"
import { Render } from "../graphic/render.js"
import { OnAddExplosion, OnRemoveExplosion } from "../graphic/vfx.js"
import { HostileShip } from "../logic/hostile.js"
import { HpGauge } from "../logic/life-and-death.js"
import { PlayerEnergy, PlayerShip, PlayerStuff } from "../logic/player.js"
import { RammingDamage } from "../logic/ramming-damage.js"
import { Collider } from "../physic/collision.js"
import { Motion } from "../physic/motion.js"

/** @param {Transform} position @param {Transform} velocity @param {Sprite} sprites @param {number} damageReaction */
export function player(position, velocity, sprites, damageReaction = RammingDamage.bounceOnDamage) {
	return new Link(
		PlayerStuff,
		PlayerShip,

		new Motion(position, velocity, 0.6),

		new Collider(28),
		new RammingDamage(23, HostileShip, damageReaction),

		new HpGauge(101),
		new PlayerEnergy(),

		new Render(...sprites),
		new OnAddExplosion(2, [ Colors.black, Colors.grey, Colors.orange, Colors.purple ], 300),
		new OnRemoveExplosion(1, [ Colors.light, Colors.grey, Colors.orange, Colors.purple ], 600)
	)
}
