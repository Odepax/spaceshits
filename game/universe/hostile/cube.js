import { Link, Universe } from "../../engine.js"
import { ExplosionOnAdd, ExplosionOnRemove } from "../../explosion.js"
import { Transform, Velocity, BounceOnEdges, RemoveOnEdges } from "../../dynamic.js"
import { white, light, silver, orange, black, grey, yellow, pink, purple } from "../../../asset/style/color.js"
import { angle } from "../../math/random.js"
import { cubeSprite, cubeQuadSprite, cubeMissileSprite, cubeBulletSprite, cubeQuadBulletSprite, cubeMissileBulletSprite, smartTurretBulletSprite } from "../../../asset/sprite.js"
import { Collision, CircleCollider } from "../../collision.js"
import { Render, SpriteRenderer } from "../../render.js"
import { MatchSubRoutine } from "../../routine.js"
import { TargetFacing, ForwardChasing } from "../../movement.js"

const { PI } = Math

/** @abstract */ class BaseCube extends Link {
	constructor(
		/** @type {number} */ x,
		/** @type {number} */ y,
		/** @type {import("../../../asset/style/color.js").Color} */ coreColor,
		/** @type {import("../../../asset/style/color.js").Color} */ extraColor,
		/** @type {SpriteRenderer} */ sprite,
		/** @type {import("../../engine.js").Trait} */ blaster
	) {
		super([
			new Transform(x, y),
			Velocity.angular(angle(), 200, PI / 2),

			new BounceOnEdges(),
			new ExplosionOnAdd([ white, light, extraColor, coreColor ], 50, 1),
			new ExplosionOnRemove([ coreColor, black, grey, extraColor ], 50, 1),

			new Collision(
				new CircleCollider(21)
			),

			new Render(
				sprite
			),

			blaster
		])
	}
}

export class Cube extends BaseCube {
	constructor(/** @type {number} */ x, /** @type {number} */ y) {
		super(x, y, orange, silver, cubeSprite, new CubeBlaster())
	}
}

export class CubeQuad extends BaseCube {
	constructor(/** @type {number} */ x, /** @type {number} */ y) {
		super(x, y, yellow, orange, cubeQuadSprite, new CubeQuadBlaster())
	}
}

export class CubeMissile extends BaseCube {
	constructor(/** @type {number} */ x, /** @type {number} */ y) {
		super(x, y, pink, orange, cubeMissileSprite, new CubeMissileBlaster())
	}
}

/** @abstract */ class BaseCubeBlaster {
	constructor() {
		this.fireRate = 4
		this.timeEnlapsed = 0
	}
}

export class CubeBlaster extends BaseCubeBlaster {}
export class CubeQuadBlaster extends BaseCubeBlaster {}
export class CubeMissileBlaster extends BaseCubeBlaster {}

/** @abstract */ class BaseCubeBullet extends Link {
	constructor(
		/** @type {Transform} */ transform,
		/** @type {Velocity} */ velocity,
		/** @type {import("../../../asset/style/color.js").Color} */ headColor,
		/** @type {import("../../../asset/style/color.js").Color} */ tailColor,
		/** @type {SpriteRenderer} */ sprite
	) {
		super([
			transform,
			velocity,

			new RemoveOnEdges(),
			new ExplosionOnRemove([ light, headColor, tailColor ], 10, 0.5),

			new Collision(
				new CircleCollider(7)
			),

			new Render(
				sprite
			)
		])
	}
}

export class CubeBullet extends BaseCubeBullet {
	constructor(/** @type {Transform} */ transform) {
		super(transform, Velocity.angular(transform.a, 600), white, silver, cubeBulletSprite)
	}
}

export class CubeQuadBullet extends BaseCubeBullet {
	constructor(/** @type {Transform} */ transform) {
		super(transform, Velocity.angular(transform.a, 600), yellow, orange, cubeQuadBulletSprite)
	}
}

export class CubeMissileBullet extends BaseCubeBullet {
	constructor(/** @type {Transform} */ transform, /** @type {{ Transform: Transform }} */ target) {
		super(transform, new Velocity(), pink, purple, cubeMissileBulletSprite)

		this.set(new TargetFacing(target, TargetFacing.SMOOTH, PI))
		this.set(new ForwardChasing(600))
	}
}

/** @abstract */ class BaseCubeBlasterRoutine extends MatchSubRoutine {
	constructor(
		/** @type {Universe} */ universe,
		/** @type {import("../../engine.js").Constructor<BaseCubeBlaster>} */ blasterType
	) {
		super([ Transform, blasterType ])

		this.universe = universe
		this.blasterType = blasterType
	}

	onSubStep(/** @type {{ Transform: Transform }} */ link) {
		const { Transform } = link
		/** @type {BaseCubeBlaster} */ const blaster = link[this.blasterType.name]

		blaster.timeEnlapsed += this.universe.clock.spf

		if (blaster.fireRate < blaster.timeEnlapsed) {
			blaster.timeEnlapsed = 0

			this.fire(Transform)
		}
	}

	fire(/** @type {Transform} */ transform) {
		throw (this.constructor.name || BaseCubeBlasterRoutine.name) + "#fire() is not implemented."
	}
}

export class CubeBlasterRoutine extends BaseCubeBlasterRoutine {
	constructor(/** @type {Universe} */ universe) {
		super(universe, CubeBlaster)
	}

	fire(/** @type {Transform} */ transform) {
		this.universe.add(new CubeBullet(transform.copy.relativeOffset(0, -35).rotate(-PI / 2)))
		this.universe.add(new CubeBullet(transform.copy.relativeOffset(0, +35).rotate(+PI / 2)))
	}
}

export class CubeQuadBlasterRoutine extends BaseCubeBlasterRoutine {
	constructor(/** @type {Universe} */ universe) {
		super(universe, CubeQuadBlaster)
	}

	fire(/** @type {Transform} */ transform) {
		this.universe.add(new CubeQuadBullet(transform.copy.relativeOffset(-35, 0).rotate(PI)))
		this.universe.add(new CubeQuadBullet(transform.copy.relativeOffset(+35, 0)))
		this.universe.add(new CubeQuadBullet(transform.copy.relativeOffset(0, -35).rotate(-PI / 2)))
		this.universe.add(new CubeQuadBullet(transform.copy.relativeOffset(0, +35).rotate(+PI / 2)))
	}
}

export class CubeMissileBlasterRoutine extends BaseCubeBlasterRoutine {
	constructor(/** @type {Universe} */ universe, /** @type {{ Transform : Transform }} */ player) {
		super(universe, CubeMissileBlaster)

		this.player = player
	}

	fire(/** @type {Transform} */ transform) {
		this.universe.add(new CubeMissileBullet(transform.copy.relativeOffset(0, -35).rotate(-PI / 2), this.player))
		this.universe.add(new CubeMissileBullet(transform.copy.relativeOffset(0, +35).rotate(+PI / 2), this.player))
	}
}
