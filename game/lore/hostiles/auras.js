import { Link } from "../../core/engine.js"
import { Transform } from "../../math/transform.js"
import { Motion } from "../../physic/motion.js"
import { Collider } from "../../physic/collision.js"
import { Tags } from "../tags.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { AutoFieldModule } from "../../logic/auto-field.js"
import { Render } from "../../graphic/render.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { AuraFx, OnAddExplosion, OnRemoveExplosion } from "../../graphic/vfx.js"
import { Colors } from "../../graphic/assets/colors.js"
import { HealField } from "../../logic/heal-field.js"

export class ShieldAura extends Link {
	/** @param {Transform} position */
	constructor(position) {
		super(
			new Motion(position, undefined, Motion.ignoreEdges),

			new Collider(21, Tags.hostile | Tags.ship),
			new RammingDamage(13, Tags.player | Tags.ship, RammingDamage.bounceOtherOnDamage),

			new HpGauge(101),

			new AutoFieldModule(aura => new Shield(aura.get(Motion)[0].position), 5),

			new Render(Sprites.auraShield),
			new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.silver, Colors.blue ], 50),
			new OnRemoveExplosion(0.5, [ Colors.blue, Colors.black, Colors.grey, Colors.silver ], 100)
		)
	}
}

export class MedicAura extends Link {
	/** @param {Transform} position */
	constructor(position) {
		super(
			new Motion(position, undefined, Motion.ignoreEdges),

			new Collider(21, Tags.hostile | Tags.ship),
			new RammingDamage(13, Tags.player | Tags.ship, RammingDamage.bounceOtherOnDamage),

			new HpGauge(101),

			new AutoFieldModule(aura => new MedicShield(aura.get(Motion)[0].position), 5),

			new Render(Sprites.auraMedic),
			new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.teal, Colors.green ], 50),
			new OnRemoveExplosion(0.5, [ Colors.green, Colors.black, Colors.grey, Colors.teal ], 100)
		)
	}
}

class Shield extends Link {
	/** @param {Transform} position */
	constructor(position) {
		const r = 101

		super(
			new Motion(position, undefined, Motion.ignoreEdges),

			new Collider(r, Tags.hostile | Tags.field),
			new RammingDamage(0, Tags.player | Tags.bullet, RammingDamage.ignoreDamage),

			new HpGauge(123, 13),

			new AuraFx(r, Colors.blue)
		)
	}
}

class MedicShield extends Link {
	/** @param {Transform} position */
	constructor(position) {
		const r = 101

		super(
			new Motion(position, undefined, Motion.ignoreEdges),

			new Collider(r, Tags.hostile | Tags.field),
			new RammingDamage(0, Tags.player | Tags.bullet, RammingDamage.ignoreDamage),
			new HealField(13, Tags.hostile | Tags.ship),

			new HpGauge(123, 13),

			new AuraFx(r, Colors.green)
		)
	}
}
