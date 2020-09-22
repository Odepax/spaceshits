import { Random } from "../../math/random.js"
import { Page, PageRegistry } from "../page-registry.js"
import { Quotes } from "../../lore/quotes.js"
import { ArenaPage } from "./arena.js"

export class QuotationPage extends Page {
	/** @param {PageRegistry} navigation */
	constructor(navigation) {
		super()

		this.navigation = navigation
		this.quote = Random.in(Quotes.list)
	}

	/** @private */
	get quoteDisplayDuration() {
		return this.quote.length * 80
	}

	onInstall() {
		this.$.quote.textContent = this.quote
	}

	onEnter() {
		setTimeout(() => this.navigation.enter(ArenaPage), this.quoteDisplayDuration)
	}
}
