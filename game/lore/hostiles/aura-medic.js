import { Link } from "../../core/engine.js"
import { Transform } from "../../math/transform.js"
import { Motion } from "../../physic/motion.js"
import { Collider } from "../../physic/collision.js"
import { Tags } from "../tags.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { HealField } from "../../logic/heal-field.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { AutoFieldModule } from "../../logic/auto-field.js"
import { Render } from "../../graphic/render.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { OnAddExplosion, OnRemoveExplosion, AuraFx } from "../../graphic/vfx.js"
import { Colors } from "../../graphic/assets/colors.js"

export class AuraMedic extends Link {
	/** @param {number} x @param {number} y */
	constructor(x, y) {
		super(
			new Motion(new Transform(x, y), undefined, 1),

			new Collider(21, Tags.hostile | Tags.ship),
			new RammingDamage(13, Tags.player | Tags.ship, RammingDamage.bounceOtherOnDamage),

			new HpGauge(101),

			new AutoFieldModule(aura => new HealShield(aura.get(Motion)[0].position), 5),

			new Render(Sprites.auraMedic),
			new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.teal, Colors.green ], 50),
			new OnRemoveExplosion(0.5, [ Colors.green, Colors.black, Colors.grey, Colors.teal ], 100)
		)
	}
}

class HealShield extends Link {
	/** @param {Transform} position */
	constructor(position, radius = 101) {
		super(
			new Motion(position, undefined, Motion.ignoreEdges),

			new Collider(radius, Tags.hostile | Tags.field),
			new RammingDamage(0, Tags.player | Tags.bullet, RammingDamage.ignoreDamage),
			new HealField(13, Tags.hostile | Tags.ship),

			new HpGauge(123, 13),

			new AuraFx(radius, Colors.green)
		)
	}
}
