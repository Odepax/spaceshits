import { Link, Universe } from "../../core/engine.js"
import { Transform } from "../../math/transform.js"
import { Motion } from "../../physic/motion.js"
import { Collider } from "../../physic/collision.js"
import { Tags } from "../tags.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { AuraFx } from "../../graphic/vfx.js"
import { Colors } from "../../graphic/assets/colors.js"
import { UserInputCapturer } from "../../ux/user-input-capture.js"
import { GameKeeper } from "../game-keeper.js"
import { Player } from "../player.js"
import { Ratio } from "../../math/ratio.js"

class WaveGrowth {
	/** @param {number} spawnTime @param {number} deathTime @param {number} maxRadius */
	constructor(spawnTime, deathTime, maxRadius) {
		this.spawnTime = spawnTime
		this.deathTime = deathTime
		this.maxRadius = maxRadius
	}
}

export class Shockwave extends Link {
	/** @param {Transform} position @param {number} time */
	constructor(position, time) {
		super(
			new Motion(position, undefined, Motion.ignoreEdges),

			new Collider(200, Tags.player | Tags.field),
			new RammingDamage(0, Tags.hostile | Tags.ship/* | Tags.bullet*/, RammingDamage.bounceOtherOnDamage),

			new WaveGrowth(time, time + 0.7, 307),

			new AuraFx(200, Colors.orange)
		)
	}
}

export class ShockwavePlayerAuxRoutine {
	/** @param {UserInputCapturer} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		this.userInput = userInput
		this.game = game
		this.universe = universe

		/** @private @type {Link} */
		this.player = null

		/** @private @type {Set<Link>} */
		this.waves = new Set()

		this.energy = this.energyMax = 113 // TODO: Use new PlayerEnergy trait
		this.energyRegen = 23
		this.energyConsumption = 17
	}

	/** @param {Link} link */
	onAdd(link) {
		if (link instanceof Shockwave)
			this.waves.add(link)

		else if (!this.player && link instanceof Player)
			this.player = link
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null

		else
			this.waves.delete(link)
	}

	onStep() {
		if (this.player) {
			if (
				   this.energyConsumption <= this.energy // Has energy?
				&& this.userInput.wasPressed(this.game.keyBindings.aux) // Has order?
			) {
				this.energy -= this.energyConsumption

				this.universe.add(new Shockwave(
					this.player.get(Motion)[0].position.copy,
					this.universe.clock.time
				))
			}

			if (this.energy < this.energyMax)
				this.energy += this.energyRegen * this.universe.clock.spf
		}

		for (const wave of this.waves) {
			const [ waveCollider, waveAura, { spawnTime, deathTime, maxRadius } ] = wave.get(Collider, AuraFx, WaveGrowth)

			if (deathTime < this.universe.clock.time)
				this.universe.remove(wave)

			else {
				const progress = Ratio.progressBetween(this.universe.clock.time, spawnTime, deathTime)

				//waveAura.radius = waveCollider.radius = maxRadius * progress
				waveAura.opacityFactor = 1 - progress
			}
		}
	}
}
