import { Link, Universe } from "../engine.js"
import { Velocity, Transform, RemoveOnEdges } from "../dynamic.js"
import { SpriteRenderer, Render } from "../render.js"
import { ExplosionOnRemove } from "./explosion.js"
import { Collision, CircleCollider } from "../collision.js"
import { TargetFacing, ForwardChasing } from "../movement.js"
import { MatchSubRoutine } from "../routine.js"

/** @typedef {Symbol} ProjectileTargetType */

export class Projectile {
	constructor(/** @type {ProjectileTargetType} */ targetType, /** @type {number} */ damage) {
		this.targetType = targetType
		this.damage = damage
	}
}

export class ProjectileTarget {
	constructor(/** @type {ProjectileTargetType} */ type) {
		this.type = type
	}
}

/**
 * @typedef {object} ProjectileDefinition
 *
 * @property {{ new(transform: Transform, target?: { Transform: Transform }) => Link}} type
 * @property {number} x
 * @property {number} y
 * @property {number} a
 * @property {{ Transform: Transform }} [target]
 */

export class Weapon {
	constructor(/** @type {number} */ fireRate, /** @type {ProjectileDefinition[]} */ projectiles = []) {
		this.fireRate = fireRate
		this.timeEnlapsed = 0
		this.projectiles = projectiles
		this.canFire = true
	}
}

export class WeaponRoutine extends MatchSubRoutine {
	constructor(/** @type {Universe} */ universe) {
		super([ Weapon, Transform ])

		this.universe = universe
	}

	/** @param {{ Weapon: Weapon, Transform: Transform }} */
	onSubStep({ Weapon, Transform }) {
		Weapon.timeEnlapsed += this.universe.clock.spf

		if (Weapon.canFire && Weapon.fireRate < Weapon.timeEnlapsed) {
			Weapon.timeEnlapsed = 0

			for (const projectile of Weapon.projectiles) {
				this.universe.add(new projectile.type(
					Transform.copy
						.relativeOffset(projectile.x, projectile.y)
						.rotate(projectile.a),
					projectile.target
				))
			}
		}
	}
}

export /** @abstract */ class Bullet extends Link {
	constructor(
		/** @type {Transform} */ transform,
		/** @type {number} */ speed,
		/** @type {ProjectileTargetType} */ targetType,
		/** @type {number} */ damage,
		/** @type {number} */ collisionRadius,
		/** @type {import("../../asset/style/color.js").Color[]} */ explosionColors,
		/** @type {SpriteRenderer} */ sprite
	) {
		super([
			transform,
			Velocity.angular(transform.a, speed),

			new Collision(
				new CircleCollider(collisionRadius)
			),

			new Projectile(targetType, damage),

			new RemoveOnEdges(),
			new ExplosionOnRemove(explosionColors, collisionRadius * 1.5, collisionRadius / 15),

			new Render(sprite)
		])
	}
}

export /** @abstract */ class Missile extends Bullet {
	constructor(
		/** @type {Transform} */ transform,
		/** @type {{ Transform: Transform }} */ target,
		/** @type {number} */ speed,
		/** @type {number} */ rotationSpeed,
		/** @type {ProjectileTargetType} */ targetType,
		/** @type {number} */ damage,
		/** @type {number} */ collisionRadius,
		/** @type {import("../../asset/style/color.js").Color[]} */ explosionColors,
		/** @type {SpriteRenderer} */ sprite
	) {
		super(transform, speed, targetType, damage, collisionRadius, explosionColors, sprite)

		this.set(new TargetFacing(target, TargetFacing.SMOOTH, rotationSpeed))
		this.set(new ForwardChasing(speed))
	}
}
