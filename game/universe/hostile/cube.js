import { Link } from "../../engine.js"
import { ExplosionOnAdd, ExplosionOnRemove } from "../../explosion.js"
import { Transform, Velocity, BounceOnEdges, RemoveOnEdges } from "../../dynamic.js"
import { white, light, silver, orange, black, grey, yellow, pink, purple } from "../../../asset/style/color.js"
import { angle } from "../../math/random.js"
import { cubeSprite, cubeQuadSprite, cubeMissileSprite, cubeBulletSprite, cubeQuadBulletSprite, cubeMissileBulletSprite } from "../../../asset/sprite.js"
import { Collision, CircleCollider } from "../../collision.js"
import { Render } from "../../render.js"
import { MatchSubRoutine } from "../../routine.js"
import { TargetFacing, ForwardChasing } from "../../movement.js"

const { PI } = Math

export class Cube extends Link {
	constructor(/** @type {number} */ x, /** @type {number} */ y) {
		super([
			new Transform(x, y),
			Velocity.angular(angle(), 200, PI / 2),

			new BounceOnEdges(),
			new ExplosionOnAdd([ white, light, silver, orange ], 50, 1),
			new ExplosionOnRemove([ orange, black, grey, silver ], 50, 1),

			new Collision(
				new CircleCollider(21)
			),

			new Render(
				cubeSprite
			),

			new CubeBlaster()
		])
	}
}

export class CubeQuad extends Link {
	constructor(/** @type {number} */ x, /** @type {number} */ y) {
		super([
			new Transform(x, y),
			Velocity.angular(angle(), 200, PI / 2),

			new BounceOnEdges(),
			new ExplosionOnAdd([ white, light, orange, yellow ], 50, 1),
			new ExplosionOnRemove([ yellow, black, grey, orange ], 50, 1),

			new Collision(
				new CircleCollider(21)
			),

			new Render(
				cubeQuadSprite
			),

			new CubeQuadBlaster()
		])
	}
}

export class CubeMissile extends Link {
	constructor(/** @type {number} */ x, /** @type {number} */ y) {
		super([
			new Transform(x, y),
			Velocity.angular(angle(), 200, PI / 2),

			new BounceOnEdges(),
			new ExplosionOnAdd([ white, light, orange, pink ], 50, 1),
			new ExplosionOnRemove([ pink, black, grey, orange ], 50, 1),

			new Collision(
				new CircleCollider(21)
			),

			new Render(
				cubeMissileSprite
			),

			new CubeMissileBlaster()
		])
	}
}

export class CubeBlaster {
	constructor() {
		this.fireRate = 4
		this.timeEnlapsed = 0
	}
}

export class CubeQuadBlaster {
	constructor() {
		this.fireRate = 4
		this.timeEnlapsed = 0
	}
}

export class CubeMissileBlaster {
	constructor() {
		this.fireRate = 4
		this.timeEnlapsed = 0
	}
}

export class CubeBullet extends Link {
	constructor(/** @type {Transform} */ transform) {
		super([
			transform,
			Velocity.angular(transform.a, 600),

			new RemoveOnEdges(),
			new ExplosionOnRemove([ light, silver, white ], 10, 0.5),

			new Collision(
				new CircleCollider(7)
			),

			new Render(
				cubeBulletSprite
			)
		])
	}
}

export class CubeQuadBullet extends Link {
	constructor(/** @type {Transform} */ transform) {
		super([
			transform,
			Velocity.angular(transform.a, 600),

			new RemoveOnEdges(),
			new ExplosionOnRemove([ light, orange, yellow ], 10, 0.5),

			new Collision(
				new CircleCollider(7)
			),

			new Render(
				cubeQuadBulletSprite
			)
		])
	}
}

export class CubeMissileBullet extends Link {
	constructor(/** @type {Transform} */ transform, /** @type {{ Transform: Transform }} */ target) {
		super([
			transform,
			new Velocity(),
			new TargetFacing(target, TargetFacing.SMOOTH, PI),
			new ForwardChasing(600),

			new RemoveOnEdges(),
			new ExplosionOnRemove([ light, purple, pink ], 10, 0.5),

			new Collision(
				new CircleCollider(7)
			),

			new Render(
				cubeMissileBulletSprite
			)
		])
	}
}

export class CubeBlasterRoutine extends MatchSubRoutine {
	constructor(/** @type {Universe} */ universe) {
		super([ Transform, CubeBlaster ])

		this.universe = universe
	}

	/** @param {{ CubeBlaster: CubeBlaster, Transform: Transform }} */
	onSubStep({ CubeBlaster, Transform }) {
		CubeBlaster.timeEnlapsed += this.universe.clock.spf

		if (CubeBlaster.fireRate < CubeBlaster.timeEnlapsed) {
			CubeBlaster.timeEnlapsed = 0

			this.universe.add(new CubeBullet(Transform.copy.relativeOffset(0, -35).rotate(-PI / 2)))
			this.universe.add(new CubeBullet(Transform.copy.relativeOffset(0, +35).rotate(+PI / 2)))
		}
	}
}

export class CubeQuadBlasterRoutine extends MatchSubRoutine {
	constructor(/** @type {Universe} */ universe) {
		super([ Transform, CubeQuadBlaster ])

		this.universe = universe
	}

	/** @param {{ CubeQuadBlaster: CubeQuadBlaster, Transform: Transform }} */
	onSubStep({ CubeQuadBlaster, Transform }) {
		CubeQuadBlaster.timeEnlapsed += this.universe.clock.spf

		if (CubeQuadBlaster.fireRate < CubeQuadBlaster.timeEnlapsed) {
			CubeQuadBlaster.timeEnlapsed = 0

			this.universe.add(new CubeQuadBullet(Transform.copy.relativeOffset(-35, 0).rotate(PI)))
			this.universe.add(new CubeQuadBullet(Transform.copy.relativeOffset(+35, 0)))
			this.universe.add(new CubeQuadBullet(Transform.copy.relativeOffset(0, -35).rotate(-PI / 2)))
			this.universe.add(new CubeQuadBullet(Transform.copy.relativeOffset(0, +35).rotate(+PI / 2)))
		}
	}
}

export class CubeMissileBlasterRoutine extends MatchSubRoutine {
	constructor(/** @type {Universe} */ universe, /** @type {{ Transform : Transform }} */ player) {
		super([ Transform, CubeMissileBlaster ])

		this.universe = universe
		this.player = player
	}

	/** @param {{ CubeMissileBlaster: CubeMissileBlaster, Transform: Transform }} */
	onSubStep({ CubeMissileBlaster, Transform }) {
		CubeMissileBlaster.timeEnlapsed += this.universe.clock.spf

		if (CubeMissileBlaster.fireRate < CubeMissileBlaster.timeEnlapsed) {
			CubeMissileBlaster.timeEnlapsed = 0

			this.universe.add(new CubeMissileBullet(Transform.copy.relativeOffset(0, -35).rotate(-PI / 2), this.player))
			this.universe.add(new CubeMissileBullet(Transform.copy.relativeOffset(0, +35).rotate(+PI / 2), this.player))
		}
	}
}
