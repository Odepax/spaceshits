import { Link, Universe } from "../core/engine.js"
import { AutoIteratingRoutine } from "../core/routines.js"
import { Player } from "../lore/player.js"
import { Motion } from "../physic/motion.js"
import { Tags } from "../lore/tags.js"
import { Collider } from "../physic/collision.js"
import { TargetFacing } from "../math/target-facing.js"
import { MissileControl } from "./missile-control.js"
import { Flag } from "../math/flag.js"

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

		/** @private @type {Player} */
		this.player = null

		/** @private @type {Set<Link>} */
		this.links = new Set()
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player) // TODO: review the way we distinguish the player
			this.player = link

		else if (link.has(MissileControl) && Flag.contains(link.get(Collider)[0]?.tag, Tags.hostile | Tags.bullet))
			this.links.add(link)
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null

		else
			this.links.delete(link)
	}

	onStep() {
		if (this.player)
		for (const link of this.links) {
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
