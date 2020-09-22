import { Link, Universe } from "../core/engine.js"
import { AutoIteratingRoutine } from "../core/routines.js"
import { TargetFacing } from "../math/target-facing.js"
import { Motion } from "../physic/motion.js"
import { HostileMissile } from "./hostile.js"
import { MissileControl } from "./missile-control.js"
import { PlayerShip } from "./player.js"

export class AutoWeaponModule {
	/** @param {number} reloadTime @param {(parent: Link) => Link[]} factory */
	constructor(reloadTime, factory) {
		this.reloadTime = reloadTime
		this.factory = factory

		/** @private */
		this.nextShotTime = -1
	}
}

export class AutoWeaponModuleRoutine extends AutoIteratingRoutine {
	/** @param {Universe} universe */
	constructor(universe) {
		super()

		this.universe = universe
	}

	/** @param {Link} link */
	accepts(link) {
		return link.has(AutoWeaponModule)
	}

	/** @param {Link} link */
	onAdded(link) {
		const [ weaponModule ] = link.get(AutoWeaponModule)

		weaponModule.nextShotTime = this.universe.clock.time + weaponModule.reloadTime
	}

	/** @param {Link} link */
	onSubStep(link) {
		const [ weaponModule ] = link.get(AutoWeaponModule)

		if (weaponModule.nextShotTime < this.universe.clock.time) {
			weaponModule.nextShotTime = this.universe.clock.time + weaponModule.reloadTime

			for (const bullet of weaponModule.factory(link))
				this.universe.add(bullet)

			// TODO: Apply damage boosters.
		}
	}
}

/** @implements {import("../core/engine").Routine */
export class HostileMissileRoutine {
	/** @param {Universe} universe */
	constructor(universe) {
		this.universe = universe

		/** @private @type {Link} */
		this.player = null

		/** @private @type {Set<Link>} */
		this.hostileMissiles = new Set()
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link.has(PlayerShip))
			this.player = link

		else if (link.has(HostileMissile, MissileControl))
			this.hostileMissiles.add(link)
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null

		else
			this.hostileMissiles.delete(link)
	}

	onStep() {
		if (this.player)
		for (const link of this.hostileMissiles) {
			const [ missileMotion, missileControl ] = link.get(Motion, MissileControl)
			const [ playerMotion ] = this.player.get(Motion)

			TargetFacing.smooth(
				missileMotion.position,
				missileMotion.velocity,
				playerMotion.position,
				missileControl.steeringSpeed,
				this.universe.clock.spf
			)

			// Forward chasing.
			missileMotion.velocity.d = missileMotion.position.a
		}
	}
}
