import { Link, Universe } from "../../core/engine.js"
import { PlayerEnergy, PlayerShip } from "../../logic/player.js"
import { Transform } from "../../math/transform.js"
import { Motion } from "../../physic/motion.js"
import { UserInputRegistry } from "../../ux/user-input-capture.js"
import { PLAYER_BLINK_ENERGY } from "../game-balance.js"
import { GameKeeper } from "../game-keeper.js"

export class BlinkPlayerAuxRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe @param {(link: Link, nextPosition: Transform) => void} onBlink */
	constructor(userInput, game, universe, onBlink = null) {
		this.userInput = userInput
		this.game = game
		this.universe = universe
		this.onBlink = onBlink

		/** @private @type {Link} */
		this.player = null

		/** @type {number} */
		this.activationEndTime = null
	}

	/** @param {Link} link */
	onAdd(link) {
		if (link.has(PlayerShip)) {
			this.player = link
			this.player.get(PlayerEnergy)[0].auxConsumption = PLAYER_BLINK_ENERGY
		}
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null
	}

	onStep() {
		if (this.player) {
			const [ playerEnergy, playerMotion ] = this.player.get(PlayerEnergy, Motion)

			if (
				   playerEnergy.auxConsumption <= playerEnergy.aux // Has energy?
				&& this.userInput.wasPressed(this.game.keyBindings.aux) // Has order?
			) {
				playerEnergy.aux -= playerEnergy.auxConsumption

				this.onBlink?.(this.player, this.userInput.mousePosition)

				playerMotion.position.x = this.userInput.mousePosition.x
				playerMotion.position.y = this.userInput.mousePosition.y
			}

			this.regenerate(playerEnergy)
		}
	}

	/** @protected @param {PlayerEnergy} playerEnergy */
	regenerate(playerEnergy) {
		if (playerEnergy.aux < playerEnergy.auxMax)
			playerEnergy.aux += playerEnergy.auxRegen * this.universe.clock.spf
	}
}
