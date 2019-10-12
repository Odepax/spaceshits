import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { GameCentral } from "../game/central/game.js"
import { MainPage } from "./main.js"

export class VictoryPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation, /** @type {GameCentral} */ game) {
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
