import { Link } from "../core/engine.js"
import { Motion } from "../physic/motion.js"
import { Transform } from "../math/transform.js"
import { Sprites } from "../graphic/assets/sprites.js"
import { Collider } from "../physic/collision.js"
import { Tags } from "./tags.js"
import { RammingDamage } from "../logic/ramming-damage.js"
import { OnAddExplosion, OnRemoveExplosion } from "../graphic/vfx.js"
import { Colors } from "../graphic/assets/colors.js"
import { HpGauge } from "../logic/life-and-death.js"
import { Render } from "../graphic/render.js"

export class PlayerEnergy {
	constructor() {
		this.weapon = this.weaponMax = 113
		this.weaponRegen = 23
		this.weaponConsumption = 5

		this.aux = this.auxMax = 113
		this.auxRegen = 23
		this.auxConsumption = 5
	}
}

export class Player extends Link {
	constructor() {
		super(
			new Motion(new Transform(700 * 0.5, 700 * 0.8), undefined, 0.6),

			new Collider(28, Tags.player | Tags.ship),
			new RammingDamage(23, Tags.hostile | Tags.ship, RammingDamage.bounceOnDamage),

			new HpGauge(101),
			new PlayerEnergy(),

			new Render(Sprites.playerMissile),
			new OnAddExplosion(2, [ Colors.black, Colors.grey, Colors.orange, Colors.purple ], 300),
			new OnRemoveExplosion(1, [ Colors.light, Colors.grey, Colors.orange, Colors.purple ], 600)
		)
	}
}
