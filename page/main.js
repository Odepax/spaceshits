import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { QuotationPage } from "./quotation.js"
import { SettingsPage } from "./settings.js"
import { LobbyPage } from "./lobby.js"
import { ParameterCentral } from "../game/central/parameter.js"

export class MainPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation, /** @type {ParameterCentral} */ parameters) {
		super()

		this.navigation = navigation
		this.parameters = parameters
	}

	onInstall() {
		this.$.settingsTooltip.innerHTML = `
			Move: ${ this.formatKey("up") } ${ this.formatKey("left") } ${ this.formatKey("down") } ${ this.formatKey("right") } <br />
			Shoot: ${ this.formatKey("shoot")} <br />
			AUX Module: ${ this.formatKey("aux") } <br />
			Pause: ${ this.formatKey("pause") }
		`
	}

	/** @private */ formatKey(/** @type {string} */ key) {
		return this.parameters.keys[key]
			.replace("Key", "")
			.replace("Mouse", "Mouse ")
	}

	startNewGame() { this.navigation.enter(QuotationPage) }
	resumeLastGame() { this.navigation.enter(LobbyPage) }
	editSettings() { this.navigation.enter(SettingsPage) }
}
