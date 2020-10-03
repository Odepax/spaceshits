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

		const { boosters, upgrades, modules } = this.game.buildShop()

		for (let i = 0; i < upgrades.length; ++i) this.addItemButton(upgrades[i], 2 - i, 1)
		for (let i = 0; i < boosters.length; ++i) this.addItemButton(boosters[i], ~~(i / 2 + 1), i % 2 + 3)
		for (let i = 0; i < modules.length; ++i) this.addItemButton(modules[i], 2 - i, 6)

		this.syncLegend(null)
	}

	/** @private @param {import("../../lore/shop-items").ShopItem} item @param {number} row @param {number} col */
	addItemButton(item, row, col) {
		const button = document.createElement("button")
		const iconSpan = document.createElement("span")

		button.style.setProperty('--row', row);
		button.style.setProperty('--col', col);

		button.className = "large " + item.colorName
		iconSpan.className = "icon " + item.icon

		button.appendChild(iconSpan)

		button.addEventListener("mouseenter", () => this.syncLegend(item), false)
		button.addEventListener("click", () => this.buy(item, button), false)
		button.addEventListener("mouseleave", () => this.syncLegend(null), false)

		this.$.itemButtons.appendChild(button)
	}

	/** @private @param {import("../../lore/shop-items").ShopItem} item @param {HTMLElement} button */
	buy(item, button) {
		if (item.price <= this.game.balance) {
			item.apply(this.game)

			this.$.balanceDisplay.textContent = this.game.balance -= item.price

			if (item.isUnique)
				button.parentElement.removeChild(button)
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
