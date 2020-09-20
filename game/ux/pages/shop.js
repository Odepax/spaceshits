import { Page, PageRegistry } from "../page-registry.js"
import { GameKeeper } from "../../lore/game-keeper.js"
import { ArenaPage } from "./arena.js"
import { MainPage } from "./main.js"
import { Random } from "../../math/random.js"

export class ShopPage extends Page {
	constructor(/** @type {PageRegistry} */ navigation, /** @type {GameKeeper} */ game) {
		super()

		this.navigation = navigation
		this.game = game
	}

	onInstall() {
		this.$.floorNumber.textContent = this.game.currentFloor
		this.$.arenaNumber.textContent = this.game.currentArena
		this.$.balanceDisplay.textContent = this.game.balance

		for (const item of this.game.buildShop())
			this.addItemButton(item)

		this.syncLegend(null)
	}
	
	/** @private @param {import("../../lore/shop-items").ShopItem} item */
	addItemButton(item) {
		const button = document.createElement("button")
		const iconSpan = document.createElement("span")

		button.className = "large " + item.colorName
		iconSpan.className = "icon " + item.icon

		button.appendChild(iconSpan)

		button.addEventListener("mouseenter", () => this.syncLegend(item), false)
		button.addEventListener("click", () => this.buy(item), false)
		button.addEventListener("mouseleave", () => this.syncLegend(null), false)

		this.$.itemButtons.appendChild(button)
	}

	/** @private @param {import("../../lore/shop-items").ShopItem} item */
	buy(item) {
		if (item.price <= this.game.balance) {
			item.apply(this.game)

			this.$.balanceDisplay.textContent = this.game.balance -= item.price
		}
	}

	/** @private @param {import("../../lore/shop-items").ShopItem} item */
	syncLegend(item = null) {
		if (item) {
			this.$.itemDescription.innerHTML = `"${ item.name }" <br/> ${ item.description }`
			this.$.itemPrice.textContent = item.price
			this.$.itemPriceCurrencyIcon.style.display = null
		}

		else {
			// Stolen from https://www.youtube.com/watch?v=zRE8v3QO7ZM
			this.$.itemDescription.innerHTML = Random.in([
				"How're you doin'?",
				"Hey! Come on in!",
				"Hey! Can I help you?",
				"Hey! Take a minute, look around. <br/> See 'f there is something you like.",
				"Yeh! You're beautiful!",
				"Hey! This ain't a library, pal."
			])
			this.$.itemPrice.textContent = null
			this.$.itemPriceCurrencyIcon.style.display = "none"
		}
	}

	continue() {
		this.navigation.enter(ArenaPage)
	}

	leave() {
		this.navigation.enter(MainPage)
	}
}
