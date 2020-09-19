import { Page, PageRegistry } from "../page-registry.js"
import { GameKeeper } from "../../lore/game-keeper.js"
import { QuotationPage } from "./quotation.js"
import { SettingsPage } from "./settings.js"

export class MainPage extends Page {
	/** @param {PageRegistry} navigation @param {GameKeeper} game */
	constructor(navigation, game) {
		super()

		this.navigation = navigation
		this.game = game
	}

	onInstall() {
		if (this.game.isPristine)
			this.$.resumeButton.style.display = "none"

		this.$.upKeyTooltip.textContent = this.formatKey(this.game.keyBindings.up)
		this.$.leftKeyTooltip.textContent = this.formatKey(this.game.keyBindings.left)
		this.$.downKeyTooltip.textContent = this.formatKey(this.game.keyBindings.down)
		this.$.rightKeyTooltip.textContent = this.formatKey(this.game.keyBindings.right)
		this.$.shootKeyTooltip.textContent = this.formatKey(this.game.keyBindings.shoot)
		this.$.auxKeyTooltip.textContent = this.formatKey(this.game.keyBindings.aux)
		this.$.pauseKeyTooltip.textContent = this.formatKey(this.game.keyBindings.pause)
	}

	/** @private @param {string} key */
	formatKey(key) {
		return key
			.replace("Key", "")
			.replace("Mouse", "Mouse ")
			.replace("Arrow", "")
			.replace("Numpad", "Numpad ")
	}

	startNewGame() {
		this.game.reset()
		this.navigation.enter(QuotationPage)
	}

	resumeLastGame() {
		//this.navigation.enter(ShopPage)
	}

	editSettings() {
		this.navigation.enter(SettingsPage)
	}
}
