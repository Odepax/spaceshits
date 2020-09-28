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

/** @param {Transform} position */
export function duoCube(position) {
	return new Link(
		HostileStuff,
		HostileShip,

		new Motion(position, Transform.angular(Random.angle(), Random.between(0.8, 1.2) * 250, Random.sign() * Math.PI / 2), 1),

		new Collider(21),
		new RammingDamage(13, PlayerShip, RammingDamage.bounceOnDamage),

		new HpGauge(101),

		new AutoWeaponModule(Random.between(2.6, 3.4), cube => {
			const cubePosition = cube.get(Motion)[0].position

			return [ 1, 3 ].map(i => duoCubeBullet(
				cubePosition
					.copy
					.rotateBy(i * Math.PI / 2)
					.relativeOffsetBy({ x: 35.6, y: 0 })
			))
		}),

		new Render(Sprites.cube),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.silver, Colors.orange ], 50),
		new OnRemoveExplosion(0.5, [ Colors.orange, Colors.black, Colors.grey, Colors.silver ], 100)
	)
}

/** @param {Transform} position */
export function quadCube(position) {
	return new Link(
		HostileStuff,
		HostileShip,

		new Motion(position, Transform.angular(Random.angle(), Random.between(0.8, 1.2) * 250, Random.sign() * Math.PI / 2), 1),

		new Collider(21),
		new RammingDamage(19, PlayerShip, RammingDamage.bounceOnDamage),

		new HpGauge(101),

		new AutoWeaponModule(Random.between(2.6, 3.4), cube => {
			const cubePosition = cube.get(Motion)[0].position

			return [ 1, 2, 3, 4 ].map(i => quadCubeBullet(
				cubePosition
					.copy
					.rotateBy(i * Math.PI / 2)
					.relativeOffsetBy({ x: 35.6, y: 0 })
			))
		}),

		new Render(Sprites.cubeQuad),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.orange, Colors.yellow ], 50),
		new OnRemoveExplosion(0.5, [ Colors.yellow, Colors.black, Colors.grey, Colors.orange ], 100)
	)
}

/** @param {Transform} position */
export function missileCube(position) {
	return new Link(
		HostileStuff,
		HostileShip,

		new Motion(position, Transform.angular(Random.angle(), Random.between(0.8, 1.2) * 250, Random.sign() * Math.PI / 2), 1),

		new Collider(21),
		new RammingDamage(13, PlayerShip, RammingDamage.bounceOnDamage),

		new HpGauge(101),

		new AutoWeaponModule(Random.between(3.2, 4.8), cube => {
			const cubePosition = cube.get(Motion)[0].position

			return [ 1, 3 ].map(i => missileCubeBullet(
				cubePosition
					.copy
					.rotateBy(i * Math.PI / 2)
					.relativeOffsetBy({ x: 35.6, y: 0 })
			))
		}),

		new Render(Sprites.cubeMissile),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.orange, Colors.pink ], 50),
		new OnRemoveExplosion(0.5, [ Colors.pink, Colors.black, Colors.grey, Colors.orange ], 100)
	)
}

/** @param {Transform} position */
function duoCubeBullet(position) {
	return new Link(
		HostileStuff,
		HostileBullet,

		new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),

		new Collider(7),
		new RammingDamage(9, PlayerShip, RammingDamage.removeOnDamage),

		new Render(Sprites.cubeBullet),
		new OnRemoveExplosion(0.5, [ Colors.light, Colors.silver, Colors.white ], 10)
	)
}

/** @param {Transform} position */
function quadCubeBullet(position) {
	return new Link(
		HostileStuff,
		HostileBullet,

		new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),

		new Collider(7),
		new RammingDamage(13, PlayerShip, RammingDamage.removeOnDamage),

		new Render(Sprites.cubeQuadBullet),
		new OnRemoveExplosion(0.5, [ Colors.light, Colors.orange, Colors.yellow ], 10)
	)
}

/** @param {Transform} position */
function missileCubeBullet(position) {
	return new Link(
		HostileStuff,
		HostileBullet,
		HostileMissile,

		new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),
		new MissileControl(Math.PI),

		new Collider(7),
		new RammingDamage(9, PlayerShip, RammingDamage.removeOnDamage),

		new Render(Sprites.cubeMissileBullet),
		new OnRemoveExplosion(0.5, [ Colors.light, Colors.purple, Colors.pink ], 10)
	)
}
