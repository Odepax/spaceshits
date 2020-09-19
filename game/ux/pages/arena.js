import { Page, PageRegistry } from "../page-registry.js"
import { GameKeeper } from "../../lore/game-keeper.js"

export class ArenaPage extends Page {
	/** @param {PageRegistry} navigation @param {GameKeeper} game */
	constructor(navigation, game) {
		super()

		this.navigation = navigation
		this.game = game

		/** @private */
		this.isPaused = false

		/** @private */
		this.togglePause = event => {
			if (event.code == this.game.keyBindings.pause) {
				event.preventDefault()

				this.isPaused
					? this.universe.then(u => u.start())
					: this.universe.then(u => u.stop())

				this.isPaused = !this.isPaused
			}
		}
	}

	onInstall() {
		/** @type {HTMLCanvasElement} */ 
		const gameCanvas = this.$.gameCanvas

		gameCanvas.focus()
		gameCanvas.addEventListener("mouseenter", () => gameCanvas.focus(), false)
		gameCanvas.addEventListener("mousedown", () => gameCanvas.focus(), false)

		this.$.floorNumber.textContent = this.game.currentFloor
		this.$.arenaNumber.textContent = this.game.currentArena
	}

	onEnter() {
		const onVictory = () => {
			console.log("Victory!")

			//if (this.game.isLastArena)
			//	this.navigation.enter(VictoryPage)

			//else {
			//	this.game.stepArena()
			//	this.navigation.enter(ShopPage)
			//}
		}

		const onDefeat = () => {
			console.log("Defeat...")

			//this.navigation.enter(DefeatPage)
		}

		this.universe = this.game.buildArena(this.$.gameCanvas, this.$.hpProgress, this.$.energyProgress, this.$.moduleProgress, onVictory, onDefeat)

		this.universe.then(u => u.start())
		document.addEventListener("keydown", this.togglePause, false)
	}

	onExit() {
		document.removeEventListener("keydown", this.togglePause, false)
		this.universe?.then(u => u.stop())
	}
}
