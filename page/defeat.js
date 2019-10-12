import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { GameCentral } from "../game/central/game.js"
import { MainPage } from "./main.js"

export class DefeatPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation, /** @type {GameCentral} */ game) {
		super()

		this.navigation = navigation
		this.game = game
	}

	onInstall() {
		this.$.floorNumber.textContent = this.game.floor
		this.$.arenaNumber.textContent = this.game.arena

		this.game.reset()
	}

	backToMain() {
		this.navigation.enter(MainPage)
	}
}
