import { Link, Universe } from "../../core/engine.js"
import { Collider } from "../../physic/collision.js"
import { Tags } from "../tags.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { UserInputRegistry } from "../../ux/user-input-capture.js"
import { GameKeeper } from "../game-keeper.js"
import { Player, PlayerEnergy } from "../player.js"
import { Flag } from "../../math/flag.js"

export class BerzerkPlayerAuxRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe @param {(link: Link) => void} onActive */
	constructor(userInput, game, universe, onActive = null) {
		this.userInput = userInput
		this.game = game
		this.universe = universe
		this.onActive = onActive

		/** @private @type {Link} */
		this.player = null

		this.isActive = false

		/** @type {number} */ 
		this.activationEndTime = null
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player) {
			this.player = link
			this.player.get(PlayerEnergy)[0].auxConsumption = 17
		}

		else if (this.isActive && Flag.contains(link.get(Collider)[0]?.tag, Tags.player | Tags.bullet)) {
			link.get(RammingDamage)[0].damage *= 2
			this.onActive?.(link)
		}
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null
	}

	onStep() {
		if (this.player) {
			const [ playerEnergy ] = this.player.get(PlayerEnergy)

			if (
				   playerEnergy.auxConsumption <= playerEnergy.aux // Has energy?
				&& this.userInput.wasPressed(this.game.keyBindings.aux) // Has order?
			) {
				playerEnergy.aux -= playerEnergy.auxConsumption

				this.isActive = true
				this.activationEndTime = this.universe.clock.time + 5
			}

			if (this.activationEndTime < this.universe.clock.time)
				this.isActive = false

			if (playerEnergy.aux < playerEnergy.auxMax) // TODO: refactor player energy regen (aux and weapons, though weapons might have their own refactor)
				playerEnergy.aux += playerEnergy.auxRegen * this.universe.clock.spf
		}
	}
}
