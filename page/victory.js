import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { ArenaPage } from "./arena.js"
import { GameCentral } from "../game/central/game.js"

export class VictoryPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation, /** @type {GameCentral} */ game) {
		super()

		this.navigation = navigation
		this.game = game
	}

	onExit() {
		this.game.stepArena()
	}

	continue() {
		this.navigation.enter(ArenaPage)
	}
}
