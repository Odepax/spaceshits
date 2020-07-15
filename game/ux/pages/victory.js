import { Page, PageRegistry } from "../page-registry"
import { GameKeeper } from "../../lore/game-keeper"

export class VictoryPage extends Page {
	/** @param {PageRegistry} navigation @param {GameKeeper} game */
	constructor(navigation,  game) {
		super()

		this.navigation = navigation
		this.game = game
	}

	onInstall() {
		//this.game.reset() // TODO: do this not from the UI
	}

	continue() {
		//this.navigation.enter(MainPage)
	}
}
