﻿import { VfxRegistry } from "../graphic/vfx.js"
import { Link } from "../core/engine.js"
import { Motion } from "../physic/motion.js"
import { Colors } from "../graphic/assets/colors.js"
import { Collider } from "../physic/collision.js"
import { Ratio } from "../math/ratio.js"
import { Universe } from "../core/engine.js"

/** @param {VfxRegistry} vfx */
export function spawnBerzerkParticles(vfx) {
	return /** @param {Link} link */ link => {
		const { x, y } = link.get(Motion)[0].position

		vfx.spawnParticleBurst(2, x, y, 70, 170, 0.5, [ Colors.orange, Colors.red ], 3, 7)
	}
}
/** @param {VfxRegistry} vfx */
export function spawDamageParticles(vfx) {
	return /** @param {Link} a @param {Link} b */ (a, b) => {
		const [ { position: { x: ax, y: ay } }, { radius: ar } ] = a.get(Motion, Collider)
		const [ { position: { x: bx, y: by } }, { radius: br } ] = b.get(Motion, Collider)

		// Stolen from the Internets:
		// https://brilliant.org/wiki/section-formula/
		const am = Ratio.progress(ar, ar + br)
		const bm = Ratio.progress(br, ar + br)

		const px = (am * bx + bm * ax) / (am + bm)
		const py = (am * by + bm * ay) / (am + bm)

		vfx.spawnParticleBurst(20, px, py, 100, 200, 1, [ Colors.white, Colors.silver, Colors.grey, Colors.black ], 2, 10)
	}
}

/** @param {VfxRegistry} vfx @param{Universe} universe */
export function spawnHealParticles(vfx, universe) {
	/** @type {WeakMap<Link, number>} */
	const nextHealParticuleTimes = new WeakMap()

	return /** @param {Link} link */ link => {
		if ((nextHealParticuleTimes.get(link) || 0) < universe.clock.time) {
			nextHealParticuleTimes.set(link, universe.clock.time + Random.between(0.2, 0.6))

			const { x, y } = link.get(Motion)[0].position

			vfx.spawnParticleBurst(2, x, y, 70, 170, 0.5, [ Colors.green, Colors.teal ], 3, 7)
		}
	}
}