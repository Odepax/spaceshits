import { Link } from "../../engine.js"
import { ExplosionOnAdd, ExplosionOnRemove } from "../explosion.js"
import { Transform, Velocity, BounceOnEdges } from "../../dynamic.js"
import { white, light, silver, orange, black, grey, yellow, pink, purple } from "../../../asset/style/color.js"
import { angle } from "../../math/random.js"
import { cubeSprite, cubeQuadSprite, cubeMissileSprite, cubeBulletSprite, cubeQuadBulletSprite, cubeMissileBulletSprite } from "../../../asset/sprite.js"
import { Collision, CircleCollider } from "../../collision.js"
import { Render, SpriteRenderer } from "../../render.js"
import { Weapon, Bullet, Missile, Hp, ProjectileTarget, HpRenderer, RammingImpactTarget, RammingImpact } from "../combat.js"
import { PlayerTarget } from "../player.js"

const { PI } = Math

// const _HostileTarget = Object.create(HostileTarget.prototype);
// export function HostileTarget() { return _HostileTarget }
export class HostileTarget {}

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
			new ExplosionOnRemove([ coreColor, black, grey, extraColor ], 100, 0.5),

			new Hp(),

			new HostileTarget(),
			new ProjectileTarget(),
			new RammingImpactTarget(),

			new RammingImpact(PlayerTarget, 13),

			blaster,

			new Collision(
				new CircleCollider(21)
			),

			new Render(
				new HpRenderer(sprite)
			)
		])
	}
}

export class Cube extends BaseCube {
	constructor(/** @type {number} */ x, /** @type {number} */ y) {
		super(x, y, orange, silver, cubeSprite, new Weapon(4, [
			{ type: CubeBullet, x: 0, y: -35, a: -PI / 2 },
			{ type: CubeBullet, x: 0, y: +35, a: +PI / 2 }
		]))
	}
}

export class CubeQuad extends BaseCube {
	constructor(/** @type {number} */ x, /** @type {number} */ y) {
		super(x, y, yellow, orange, cubeQuadSprite, new Weapon(4, [
			{ type: CubeQuadBullet, x: -35, y: 0, a: PI },
			{ type: CubeQuadBullet, x: +35, y: 0, a: 0 },
			{ type: CubeQuadBullet, x: 0, y: -35, a: -PI / 2 },
			{ type: CubeQuadBullet, x: 0, y: +35, a: +PI / 2 }
		]))
	}
}

export class CubeMissile extends BaseCube {
	constructor(/** @type {number} */ x, /** @type {number} */ y, /** @type {{ Transform: Transform }} */ target) {
		super(x, y, pink, orange, cubeMissileSprite, new Weapon(4, [
			{ type: CubeMissileBullet, x: 0, y: -35, a: -PI / 2, target: target },
			{ type: CubeMissileBullet, x: 0, y: +35, a: +PI / 2, target: target }
		]))
	}
}

export class CubeBullet extends Bullet {
	constructor(/** @type {Transform} */ transform) {
		super(transform, 600, PlayerTarget, 9, 7, [ light, white, silver ], cubeBulletSprite)
	}
}

export class CubeQuadBullet extends Bullet {
	constructor(/** @type {Transform} */ transform) {
		super(transform, 600, PlayerTarget, 11, 7, [ light, yellow, orange ], cubeQuadBulletSprite)
	}
}

export class CubeMissileBullet extends Missile {
	constructor(/** @type {Transform} */ transform, /** @type {{ Transform: Transform }} */ target) {
		super(transform, target, 600, PI, PlayerTarget, 5, 7, [ light, pink, purple ], cubeMissileBulletSprite)
	}
}
