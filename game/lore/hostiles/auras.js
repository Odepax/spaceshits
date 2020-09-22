import { Link } from "../../core/engine.js"
import { Colors } from "../../graphic/assets/colors.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { Render } from "../../graphic/render.js"
import { AuraFx, OnAddExplosion, OnRemoveExplosion } from "../../graphic/vfx.js"
import { AutoFieldModule } from "../../logic/auto-field.js"
import { HealField } from "../../logic/heal-field.js"
import { HostileShip, HostileStuff } from "../../logic/hostile.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { PlayerBullet, PlayerShip } from "../../logic/player.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { Transform } from "../../math/transform.js"
import { Collider } from "../../physic/collision.js"
import { Motion } from "../../physic/motion.js"

/** @param {Transform} position */
export function shieldAura(position) {
	return new Link(
		HostileStuff,
		HostileShip,

		new Motion(position, undefined, Motion.ignoreEdges),

		new Collider(21),
		new RammingDamage(13, PlayerShip, RammingDamage.bounceOtherOnDamage),

		new HpGauge(101),

		new AutoFieldModule(aura => new shield(aura.get(Motion)[0].position), 5),

		new Render(Sprites.auraShield),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.silver, Colors.blue ], 50),
		new OnRemoveExplosion(0.5, [ Colors.blue, Colors.black, Colors.grey, Colors.silver ], 100)
	)
}

export function medicAura(position) {
	return new Link(
		HostileStuff,
		HostileShip,

		new Motion(position, undefined, Motion.ignoreEdges),

		new Collider(21),
		new RammingDamage(13, PlayerShip, RammingDamage.bounceOtherOnDamage),

		new HpGauge(101),

		new AutoFieldModule(aura => new medicShield(aura.get(Motion)[0].position), 5),

		new Render(Sprites.auraMedic),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.teal, Colors.green ], 50),
		new OnRemoveExplosion(0.5, [ Colors.green, Colors.black, Colors.grey, Colors.teal ], 100)
	)
}

/** @param {Transform} position */
export function shield(position) {
	return new Link(
		new Motion(position, undefined, Motion.ignoreEdges),

		new Collider(101),
		new RammingDamage(0, PlayerBullet, RammingDamage.ignoreDamage),

		new HpGauge(123, 13),

		new AuraFx(101, Colors.blue)
	)
}

/** @param {Transform} position */
function medicShield(position) {
	return new Link(
		new Motion(position, undefined, Motion.ignoreEdges),

		new Collider(101),
		new RammingDamage(0, PlayerBullet, RammingDamage.ignoreDamage),
		new HealField(13, HostileShip),

		new HpGauge(123, 13),

		new AuraFx(101, Colors.green)
	)
}
