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

export class Player extends Link {
	constructor() {
		super(
			new Motion(new Transform(100, 100), undefined, 0.6),

			new Collider(28, Tags.player | Tags.ship),
			new RammingDamage(23, Tags.hostile | Tags.ship, RammingDamage.bounceOnDamage),

			new HpGauge(101),

			new Render(Sprites.playerGatling),
			new OnAddExplosion(2, [ Colors.black, Colors.grey, Colors.orange, Colors.purple ], 300),
			new OnRemoveExplosion(1, [ Colors.light, Colors.grey, Colors.orange, Colors.purple ], 600)
		)
	}
}

export class Hostile extends Link {
	constructor(x = 300, y = 400, vx = 150, vy = 150) {
		super(
			new Motion(new Transform(x, y), new Transform(vx, vy, 0.2), 1),

			new Collider(21, Tags.hostile | Tags.ship),
			new RammingDamage(13, Tags.player | Tags.ship, RammingDamage.bounceOnDamage),

			new HpGauge(101),

			new Render(Sprites.cube),
			new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.silver, Colors.orange ], 50),
			new OnRemoveExplosion(0.5, [ Colors.orange, Colors.black, Colors.grey, Colors.silver ], 100)
		)
	}
}

export class Turret extends Link {
	constructor(x = 400, y = 300) {
		super(
			new Motion(new Transform(x, y), undefined, Motion.ignoreEdges),

			new Collider(21, Tags.hostile | Tags.ship),
			new RammingDamage(13, Tags.player | Tags.ship, RammingDamage.bounceOtherOnDamage),

			new HpGauge(101),

			new Render(Sprites.turretBase, Sprites.smartTurret),
			new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.silver, Colors.purple ], 50),
			new OnRemoveExplosion(0.5, [ Colors.purple, Colors.black, Colors.grey, Colors.blue ], 100)
		)
	}
}
