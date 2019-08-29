import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { QuotationPage } from "./quotation.js"
import { SettingsPage } from "./settings.js"

export class MainPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation) {
		super()

		this.navigation = navigation
	}

	startNewGame() { this.navigation.enter(QuotationPage) }
	resumeLastGame() { /*this.navigation.enter(LastGamePage)*/ }
	editSettings() { this.navigation.enter(SettingsPage) }
}
