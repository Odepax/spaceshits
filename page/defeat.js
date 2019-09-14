import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { MainPage } from "./main.js"

export class DefeatPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation) {
		super()

		this.navigation = navigation
	}

	backToMain() {
		this.navigation.enter(MainPage)
	}
}
