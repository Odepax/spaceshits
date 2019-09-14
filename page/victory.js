import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { ArenaPage } from "./arena.js"

export class VictoryPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation) {
		super()

		this.navigation = navigation
	}

	continue() {
		this.navigation.enter(ArenaPage)
	}
}
