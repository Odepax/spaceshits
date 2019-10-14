import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { GameCentral } from "../game/central/game.js"
import { ArenaPage } from "./arena.js"
import { MainPage } from "./main.js"
import { oneOf } from "../game/math/random.js"

export class ShopPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation, /** @type {GameCentral} */ game) {
		super()

		this.navigation = navigation
		this.game = game

		for (const item of this.game.getShop().items) {
			this.addItemButton(item)
		}

		this.syncLegend(null)
	}

	/** @private */ addItemButton(/** @type {import("../game/central/game.js").Item} */ item) {
		const button = document.createElement("button")
		const iconSpan = document.createElement("span")

		button.className = "large " + item.colorName
		iconSpan.className = "icon " + item.icon

		button.appendChild(iconSpan)

		button.addEventListener("mouseenter", () => this.syncLegend(item), false)
		button.addEventListener("mouseleave", () => this.syncLegend(null), false)

		button.addEventListener("click", () => this.buy(item), false)

		this.$.itemButtons.appendChild(button)
	}

	onInstall() {
		this.$.floorNumber.textContent = this.game.floor
		this.$.arenaNumber.textContent = this.game.arena - 1 // TODO: Fix floor/arena numbering in shop.
		this.$.balanceDisplay.textContent = this.game.player.sholdCount
	}

	/** @private */ buy(/** @type {import("../game/central/game.js").Item} */ item) {
		if (0 <= this.game.player.sholdCount - item.price) {
			this.$.balanceDisplay.textContent = this.game.player.sholdCount -= item.price

			item.onInstall(this.game)
		}
	}

	/** @private */ syncLegend(/** @type {import("../game/central/game.js").Item} */ item = null) {
		if (!item) {
			// https://www.youtube.com/watch?v=zRE8v3QO7ZM
			this.$.itemDescription.innerHTML = oneOf([
				"How're you doin'?",
				"Hey! Come on in!",
				"Hey! Can I help you?",
				"Hey! Take a minute, look around. <br /> See 'f there is something you like.",
				"Yeh! You're beautiful!",
				"Hey! This ain't a library, pal."
			])
			this.$.itemPrice.textContent = null
			this.$.itemPriceCurrencyIcon.style.display = "none"
		} else {
			this.$.itemDescription.innerHTML = `"${ item.name }" <br /> ${ item.description }`
			this.$.itemPrice.textContent = item.price
			this.$.itemPriceCurrencyIcon.style.display = null
		}
	}

	continue() {
		this.navigation.enter(ArenaPage)
	}

	leave() {
		this.navigation.enter(MainPage)
	}
}
