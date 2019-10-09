import { GameCentral, Arena } from "../game/central/game.js"
import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { DefeatPage } from "./defeat.js"
import { VictoryPage } from "./victory.js"

export class ArenaPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation, /** @type {GameCentral} */ game) {
		super()

		this.navigation = navigation
		this.game = game

		/** @type {Arena} */ this.arena = null
	}

	onInstall() {
		const gameCanvas = this.$.gameCanvas

		gameCanvas.focus()
		gameCanvas.addEventListener("mouseenter", () => gameCanvas.focus(), false)
		gameCanvas.addEventListener("mousedown", () => gameCanvas.focus(), false)

		this.arena = this.game.buildArena(this.$.gameCanvas, this.$.hpBar, this.$.energyBar)
	}

	onEnter() {
		this.arena.start(
			() => this.navigation.enter(VictoryPage),
			() => this.navigation.enter(DefeatPage)
		)
	}

	onExit() {
		this.arena.stop()
	}
}
