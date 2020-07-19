import { Link } from "../../core/engine.js"
import { Transform } from "../../math/transform.js"
import { Motion } from "../../physic/motion.js"
import { Collider } from "../../physic/collision.js"
import { Tags } from "../tags.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { Render } from "../../graphic/render.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { OnRemoveExplosion, OnAddExplosion, AuraFx } from "../../graphic/vfx.js"
import { Colors } from "../../graphic/assets/colors.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { AutoWeaponModule } from "../../logic/auto-weapon.js"
import { Player } from "../player.js"
import { Random } from "../../math/random.js"
import { Universe } from "../../core/engine.js"
import { TargetFacing } from "../../math/target-facing.js"
import { MissileControl } from "../../logic/missile-control.js"

class MissileBossMissileM extends Link {
	/** @param {Transform} position */
	constructor(position) {
		super(
			new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),
			new MissileControl(Math.PI),

			new Collider(7, Tags.hostile | Tags.bullet),
			new RammingDamage(9, Tags.player | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.missileBossBulletM),
			new OnRemoveExplosion(7 /* Collider.radius */ / 15, [ Colors.light, Colors.pink, Colors.purple ], 7 /* Collider.radius */ * 1.5)
		)
	}
}

class ProtectiveMissileControl extends MissileControl {
	constructor() {
		super(Random.between(1, 4) * Math.PI)
	}
}

class MissileBossMissileS extends Link {
	/** @param {Transform} position */
	constructor(position) {
		super(
			new Motion(position, Transform.angular(position.a, Random.between(600, 700)), Motion.ignoreEdges),
			new ProtectiveMissileControl(),

			new Collider(7, Tags.hostile | Tags.bullet),
			new RammingDamage(9, Tags.player | Tags.ship | Tags.bullet, RammingDamage.removeOnDamage),

			new Render(Sprites.missileBossBulletS),
			new AuraFx(7, Colors.purple),
			new OnRemoveExplosion(7 /* Collider.radius */ / 15, [ Colors.light, Colors.pink, Colors.purple ], 7 /* Collider.radius */ * 1.5)
		)
	}
}

class MissileBossMissileL extends Link {
	/** @param {Transform} position */
	constructor(position) {
		super(
			new Motion(position, Transform.angular(position.a, Random.between(400, 800)), Motion.ignoreEdges),
			new ProtectiveMissileControl(),

			new Collider(7, Tags.hostile | Tags.bullet),
			new RammingDamage(9, Tags.player | Tags.ship | Tags.bullet, RammingDamage.removeOnDamage),

			new Render(Sprites.missileBossBulletL),
			new AuraFx(13, Colors.red),
			new OnRemoveExplosion(7 /* Collider.radius */ / 15, [ Colors.light, Colors.pink, Colors.purple ], 7 /* Collider.radius */ * 1.5)
		)
	}
}

export class MissileBoss extends Link {
	/** @param {number} x @param {number} y */
	constructor(x, y) {
		super(
			new Motion(new Transform(x, y), Transform.angular(Random.angle(), 200, Math.PI / 2), 1),

			new Collider(21, Tags.hostile | Tags.ship),
			new RammingDamage(13, Tags.player | Tags.ship, RammingDamage.bounceOnDamage),

			new HpGauge(201),

			new AutoWeaponModule(3, boss => {
				const bossPosition = boss.get(Motion)[0].position

				return [
					new MissileBossMissileM(bossPosition.copy.rotateBy(-Math.PI / 2).relativeOffsetBy({ x: 41, y: -19 })),
					new MissileBossMissileM(bossPosition.copy.rotateBy(-Math.PI / 2).relativeOffsetBy({ x: 41, y: +19 })),
					new MissileBossMissileM(bossPosition.copy.rotateBy(+Math.PI / 2).relativeOffsetBy({ x: 41, y: -19 })),
					new MissileBossMissileM(bossPosition.copy.rotateBy(+Math.PI / 2).relativeOffsetBy({ x: 41, y: +19 })),
				]
			}),

			new Render(Sprites.missileBoss),
			new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.pink, Colors.red ], 50),
			new OnRemoveExplosion(0.5, [ Colors.red, Colors.black, Colors.grey, Colors.pink ], 150)
		)
	}
}

// TODO: is this not better an arena scenario?

/** @implements {import("../../core/engine").Routine} */ 
export class MissileBossRoutine {
	/** @param {Universe} universe */
	constructor(universe) {
		this.universe = universe

		/** @private @type {Player} */
		this.player = null

		/** @private @type {MissileBoss} */
		this.boss = null

		/** @private @type {Set<Link>} */
		this.protectiveMissiles = new Set()
		this.maxProtectiveMissileCount = 70
		this.reloadTime = 0.1
		this.nextShotTime = -1
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player)
			this.player = link

		else if (!this.boss && link instanceof MissileBoss) {
			this.boss = link
			this.nextShotTime = this.universe.clock.time + this.reloadTime
		}

		else if (link.has(ProtectiveMissileControl))
			this.protectiveMissiles.add(link)
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null

		else if (link == this.boss) {
			this.boss = null

			for (const missile of this.protectiveMissiles)
				this.universe.remove(missile)
		}

		else
			this.protectiveMissiles.delete(link)
	}

	onStep() {
		if (!this.player || !this.boss)
			return;

		this.fireProtectiveMissiles()
		this.steerProtectiveMissiles()
	}

	/** @private */
	steerProtectiveMissiles() {
		const [ bossMotion ] = this.boss.get(Motion)

		for (const missile of this.protectiveMissiles) {
			const [ missileMotion, missileControl ] = missile.get(Motion, ProtectiveMissileControl)

			TargetFacing.smooth(
				missileMotion.position,
				missileMotion.velocity,
				bossMotion.position,
				missileControl.steeringSpeed,
				this.universe.clock.spf
			)

			// Forward chasing.
			missileMotion.velocity.d = missileMotion.position.a
		}
	}

	/** @private */
	fireProtectiveMissiles() {
		if (
			   this.nextShotTime < this.universe.clock.time
			&& this.protectiveMissiles.size < this.maxProtectiveMissileCount
		) {
			this.nextShotTime = this.universe.clock.time + this.reloadTime

			const bullet = Math.random() < 0.3
				? new MissileBossMissileL(
					this.boss.get(Motion)[0]
						.position
						.copy
						.rotateBy(Random.angle())
						.relativeOffsetBy({ x: 41, y: 0 })
				)
				: new MissileBossMissileS(
					this.boss.get(Motion)[0]
						.position
						.copy
						.rotateBy(Random.angle())
						.relativeOffsetBy({ x: 41, y: 0 })
				)

			// TODO: Apply damage boosters.

			this.universe.add(bullet)
		}
	}
}
