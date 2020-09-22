import { Page, PageRegistry } from "../page-registry.js"
import { GameKeeper } from "../../lore/game-keeper.js"
import { MainPage } from "./main.js"

export class VictoryPage extends Page {
	/** @param {PageRegistry} navigation @param {GameKeeper} game */
	constructor(navigation,  game) {
		super()

		this.navigation = navigation
		this.game = game
	}

	onInstall() {
		this.game.reset()
	}

	continue() {
		this.navigation.enter(MainPage)
	}
}
