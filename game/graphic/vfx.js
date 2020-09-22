import { Universe } from "../core/engine.js"
import { Random } from "../math/random.js"

/**
 * @typedef Particle
 * @property {number} x
 * @property {number} y
 * @property {number} vd
 * @property {number} vl
 * @property {number} spawnTime
 * @property {number} deathTime
 * @property {string} color
 * @property {number} radius
 */

/**
 * @typedef Blast
 * @property {number} x
 * @property {number} y
 * @property {number} spawnTime
 * @property {number} deathTime
 * @property {string} color
 * @property {number} radius
 */

/** @abstract */
class OnEventExplosion {
	/** @param {number} ttl @param {string[]} colors @param {number} radius */
	constructor(ttl, colors, radius) {
		this.ttl = ttl
		this.colors = colors
		this.radius = radius
	}
}

export class OnAddExplosion extends OnEventExplosion {}
export class OnRemoveExplosion extends OnEventExplosion {}

export class AuraFx {
	/** @param {number} radius @param {string} color */
	constructor(radius, color) {
		this.radius = radius
		this.color = color
		this.opacityFactor = 1
	}
}

// TODO: consider alternative render config
/*
new Link(
	new Render(
		Render.sprite(Sprites.turretBase, Render.ignoreRotation, Layers.ground),
		Render.sprite(Sprites.turretGun, Render.followRotation, Layers.ground),
		Render.circle(100, Layers.vfx, {
			blendMode: BlendModes.screen,
			fill: Colors.blue,
			fillOpacity: 0.3,
			stroke: Colors.blue
		})
	)
)
*/

export class VfxRegistry {
	/** @param {Universe} universe */
	constructor(universe) {
		/** @private */
		this.universe = universe

		/** @type {Set<Particle>} */
		this.particles = new Set()

		/** @type {Set<Blast>} */
		this.blasts = new Set()
	}

	/**
	 * @param {number} count
	 * @param {number} x
	 * @param {number} y
	 * @param {number} minSpeed
	 * @param {number} maxSpeed
	 * @param {number} lifeTime
	 * @param {string[]} colors
	 * @param {number} minRadius
	 * @param {number} maxRadius
	 */
	spawnParticleBurst(count, x, y, minSpeed, maxSpeed, lifeTime, colors, minRadius, maxRadius) {
		for (let i = 0; i < count; ++i)
			this.particles.add({
				x,
				y,
				vd: Random.angle(),
				vl: Random.between(minSpeed, maxSpeed),
				spawnTime: this.universe.clock.time,
				deathTime: this.universe.clock.time + lifeTime,
				color: Random.in(colors),
				radius: Random.between(minRadius, maxRadius)
			})
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} lifeTime
	 * @param {string} color
	 * @param {number} radius
	 */
	spawnBlast(x, y, lifeTime, color, radius) {
		this.blasts.add({
			x,
			y,
			spawnTime: this.universe.clock.time,
			deathTime: this.universe.clock.time + lifeTime,
			color,
			radius
		})
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} lifeTime
	 * @param {string[]} colors
	 * @param {number} radius
	 */
	spawnExplosion(x, y, lifeTime, colors, radius) {
		// TODO: Revamp count rad & speed computation...
		const count = radius / 2
		const minRadius = Math.max(2, 1 + Math.log10(radius))
		const maxRadius = Math.max(2, 1 + Math.log2(radius))
		const minSpeed = 40 + radius / lifeTime
		const maxSpeed = minSpeed * 3

		this.spawnParticleBurst(count, x, y, minSpeed, maxSpeed, lifeTime, colors, minRadius, maxRadius)
		this.spawnBlast(x, y, lifeTime, colors[0], radius)
	}
}
