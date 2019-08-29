import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { QuotationPage } from "./quotation.js"
import { SettingsPage } from "./settings.js"
import { LobbyPage } from "./lobby.js"

export class MainPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation) {
		super()

		this.navigation = navigation
	}

	startNewGame() { this.navigation.enter(QuotationPage) }
	resumeLastGame() { this.navigation.enter(LobbyPage) }
	editSettings() { this.navigation.enter(SettingsPage) }
}
