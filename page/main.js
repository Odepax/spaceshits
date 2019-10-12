import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { QuotationPage } from "./quotation.js"
import { SettingsPage } from "./settings.js"
import { ShopPage } from "./shop.js"
import { ParameterCentral } from "../game/central/parameter.js"
import { GameCentral } from "../game/central/game.js"

export class MainPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation, /** @type {ParameterCentral} */ parameters, /** @type {GameCentral} */ game) {
		super()

		this.navigation = navigation
		this.parameters = parameters
		this.game = game
	}

	onInstall() {
		if (this.game.floor == 1 && this.game.arena == 1) {
			this.$.resumeButton.style.display = "none"
		}

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

	startNewGame() {
		this.game.reset()
		this.navigation.enter(QuotationPage)
	}

	resumeLastGame() { this.navigation.enter(ShopPage) }
	editSettings() { this.navigation.enter(SettingsPage) }
}
