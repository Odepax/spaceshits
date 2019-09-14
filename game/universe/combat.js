import { Link, Routine, Universe } from "../engine.js"
import { Velocity, Transform, RemoveOnEdges } from "../dynamic.js"
import { SpriteRenderer, Render, Renderer } from "../render.js"
import { ExplosionOnRemove } from "./explosion.js"
import { Collision, CircleCollider, testCollision } from "../collision.js"
import { TargetFacing, ForwardChasing } from "../movement.js"
import { MatchSubRoutine } from "../routine.js"
import { red } from "../../asset/style/color.js"

/** @typedef {Symbol} ProjectileTargetType */

export const ProjectileTargetTypes = {
	player: Symbol(),
	hostile: Symbol()
}

export class Projectile {
	constructor(/** @type {ProjectileTargetType} */ targetType, /** @type {number} */ damage) {
		this.targetType = targetType
		this.damage = damage
	}
}

export class ProjectileTarget {
	constructor(/** @type {ProjectileTargetType} */ type) {
		this.type = type
		this.timeSinceLastHit = Number.POSITIVE_INFINITY
	}
}

/** @abstract */ class SelfRegeneratingGauge {
	constructor(/** @type {number} */ max, regen = 0, value = max) {
		this.max = max
		this.regen = regen
		this.value = value
	}
}

export class Hp extends SelfRegeneratingGauge {
	constructor() {
		super(100)
	}
}

export class HpRoutine extends MatchSubRoutine {
	constructor(/** @type {Universe} */ universe) {
		super([Hp])

		this.universe = universe
	}

	onSubStep(/** @type {{ Hp: Hp }} */ link) {
		if (link.Hp.value < 0) {
			this.universe.remove(link)
		} else if (link.Hp.value < link.Hp.max) {
			link.Hp.value += link.Hp.regen * this.universe.clock.spf
		}
	}
}

export class ProjectileDamageRoutine extends Routine {
	constructor(/** @type {Universe} */ universe) {
		super()

		this.universe = universe

		/** @type {Set<{ Transform: Transform, Collision: Collision, Projectile: Projectile }>} */
		this.projectiles = new Set()

		/** @type {Set<{ Transform: Transform, Collision: Collision, ProjectileTarget: ProjectileTarget, Hp: Hp }>} */
		this.targets = new Set()
	}

	test({ Transform = null, Collision = null, Projectile = null, ProjectileTarget = null, Hp = null }) {
		return Transform && Collision && (Projectile || (ProjectileTarget && Hp))
	}

	onAdd(/** @type {{ Projectile?: Projectile, ProjectileTarget?: ProjectileTarget }} */ link) {
		if (link.Projectile) {
			this.projectiles.add(link)
		}

		if (link.ProjectileTarget && link.Hp) {
			this.targets.add(link)
		}
	}

	onRemove(/** @type {Link} */ link) {
		this.projectiles.delete(link)
		this.targets.delete(link)
	}

	onStep() {
		for (const target of this.targets) {
			target.ProjectileTarget.timeSinceLastHit += this.universe.clock.spf

			for (const projectile of this.projectiles) {
				if (
					   projectile.Projectile.targetType == target.ProjectileTarget.type
					&& testCollision(projectile, target)
				) {
					this.universe.remove(projectile)

					target.Hp.value -= projectile.Projectile.damage
					target.ProjectileTarget.timeSinceLastHit = 0
				}
			}
		}
	}
}

export class HpRenderer extends Renderer {
	constructor(/** @type {SpriteRenderer} */ sprite) {
		super()

		this.sprite = sprite
		this.offscreen = new OffscreenCanvas(sprite.spriteWidth, sprite.spriteHeight).getContext("2d")
	}

	render(/** @type {CanvasRenderingContext2D} */ graphics, /** @type {{ ProjectileTarget: ProjectileTarget, Hp: Hp }} */ link) {
		if (link.ProjectileTarget.timeSinceLastHit < 3) {
			const { ProjectileTarget, Hp } = link
			const { offsetX, offsetY } = this.sprite

			this.offscreen.globalCompositeOperation = "source-over"
			this.drawOffscreenSprite()

			this.offscreen.globalCompositeOperation = "color"
			this.drawRedOverlay((1 - Hp.value / Hp.max) * (1 - ProjectileTarget.timeSinceLastHit / 3))

			this.offscreen.globalCompositeOperation = "destination-atop"
			this.drawOffscreenSprite()

			graphics.drawImage(this.offscreen.canvas, offsetX, offsetY)
		} else {
			this.sprite.render(graphics, link)
		}
	}

	/** @private */ drawOffscreenSprite() {
		const { sprite, spriteX, spriteY, spriteWidth, spriteHeight, spriteResizeRatio } = this.sprite

		this.offscreen.drawImage(
			sprite,
			spriteX * spriteResizeRatio,
			spriteY * spriteResizeRatio,
			spriteWidth * spriteResizeRatio,
			spriteHeight * spriteResizeRatio,
			0,
			0,
			spriteWidth,
			spriteHeight
		)
	}

	/** @private */ drawRedOverlay(/** @type {number} */ opacity) {
		const { spriteWidth, spriteHeight } = this.sprite

		this.offscreen.globalAlpha = opacity
		this.offscreen.fillStyle = red
		this.offscreen.fillRect(0, 0, spriteWidth, spriteHeight)
		this.offscreen.globalAlpha = 1
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
