import { Page, PageRegistry } from "../page-registry.js"
import { GameKeeper } from "../../lore/game-keeper.js"
import { Universe } from "../../core/engine.js"

export class ArenaPage extends Page {
	/** @param {PageRegistry} navigation @param {GameKeeper} game */
	constructor(navigation, game) {
		super()

		this.navigation = navigation
		this.game = game
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
		//this.arena.wait(
		//	() => {
		//		if (this.game.arena == 7) { // TODO: Remove hard-coded value.
		//			this.navigation.enter(VictoryPage)
		//		} else {
		//			this.game.stepArena()
		//			this.navigation.enter(ShopPage)
		//		}
		//	},
		//	() => {
		//		this.navigation.enter(DefeatPage)
		//	}
		//)

		const onVictory = () => console.log("Victory!")
		const onDefeat = () => console.log("Defeat...")

		this.universe = this.game.buildArena(this.$.gameCanvas, this.$.hpProgress, this.$.energyProgress, this.$.moduleProgress, onVictory, onDefeat)

		this.universe.then(u => u.start())
	}

	onExit() {
		this.universe?.then(u => u.stop())
	}
}
