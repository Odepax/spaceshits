import { Link, Routine, Universe } from "../engine.js"
import { Velocity, Transform, RemoveOnEdges } from "../dynamic.js"
import { SpriteRenderer, Render, Renderer } from "../render.js"
import { ExplosionOnRemove } from "./explosion.js"
import { Collision, CircleCollider, testCollision } from "../collision.js"
import { TargetFacing, ForwardChasing } from "../movement.js"
import { MatchSubRoutine } from "../routine.js"
import { red, white, silver, grey, black } from "../../asset/style/color.js"
import { ParticleCloudRenderer, ParticleCloud } from "./particle.js"
import { Ephemeral } from "../ephemeral.js"

export class Projectile {
	constructor(/** @type {import("../engine.js").Constructor<import("../engine.js").Trait>} */ targetType, /** @type {number} */ damage) {
		this.targetType = targetType
		this.damage = damage
	}
}

export class ProjectileTarget {}

/** @abstract */ class SelfRegeneratingGauge {
	constructor(/** @type {number} */ max, regen = 0, value = max) {
		this.max = max
		this.regen = regen
		this.value = value
	}

	get progress() { return this.value / this.max }
	get decline() { return 1 - this.value / this.max }
}

export class Hp extends SelfRegeneratingGauge {
	constructor() {
		super(101)

		this.timeSinceLastHit = Number.POSITIVE_INFINITY
	}
}

export class WeaponEnergy extends SelfRegeneratingGauge {
	constructor(/** @type {number} */ shotConsumption) {
		super(101, 23)

		this.shotConsumption = shotConsumption
	}
}

export class HpRoutine extends MatchSubRoutine {
	constructor(/** @type {Universe} */ universe) {
		super([ Hp ])

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
			target.Hp.timeSinceLastHit += this.universe.clock.spf

			for (const projectile of this.projectiles) {
				if (
					   target[projectile.Projectile.targetType.name]
					&& testCollision(projectile, target)
				) {
					this.universe.remove(projectile)

					target.Hp.value -= projectile.Projectile.damage
					target.Hp.timeSinceLastHit = 0
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
		if (link.Hp.timeSinceLastHit < 3) {
			const { Hp } = link
			const { offsetX, offsetY } = this.sprite

			this.offscreen.globalCompositeOperation = "source-over"
			this.drawOffscreenSprite()

			this.offscreen.globalCompositeOperation = "color"
			this.drawRedOverlay(Hp.decline * (1 - Hp.timeSinceLastHit / 3))

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
		this.damageBoostFactor = 1
	}
}

export class WeaponRoutine extends MatchSubRoutine {
	constructor(/** @type {Universe} */ universe) {
		super([ Weapon, Transform ])

		this.universe = universe
	}

	/** @param {{ Weapon: Weapon, Transform: Transform, WeaponEnergy?: WeaponEnergy }} */
	onSubStep({ Weapon, Transform, WeaponEnergy = null }) {
		Weapon.timeEnlapsed += this.universe.clock.spf

		if (Weapon.canFire && Weapon.fireRate < Weapon.timeEnlapsed && (!WeaponEnergy || WeaponEnergy.shotConsumption < WeaponEnergy.value)) {
			Weapon.timeEnlapsed = 0

			if (WeaponEnergy) {
				WeaponEnergy.value -= WeaponEnergy.shotConsumption
			}

			for (const projectileDefinition of Weapon.projectiles) {
				const projectile = new projectileDefinition.type(
					Transform.copy
						.relativeOffset(projectileDefinition.x, projectileDefinition.y)
						.rotate(projectileDefinition.a),
					projectileDefinition.target
				)

				if (projectile.Projectile) {
					projectile.Projectile.damage *= Weapon.damageBoostFactor
				}

				this.universe.add(projectile)
			}
		}

		if (WeaponEnergy && WeaponEnergy.value < WeaponEnergy.max) {
			WeaponEnergy.value += WeaponEnergy.regen * this.universe.clock.spf
		}
	}
}

export /** @abstract */ class Bullet extends Link {
	constructor(
		/** @type {Transform} */ transform,
		/** @type {number} */ speed,
		/** @type {import("../engine.js").Constructor<import("../engine.js").Trait>} */ targetType,
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
		/** @type {import("../engine.js").Constructor<import("../engine.js").Trait>} */ targetType,
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

export class RammingImpact {
	constructor(/** @type {import("../engine.js").Constructor<import("../engine.js").Trait>} */ targetType, /** @type {number} */ damage) {
		this.targetType = targetType
		this.damage = damage
	}
}

export class RammingImpactTarget {}

export class RammingImpactDamageRoutine extends Routine {
	constructor(/** @type {Universe} */ universe) {
		super()

		this.universe = universe
	}

	test({ Transform = null, Velocity = null, Collision = null, RammingImpact = null, RammingImpactTarget = null, Hp = null }) {
		return Transform && Velocity && Collision && (RammingImpact || (RammingImpactTarget && Hp))
	}

	onStep(/** @type {Iterable<{ Transform: Transform, Velocity: Velocity, Collision: Collision, RammingImpact?: RammingImpact, RammingImpactTarget?: RammingImpactTarget, Hp?: Hp }>} */ links) {
		links = Array.from(links)

		for (let i = 0; i < links.length; ++i) {
			/** @type {{ Transform: Transform, Velocity: Velocity, Collision: Collision, RammingImpact?: RammingImpact, RammingImpactTarget?: RammingImpactTarget, Hp?: Hp }} */
			const a = links[i]

			for (let j = i + 1; j < links.length; ++j) {
				/** @type {{ Transform: Transform, Velocity: Velocity, Collision: Collision, RammingImpact?: RammingImpact, RammingImpactTarget?: RammingImpactTarget, Hp?: Hp }} */
				const b = links[j]

				if (testCollision(a, b)) {
					let collision = false

					if (
						   a.RammingImpact
						&& b.RammingImpactTarget
						&& b[a.RammingImpact.targetType.name]
					) {
						collision = true

						b.Hp.value -= a.RammingImpact.damage
						b.Hp.timeSinceLastHit = 0
					}

					if (
						   b.RammingImpact
						&& a.RammingImpactTarget
						&& a[b.RammingImpact.targetType.name]
					) {
						collision = true

						a.Hp.value -= b.RammingImpact.damage
						a.Hp.timeSinceLastHit = 0
					}

					if (collision) {
						const overlapDistance = a.Collision.collider.radius
							+ b.Collision.collider.radius
							- a.Transform.lengthTo(b.Transform)

						const direction = a.Transform.directionTo(b.Transform)

						a.Transform.angularOffset(direction, -overlapDistance / 2)
						b.Transform.angularOffset(direction, +overlapDistance / 2)

						const formerA = a.Velocity.l

						a.Velocity.d = direction
						a.Velocity.l = -b.Velocity.l

						b.Velocity.d = direction
						b.Velocity.l = +formerA

						this.universe.add(new Link([
							new Transform(
								(a.Transform.x + b.Transform.x) / 2,
								(a.Transform.y + b.Transform.y) / 2
							),
							new Ephemeral(1),
							new ParticleCloud([ white, silver, grey, black ], 20, 2, 10, 100, 200),
							new Render(
								new ParticleCloudRenderer(),
								Render.IGNORE_ROTATION
							)
						]))
					}
				}
			}
		}
	}
}