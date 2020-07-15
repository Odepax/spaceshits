export class PageRegistry {
	/** @param {HTMLElement} host */
	constructor(host) {
		/** @private */
		this.host = host

		/** @private @type {Page} */
		this.currentPage = null

		/** @private @type {Map<import("../core/engine").Constructor<Page>, () => Page>} */
		this.factories = new Map()
	}

	/** @template {Page} T @param {import("../core/engine").Constructor<T>} page @param {() => T} factory */
	add(page, factory) {
		window.customElements.define("shit-" + page.name.toLowerCase(), page)

		this.factories.set(page, factory)
	}

	/** @template {Page} T @param {import("../core/engine").Constructor<T>} page */
	enter(page) {
		if (this.currentPage) {
			const previousPage = this.currentPage

			previousPage.onExit() // 1 // 2: No animation on page exit.
			previousPage.onUninstall() // 3

			this.host.removeChild(previousPage) // 4
		}

		const newPage = this.factories.get(page)()

		this.host.appendChild(newPage) // 4

		newPage.onInstall() // 3

		newPage.addEventListener("animationend", function invokePageEnterCallback() { // 2: Animation on enter.
			newPage.onEnter() // 1
			newPage.removeEventListener("animationend", invokePageEnterCallback, false)
		}, false)

		newPage.classList.add("visible") // 2: Animation trigger.

		this.currentPage = newPage
	}
}

/** @abstract */
export class Page extends HTMLElement {
	constructor() {
		super()

		const template = document.getElementById(this.constructor.name)

		this.className = template.className
		this.classList.add("page")

		this.appendChild(document.importNode(template.content, true))

		/** @protected @type {{ [id: string]: HTMLElement }} */
		this.$ = {}

		for (const element of this.querySelectorAll("[id]")) {
			this.$[element.getAttribute("id")] = element
			element.removeAttribute("id")
		}

		for (const element of this.querySelectorAll("[data-on]")) {
			const [ event, action ] = element.getAttribute("data-on").split(":")

			element.addEventListener(event, this[action].bind(this), false)
		}
	}

	/** @abstract */ onInstall() {}
	/** @abstract */ onEnter() {}
	/** @abstract */ onExit() {}
	/** @abstract */ onUninstall() {}
}
