import { ParameterCentral } from "../game/central/parameter.js"
import { mouseButtonLabels } from "../game/central/interaction.js"
import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { MainPage } from "./main.js"

export class SettingsPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation, /** @type {ParameterCentral} */ parameters) {
		super()

		this.navigation = navigation
		this.parameters = parameters

		/** @private @type {import("../game/engine.js").Bag<string>} */ this.keyBindings = {}
	}

	onInstall() {
		for (const key of Object.getOwnPropertyNames(this.parameters.keys)) {
			this.setBinding(key, this.parameters.keys[key])

			const binder = this.$["key-" + key]

			binder.addEventListener("mouseenter", () => binder.focus(), false)
			binder.addEventListener("mouseleave", () => binder.blur(), false)

			binder.addEventListener("keydown", ({ code }) => this.setBinding(key, code), false)
			binder.addEventListener("mousedown", ({ button }) => this.setBinding(key, mouseButtonLabels[button]), false)
		}
	}

	/** @private */ setBinding(/** @type {string} */ key, /** @type {string} */ value) {
		this.$["key-" + key].getElementsByClassName("label")[0].textContent = value
		this.keyBindings[key] = value
	}

	discardChanges() {
		this.enterMain()
	}

	saveChanges() {
		for (const key of Object.getOwnPropertyNames(this.keyBindings)) {
			this.parameters.keys[key] = this.keyBindings[key]
		}

		this.enterMain()
	}

	enterMain() { this.navigation.enter(MainPage) }
}
