import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { NewGamePage } from "./lobby.js"
import { SettingsPage } from "./settings.js"

export class MainPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation) {
		super()

		this.navigation = navigation
	}

	enterNewGame() { this.navigation.enter(NewGamePage) }
	enterLastGame() { /*this.navigation.enter(LastGamePage)*/ }
	enterSettings() { this.navigation.enter(SettingsPage) }
}
