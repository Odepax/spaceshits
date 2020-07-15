import { Page, PageRegistry } from "../page-registry"
import { GameKeeper } from "../../lore/game-keeper"

export class DefeatPage extends Page {
	/** @param {PageRegistry} navigation @param {GameKeeper} game */
	constructor(navigation, game) {
		super()

		this.navigation = navigation
		this.game = game
	}

	onInstall() {
		this.$.floorNumber.textContent = this.game.currentFloor
		this.$.arenaNumber.textContent = this.game.currentArena

		//this.game.reset() // TODO: do this not from the UI
	}

	backToMain() {
		//this.navigation.enter(MainPage)
	}
}
