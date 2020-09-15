import { Link } from "../../core/engine.js"
import { Transform } from "../../math/transform.js"
import { Motion } from "../../physic/motion.js"
import { Collider } from "../../physic/collision.js"
import { Tags } from "../tags.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { AutoWeaponModule } from "../../logic/auto-weapon.js"
import { Render } from "../../graphic/render.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { OnAddExplosion, OnRemoveExplosion } from "../../graphic/vfx.js"
import { Colors } from "../../graphic/assets/colors.js"
import { TargetFacing } from "../../math/target-facing.js"
import { Universe } from "../../core/engine.js"

import { Player } from "../player.js"

export class Turret extends Link {
	/** @param {Transform} position */
	constructor(position) {
		super(
			new Motion(position, undefined, Motion.ignoreEdges),

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

export class SmartTurret extends Link {
	/** @param {Transform} position */
	constructor(position) {
		super(
			new Motion(position, undefined, Motion.ignoreEdges),

			new Collider(21, Tags.hostile | Tags.ship),
			new RammingDamage(13, Tags.player | Tags.ship, RammingDamage.bounceOtherOnDamage),

			new HpGauge(101),

			new AutoWeaponModule(3, turret => [
				new SmartTurretBullet(
					turret.get(Motion)[0]
						.position
						.copy
						.relativeOffsetBy({ x: 37, y: 0 })
				)
			]),

			new Render(Sprites.turretBase, Sprites.smartTurret),
			new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.blue, Colors.purple ], 50),
			new OnRemoveExplosion(0.5, [ Colors.purple, Colors.black, Colors.grey, Colors.orange ], 100)
		)
	}
}

class TurretBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		const r = 7

		super(
			new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),

			new Collider(r, Tags.hostile | Tags.bullet),
			new RammingDamage(9, Tags.player | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.turretBullet),
			new OnRemoveExplosion(r / 15, [ Colors.light, Colors.white, Colors.silver ], r * 1.5)
		)
	}
}

const SMART_TURRET_BULLET_SPEED = 800

class SmartTurretBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		const r = 7

		super(
			new Motion(position, Transform.angular(position.a, SMART_TURRET_BULLET_SPEED), Motion.removeOnEdges),

			new Collider(r, Tags.hostile | Tags.bullet),
			new RammingDamage(9, Tags.player | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.smartTurretBullet),
			new OnRemoveExplosion(r / 15, [ Colors.light, Colors.purple, Colors.blue ], r * 1.5)
		)
	}
}

/** @implements {import("../../core/engine").Routine */
export class TurretAimRoutine {
	constructor() {
		/** @private @type {Link} */
		this.player = null

		/** @private @type {Set<Link>} */
		this.turrets = new Set()
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player)
			this.player = link

		else if (link instanceof Turret)
			this.turrets.add(link)
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null

		else
			this.turrets.delete(link)
	}

	onStep() {
		if (this.player)
		for (const turret of this.turrets) {
			const [ turretMotion ] = turret.get(Motion)
			const [ playerMotion ] = this.player.get(Motion)

			TargetFacing.instant(turretMotion.position, playerMotion.position)
		}
	}
}

/** @implements {import("../../core/engine").Routine */
export class SmartTurretAimRoutine {
	/** @param {Universe} universe */
	constructor(universe) {
		this.universe = universe

		/** @private @type {Link} */
		this.player = null

		/** @private @type {Set<Link>} */
		this.turrets = new Set()
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player)
			this.player = link

		else if (link instanceof SmartTurret)
			this.turrets.add(link)
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null

		else
			this.turrets.delete(link)
	}

	onStep() {
		if (this.player)
		for (const turret of this.turrets) {
			const [ turretMotion ] = turret.get(Motion)
			const [ playerMotion ] = this.player.get(Motion)

			TargetFacing.anticipatedSmooth(
				turretMotion.position,
				turretMotion.velocity,
				playerMotion.position,
				playerMotion.velocity,
				Math.PI,
				this.universe.clock.spf,
				SMART_TURRET_BULLET_SPEED
			)
		}
	}
}
