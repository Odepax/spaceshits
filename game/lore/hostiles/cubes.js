import { Link } from "../../core/engine.js"
import { Colors } from "../../graphic/assets/colors.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { Render } from "../../graphic/render.js"
import { OnAddExplosion, OnRemoveExplosion } from "../../graphic/vfx.js"
import { AutoWeaponModule } from "../../logic/auto-weapon.js"
import { HostileBullet, HostileMissile, HostileShip, HostileStuff } from "../../logic/hostile.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { MissileControl } from "../../logic/missile-control.js"
import { PlayerShip } from "../../logic/player.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { Random } from "../../math/random.js"
import { Transform } from "../../math/transform.js"
import { Collider } from "../../physic/collision.js"
import { Motion } from "../../physic/motion.js"
import { CUBE_DUO_BULLET_DAMAGE, CUBE_DUO_BULLET_SPEED, CUBE_DUO_COLLISION_DAMAGE, CUBE_DUO_GUN_RELOAD_MAX, CUBE_DUO_GUN_RELOAD_MIN, CUBE_DUO_HP, CUBE_DUO_SPEED_MAX, CUBE_DUO_SPEED_MIN, CUBE_DUO_SPIN_MAX, CUBE_DUO_SPIN_MIN, CUBE_MISSILE_BULLET_DAMAGE, CUBE_MISSILE_BULLET_SPEED, CUBE_MISSILE_BULLET_STEER, CUBE_MISSILE_COLLISION_DAMAGE, CUBE_MISSILE_GUN_RELOAD_MAX, CUBE_MISSILE_GUN_RELOAD_MIN, CUBE_MISSILE_HP, CUBE_MISSILE_SPEED_MAX, CUBE_MISSILE_SPEED_MIN, CUBE_MISSILE_SPIN_MAX, CUBE_MISSILE_SPIN_MIN, CUBE_QUAD_BULLET_DAMAGE, CUBE_QUAD_BULLET_SPEED, CUBE_QUAD_COLLISION_DAMAGE, CUBE_QUAD_GUN_RELOAD_MAX, CUBE_QUAD_GUN_RELOAD_MIN, CUBE_QUAD_HP, CUBE_QUAD_SPEED_MAX, CUBE_QUAD_SPEED_MIN, CUBE_QUAD_SPIN_MAX, CUBE_QUAD_SPIN_MIN } from "../game-balance.js"

/** @param {Transform} position */
export function duoCube(position) {
	return new Link(
		HostileStuff,
		HostileShip,

		new Motion(position, Transform.angular(Random.angle(), Random.between(CUBE_DUO_SPEED_MIN, CUBE_DUO_SPEED_MAX), Random.sign() * Random.between(CUBE_DUO_SPIN_MIN, CUBE_DUO_SPIN_MAX)), 1),

		new Collider(21),
		new RammingDamage(CUBE_DUO_COLLISION_DAMAGE, PlayerShip, RammingDamage.bounceOnDamage),

		new HpGauge(CUBE_DUO_HP),

		new AutoWeaponModule(Random.between(CUBE_DUO_GUN_RELOAD_MIN, CUBE_DUO_GUN_RELOAD_MAX), cube => {
			const cubePosition = cube.get(Motion)[0].position

			return [ 1, 3 ].map(i => duoCubeBullet(
				cubePosition
					.copy
					.rotateBy(i * Math.PI / 2)
					.relativeOffsetBy({ x: 35.6, y: 0 })
			))
		}),

		new Render(Sprites.cube),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.silver, Colors.orange ], 75),
		new OnRemoveExplosion(0.5, [ Colors.orange, Colors.black, Colors.grey, Colors.silver ], 150)
	)
}

/** @param {Transform} position */
export function quadCube(position) {
	return new Link(
		HostileStuff,
		HostileShip,

		new Motion(position, Transform.angular(Random.angle(), Random.between(CUBE_QUAD_SPEED_MIN, CUBE_QUAD_SPEED_MAX), Random.sign() * Random.between(CUBE_QUAD_SPIN_MIN, CUBE_QUAD_SPIN_MAX)), 1),

		new Collider(21),
		new RammingDamage(CUBE_QUAD_COLLISION_DAMAGE, PlayerShip, RammingDamage.bounceOnDamage),

		new HpGauge(CUBE_QUAD_HP),

		new AutoWeaponModule(Random.between(CUBE_QUAD_GUN_RELOAD_MIN, CUBE_QUAD_GUN_RELOAD_MAX), cube => {
			const cubePosition = cube.get(Motion)[0].position

			return [ 1, 2, 3, 4 ].map(i => quadCubeBullet(
				cubePosition
					.copy
					.rotateBy(i * Math.PI / 2)
					.relativeOffsetBy({ x: 35.6, y: 0 })
			))
		}),

		new Render(Sprites.cubeQuad),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.orange, Colors.yellow ], 75),
		new OnRemoveExplosion(0.5, [ Colors.yellow, Colors.black, Colors.grey, Colors.orange ], 150)
	)
}

/** @param {Transform} position */
export function missileCube(position) {
	return new Link(
		HostileStuff,
		HostileShip,

		new Motion(position, Transform.angular(Random.angle(), Random.between(CUBE_MISSILE_SPEED_MIN, CUBE_MISSILE_SPEED_MAX), Random.sign() * Random.between(CUBE_MISSILE_SPIN_MIN, CUBE_MISSILE_SPIN_MAX)), 1),

		new Collider(21),
		new RammingDamage(CUBE_MISSILE_COLLISION_DAMAGE, PlayerShip, RammingDamage.bounceOnDamage),

		new HpGauge(CUBE_MISSILE_HP),

		new AutoWeaponModule(Random.between(CUBE_MISSILE_GUN_RELOAD_MIN, CUBE_MISSILE_GUN_RELOAD_MAX), cube => {
			const cubePosition = cube.get(Motion)[0].position

			return [ 1, 3 ].map(i => missileCubeBullet(
				cubePosition
					.copy
					.rotateBy(i * Math.PI / 2)
					.relativeOffsetBy({ x: 35.6, y: 0 })
			))
		}),

		new Render(Sprites.cubeMissile),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.orange, Colors.pink ], 75),
		new OnRemoveExplosion(0.5, [ Colors.pink, Colors.black, Colors.grey, Colors.orange ], 150)
	)
}

/** @param {Transform} position */
function duoCubeBullet(position) {
	return new Link(
		HostileStuff,
		HostileBullet,

		new Motion(position, Transform.angular(position.a, CUBE_DUO_BULLET_SPEED), Motion.removeOnEdges),

		new Collider(7),
		new RammingDamage(CUBE_DUO_BULLET_DAMAGE, PlayerShip, RammingDamage.removeOnDamage),

		new Render(Sprites.cubeBullet),
		new OnRemoveExplosion(0.5, [ Colors.light, Colors.silver, Colors.white ], 15)
	)
}

/** @param {Transform} position */
function quadCubeBullet(position) {
	return new Link(
		HostileStuff,
		HostileBullet,

		new Motion(position, Transform.angular(position.a, CUBE_QUAD_BULLET_SPEED), Motion.removeOnEdges),

		new Collider(7),
		new RammingDamage(CUBE_QUAD_BULLET_DAMAGE, PlayerShip, RammingDamage.removeOnDamage),

		new Render(Sprites.cubeQuadBullet),
		new OnRemoveExplosion(0.5, [ Colors.light, Colors.orange, Colors.yellow ], 15)
	)
}

/** @param {Transform} position */
function missileCubeBullet(position) {
	return new Link(
		HostileStuff,
		HostileBullet,
		HostileMissile,

		new Motion(position, Transform.angular(position.a, CUBE_MISSILE_BULLET_SPEED), Motion.removeOnEdges),
		new MissileControl(CUBE_MISSILE_BULLET_STEER),

		new Collider(7),
		new RammingDamage(CUBE_MISSILE_BULLET_DAMAGE, PlayerShip, RammingDamage.removeOnDamage),

		new Render(Sprites.cubeMissileBullet),
		new OnRemoveExplosion(0.5, [ Colors.light, Colors.purple, Colors.pink ], 15)
	)
}
