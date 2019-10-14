import { GameCentral, Arena } from "../game/central/game.js"
import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { DefeatPage } from "./defeat.js"
import { ShopPage } from "./shop.js"
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

		this.$.floorNumber.textContent = this.game.floor
		this.$.arenaNumber.textContent = this.game.arena

		this.arena = this.game.getArena(this.$.gameCanvas, this.$.hpBar, this.$.energyBar)
	}

	onEnter() {
		this.arena.wait(
			() => {
				if (this.game.arena == 7) { // TODO: Remove hard-coded value.
					this.navigation.enter(VictoryPage)
				} else {
					this.game.stepArena()
					this.navigation.enter(ShopPage)
				}
			},
			() => {
				this.navigation.enter(DefeatPage)
			}
		)
	}

	onExit() {
		this.arena.complete()
	}
}
