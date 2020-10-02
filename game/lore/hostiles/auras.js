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
import { AURA_MEDIC_COLLISION_DAMAGE, AURA_MEDIC_FIELD_HEAL, AURA_MEDIC_FIELD_HP, AURA_MEDIC_FIELD_HP_REGEN, AURA_MEDIC_FIELD_RELOAD, AURA_MEDIC_HP, AURA_SHIELD_COLLISION_DAMAGE, AURA_SHIELD_FIELD_HP, AURA_SHIELD_FIELD_HP_REGEN, AURA_SHIELD_FIELD_RELOAD, AURA_SHIELD_HP } from "../game-balance.js"

/** @param {Transform} position */
export function shieldAura(position) {
	return new Link(
		HostileStuff,
		HostileShip,

		new Motion(position, undefined, Motion.ignoreEdges),

		new Collider(21),
		new RammingDamage(AURA_SHIELD_COLLISION_DAMAGE, PlayerShip, RammingDamage.bounceOtherOnDamage),

		new HpGauge(AURA_SHIELD_HP),

		new AutoFieldModule(aura => shield(aura.get(Motion)[0].position), AURA_SHIELD_FIELD_RELOAD),

		new Render(Sprites.auraShield),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.silver, Colors.blue ], 75),
		new OnRemoveExplosion(0.5, [ Colors.blue, Colors.black, Colors.grey, Colors.silver ], 150)
	)
}

export function medicAura(position) {
	return new Link(
		HostileStuff,
		HostileShip,

		new Motion(position, undefined, Motion.ignoreEdges),

		new Collider(21),
		new RammingDamage(AURA_MEDIC_COLLISION_DAMAGE, PlayerShip, RammingDamage.bounceOtherOnDamage),

		new HpGauge(AURA_MEDIC_HP),

		new AutoFieldModule(aura => medicShield(aura.get(Motion)[0].position), AURA_MEDIC_FIELD_RELOAD),

		new Render(Sprites.auraMedic),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.teal, Colors.green ], 75),
		new OnRemoveExplosion(0.5, [ Colors.green, Colors.black, Colors.grey, Colors.teal ], 150)
	)
}

/** @param {Transform} position */
function shield(position) {
	return new Link(
		new Motion(position, undefined, Motion.ignoreEdges),

		new Collider(101),
		new RammingDamage(0, PlayerBullet, RammingDamage.ignoreDamage),

		new HpGauge(AURA_SHIELD_FIELD_HP, AURA_SHIELD_FIELD_HP_REGEN),

		new AuraFx(101, Colors.blue)
	)
}

/** @param {Transform} position */
function medicShield(position) {
	return new Link(
		new Motion(position, undefined, Motion.ignoreEdges),

		new Collider(101),
		new RammingDamage(0, PlayerBullet, RammingDamage.ignoreDamage),
		new HealField(AURA_MEDIC_FIELD_HEAL, HostileShip),

		new HpGauge(AURA_MEDIC_FIELD_HP, AURA_MEDIC_FIELD_HP_REGEN),

		new AuraFx(101, Colors.green)
	)
}
