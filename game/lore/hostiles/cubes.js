import { Link } from "../../core/engine.js"
import { Transform } from "../../math/transform.js"
import { Motion } from "../../physic/motion.js"
import { Random } from "../../math/random.js"
import { Collider } from "../../physic/collision.js"
import { Tags } from "../tags.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { AutoWeaponModule } from "../../logic/auto-weapon.js"
import { Render } from "../../graphic/render.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { OnAddExplosion, OnRemoveExplosion } from "../../graphic/vfx.js"
import { Colors } from "../../graphic/assets/colors.js"
import { MissileControl } from "../../logic/missile-control.js"

export class DuoCube extends Link {
	/** @param {Transform} position */
	constructor(position) {
		super(
			new Motion(position, Transform.angular(Random.angle(), Random.between(100, 200), Random.sign() * 0.2), 1),

			new Collider(21, Tags.hostile | Tags.ship),
			new RammingDamage(13, Tags.player | Tags.ship, RammingDamage.bounceOnDamage),

			new HpGauge(101),

			new AutoWeaponModule(3, cube => [ 1, 3 ]
				.map(i => new DuoCubeBullet(
					cube.get(Motion)[0]
						.position
						.copy
						.rotateBy(i * Math.PI / 2)
						.relativeOffsetBy({ x: 37, y: 0 })
				))
			),

			new Render(Sprites.cube),
			new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.silver, Colors.orange ], 50),
			new OnRemoveExplosion(0.5, [ Colors.orange, Colors.black, Colors.grey, Colors.silver ], 100)
		)
	}
}

export class QuadCube extends Link {
	/** @param {Transform} position */
	constructor(position) {
		super(
			new Motion(position, Transform.angular(Random.angle(), Random.between(100, 200), Random.sign() * 0.2), 1),

			new Collider(21, Tags.hostile | Tags.ship),
			new RammingDamage(13, Tags.player | Tags.ship, RammingDamage.bounceOnDamage),

			new HpGauge(101),

			new AutoWeaponModule(3, cube => [ 1, 2, 3, 4 ]
				.map(i => new QuadCubeBullet(
					cube.get(Motion)[0]
						.position
						.copy
						.rotateBy(i * Math.PI / 2)
						.relativeOffsetBy({ x: 37, y: 0 })
				))
			),

			new Render(Sprites.cubeQuad),
			new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.orange, Colors.yellow ], 50),
			new OnRemoveExplosion(0.5, [ Colors.yellow, Colors.black, Colors.grey, Colors.orange ], 100)
		)
	}
}

export class MissileCube extends Link {
	/** @param {Transform} position */
	constructor(position) {
		super(
			new Motion(position, Transform.angular(Random.angle(), Random.between(100, 200), Random.sign() * 0.2), 1),

			new Collider(21, Tags.hostile | Tags.ship),
			new RammingDamage(13, Tags.player | Tags.ship, RammingDamage.bounceOnDamage),

			new HpGauge(101),

			new AutoWeaponModule(3, cube => [ 1, 3 ]
				.map(i => new MissileCubeBullet(
					cube.get(Motion)[0]
						.position
						.copy
						.rotateBy(i * Math.PI / 2)
						.relativeOffsetBy({ x: 37, y: 0 })
				))
			),

			new Render(Sprites.cubeMissile),
			new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.orange, Colors.pink ], 50),
			new OnRemoveExplosion(0.5, [ Colors.pink, Colors.black, Colors.grey, Colors.orange ], 100)
		)
	}
}

class DuoCubeBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		const r = 7

		super(
			new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),

			new Collider(r, Tags.hostile | Tags.bullet),
			new RammingDamage(9, Tags.player | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.cubeBullet),
			new OnRemoveExplosion(r / 15, [ Colors.light, Colors.silver, Colors.white ], r * 1.5)
		)
	}
}

class QuadCubeBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		const r = 7

		super(
			new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),

			new Collider(r, Tags.hostile | Tags.bullet),
			new RammingDamage(9, Tags.player | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.cubeQuadBullet),
			new OnRemoveExplosion(r / 15, [ Colors.light, Colors.orange, Colors.yellow ], r * 1.5)
		)
	}
}

class MissileCubeBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		const r = 7

		super(
			new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),
			new MissileControl(Math.PI),

			new Collider(r, Tags.hostile | Tags.bullet),
			new RammingDamage(9, Tags.player | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.cubeMissileBullet),
			new OnRemoveExplosion(r / 15, [ Colors.light, Colors.purple, Colors.pink ], r * 1.5)
		)
	}
}
