import { Link } from "../../core/engine.js"
import { Motion } from "../../physic/motion.js"
import { Transform } from "../../math/transform.js"
import { Collider } from "../../physic/collision.js"
import { Tags } from "../tags.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { AutoWeaponModule } from "../../logic/auto-weapon.js"
import { Render } from "../../graphic/render.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { OnAddExplosion, OnRemoveExplosion } from "../../graphic/vfx.js"
import { Colors } from "../../graphic/assets/colors.js"
import { Player } from "../player.js"
import { AutoIteratingRoutine } from "../../core/routines.js"
import { TargetFacing } from "../../math/target-facing.js"

// TODO: refactor hostile bullets (wait for other factors...)
// TODO: refactor hostiles (wait for other factors...)

class TurretBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		super(
			new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),

			new Collider(7, Tags.hostile | Tags.bullet),
			new RammingDamage(9, Tags.player | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.turretBullet),
			new OnRemoveExplosion(7 /* Collider.radius */ / 15, [ Colors.light, Colors.white, Colors.silver ], 7 /* Collider.radius */ * 1.5)
		)
	}
}

export class Turret extends Link {
	/** @param {number} x @param {number} y */
	constructor(x, y) {
		super(
			new Motion(new Transform(x, y), undefined, Motion.ignoreEdges),

			new Collider(21, Tags.hostile | Tags.ship),
			new RammingDamage(13, Tags.player | Tags.ship, RammingDamage.bounceOtherOnDamage),

			new HpGauge(101),

			new AutoWeaponModule(3, turret => [
				new TurretBullet(
					turret.get(Motion)[0]
						.position
						.copy
						.relativeOffsetBy({ x: 37, y: 0 })
				)
			]),

			new Render(Sprites.turretBase, Sprites.turret),
			new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.silver, Colors.yellow ], 50),
			new OnRemoveExplosion(0.5, [ Colors.yellow, Colors.black, Colors.grey, Colors.silver ], 100)
		)
	}
}

export class TurretAimRoutine extends AutoIteratingRoutine {
	constructor() {
		super()

		/** @private @type {Player} */
		this.player = null
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player)
			this.player = link

		else
			super.onAdd(link)
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null

		else
			super.onRemove(link)
	}

	/** @param {Link} link */
	accepts(link) {
		return link instanceof Turret
	}

	onStep() {
		if (this.player)
			super.onStep()
	}

	/** @param {Link} link */
	onSubStep(link) {
		const [ turretMotion ] = link.get(Motion)
		const [ playerMotion ] = this.player.get(Motion)

		TargetFacing.instant(turretMotion.position, playerMotion.position)
	}
}
