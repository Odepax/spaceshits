import { Link, Universe } from "../../core/engine.js"
import { Colors } from "../../graphic/assets/colors.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { Render } from "../../graphic/render.js"
import { AuraFx, OnAddExplosion, OnRemoveExplosion } from "../../graphic/vfx.js"
import { AutoWeaponModule } from "../../logic/auto-weapon.js"
import { HostileBullet, HostileMissile, HostileShip, HostileStuff } from "../../logic/hostile.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { MissileControl } from "../../logic/missile-control.js"
import { PlayerShip, PlayerStuff } from "../../logic/player.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { Random } from "../../math/random.js"
import { TargetFacing } from "../../math/target-facing.js"
import { Transform } from "../../math/transform.js"
import { Collider } from "../../physic/collision.js"
import { Motion } from "../../physic/motion.js"
import { BOSS_MISSILE_COLLISION_DAMAGE, BOSS_MISSILE_GUN_BULLET_DAMAGE, BOSS_MISSILE_GUN_BULLET_SPEED, BOSS_MISSILE_GUN_RELOAD, BOSS_MISSILE_HP, BOSS_MISSILE_PROTEC_L_DAMAGE, BOSS_MISSILE_PROTEC_L_SPEED_MAX, BOSS_MISSILE_PROTEC_L_SPEED_MIN, BOSS_MISSILE_PROTEC_L_STEER_MAX, BOSS_MISSILE_PROTEC_L_STEER_MIN, BOSS_MISSILE_PROTEC_S_DAMAGE, BOSS_MISSILE_PROTEC_S_SPEED_MAX, BOSS_MISSILE_PROTEC_S_SPEED_MIN, BOSS_MISSILE_PROTEC_S_STEER_MAX, BOSS_MISSILE_PROTEC_S_STEER_MIN, BOSS_MISSILE_SPEED, BOSS_MISSILE_SPIN } from "../game-balance.js"

/** @param {Transform} position */
function missileBossMissileM(position) {
	return new Link(
		HostileStuff,
		HostileBullet,
		HostileMissile,

		new Motion(position, Transform.angular(position.a, BOSS_MISSILE_GUN_BULLET_SPEED), Motion.removeOnEdges),
		new MissileControl(Math.PI),

		new Collider(9),
		new RammingDamage(BOSS_MISSILE_GUN_BULLET_DAMAGE, PlayerShip, RammingDamage.removeOnDamage),

		new Render(Sprites.missileBossBulletM),
		new OnRemoveExplosion(0.5, [ Colors.light, Colors.purple, Colors.pink ], 20)
	)
}

const HostileProtectiveMissile = Symbol()

/** @param {Transform} position */
function missileBossMissileS(position) {
	return new Link(
		HostileStuff,
		HostileBullet,
		HostileProtectiveMissile,

		new Motion(position, Transform.angular(position.a, Random.between(BOSS_MISSILE_PROTEC_S_SPEED_MIN, BOSS_MISSILE_PROTEC_S_SPEED_MAX)), Motion.ignoreEdges),
		new MissileControl(Random.between(BOSS_MISSILE_PROTEC_S_STEER_MIN, BOSS_MISSILE_PROTEC_S_STEER_MAX)),

		new Collider(7),
		new RammingDamage(BOSS_MISSILE_PROTEC_S_DAMAGE, PlayerStuff, RammingDamage.removeOnDamage),

		new Render(Sprites.missileBossBulletS),
		new AuraFx(7, Colors.purple),
		new OnRemoveExplosion(0.5, [ Colors.light, Colors.purple, Colors.red ], 15)
	)
}

/** @param {Transform} position */
function missileBossMissileL(position) {
	return new Link(
		HostileStuff,
		HostileBullet,
		HostileProtectiveMissile,

		new Motion(position, Transform.angular(position.a, Random.between(BOSS_MISSILE_PROTEC_L_SPEED_MIN, BOSS_MISSILE_PROTEC_L_SPEED_MAX)), Motion.ignoreEdges),
		new MissileControl(Random.between(BOSS_MISSILE_PROTEC_L_STEER_MIN, BOSS_MISSILE_PROTEC_L_STEER_MAX)),

		new Collider(13),
		new RammingDamage(BOSS_MISSILE_PROTEC_L_DAMAGE, PlayerStuff, RammingDamage.removeOnDamage),

		new Render(Sprites.missileBossBulletL),
		new AuraFx(13, Colors.red),
		new OnRemoveExplosion(0.5, [ Colors.light, Colors.red, Colors.pink ], 25)
	)
}

const HostileMissileBoss = Symbol()

/** @param {Transform} position */
export function missileBoss(position) {
	return new Link(
		HostileStuff,
		HostileShip,
		HostileMissileBoss,

		new Motion(position, Transform.angular(Random.angle(), BOSS_MISSILE_SPEED, BOSS_MISSILE_SPIN), 1),

		new Collider(24),
		new RammingDamage(BOSS_MISSILE_COLLISION_DAMAGE, PlayerShip, RammingDamage.bounceOnDamage),

		new HpGauge(BOSS_MISSILE_HP),

		new AutoWeaponModule(BOSS_MISSILE_GUN_RELOAD, boss => {
			const bossPosition = boss.get(Motion)[0].position

			return [
				missileBossMissileM(bossPosition.copy.rotateBy(-Math.PI / 2).relativeOffsetBy({ x: 42, y: -11 })),
				missileBossMissileM(bossPosition.copy.rotateBy(-Math.PI / 2).relativeOffsetBy({ x: 42, y: +11 })),
				missileBossMissileM(bossPosition.copy.rotateBy(+Math.PI / 2).relativeOffsetBy({ x: 42, y: -11 })),
				missileBossMissileM(bossPosition.copy.rotateBy(+Math.PI / 2).relativeOffsetBy({ x: 42, y: +11 })),
			]
		}),

		new Render(Sprites.missileBoss),
		new OnAddExplosion(1.5, [ Colors.white, Colors.light, Colors.purple, Colors.red ], 150),
		new OnRemoveExplosion(1, [ Colors.red, Colors.black, Colors.grey, Colors.pink ], 300)
	)
}

/** @implements {import("../../core/engine").Routine} */
export class MissileBossRoutine {
	/** @param {Universe} universe */
	constructor(universe) {
		this.universe = universe

		/** @private @type {Link} */
		this.player = null

		/** @private @type {Link} */
		this.boss = null

		/** @private @type {Set<Link>} */
		this.protectiveMissiles = new Set()
		this.maxProtectiveMissileCount = 70
		this.reloadTime = 0.1
		this.nextShotTime = -1
	}

	/** @param {Link} link */
	onAdd(link) {
		if (link.has(PlayerShip))
			this.player = link

		else if (link.has(HostileMissileBoss)) {
			this.boss = link
			this.nextShotTime = this.universe.clock.time + this.reloadTime
		}

		else if (link.has(HostileProtectiveMissile))
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
		if (this.player && this.boss) {
			this.fireProtectiveMissiles()
			this.steerProtectiveMissiles()
		}
	}

	/** @private */
	fireProtectiveMissiles() {
		if (
			   this.nextShotTime < this.universe.clock.time
			&& this.protectiveMissiles.size < this.maxProtectiveMissileCount
		) {
			this.nextShotTime = this.universe.clock.time + this.reloadTime

			const bossPosition = this.boss.get(Motion)[0].position

			if (Math.random() < 0.3)
				this.universe.add(missileBossMissileL(
					bossPosition
						.copy
						.rotateBy(Random.in([ 0, Math.PI ]))
						.relativeOffsetBy({ x: 47.5, y: 0 })
				))

			else {
				const [ x, y, a ] = Random.in([
					[ 41, 9.5, 5.24 ],
					[ 36.8, 2.8, 3.93 ],
					[ 42.5, 4.5, 2.36 ],
					[ 41, 5.3, 0.52 ]
				])

				this.universe.add(missileBossMissileS(
					bossPosition
						.copy
						.rotateBy(a)
						.relativeOffsetBy({ x, y })
				))
			}
		}
	}

	/** @private */
	steerProtectiveMissiles() {
		const [ bossMotion ] = this.boss.get(Motion)

		for (const missile of this.protectiveMissiles) {
			const [ missileMotion, missileControl ] = missile.get(Motion, MissileControl)

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
}
