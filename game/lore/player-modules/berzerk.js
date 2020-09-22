import { Link, Universe } from "../../core/engine.js"
import { PlayerBullet, PlayerEnergy, PlayerShip } from "../../logic/player.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { UserInputRegistry } from "../../ux/user-input-capture.js"
import { GameKeeper } from "../game-keeper.js"

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
		if (!this.player && link.has(PlayerShip)) {
			this.player = link
			this.player.get(PlayerEnergy)[0].auxConsumption = 17
		}

		else if (this.isActive && link.has(PlayerBullet)) {
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

			this.regenerate(playerEnergy)
		}
	}

	/** @protected @param {PlayerEnergy} playerEnergy */
	regenerate(playerEnergy) {
		if (playerEnergy.aux < playerEnergy.auxMax)
			playerEnergy.aux += playerEnergy.auxRegen * this.universe.clock.spf
	}
}
