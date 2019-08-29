const pageTemplate = Symbol()

/** Application pages. */
export class NavigationCentral {
	constructor(/** @type {HTMLElement} */ host) {
		this.host = host

		/** @private @type {SpaceshitsPage} */ this.currentPage = null
		/** @private @type {Map<import("../engine").Constructor<SpaceshitsPage>, () => SpaceshitsPage>} */ this.factories = new Map()
	}

	register(
		/** @type {import("../engine").Constructor<SpaceshitsPage>} */ pageContructor,
		/** @type {() => SpaceshitsPage} */ factory = () => new pageContructor(),
		/** @type {string} */ tagName = null,
		/** @type {HTMLTemplateElement} */ template = null
	) {
		tagName = tagName || pageContructor.name
			.replace(/([A-Z]+|[0-9]+)/g, (letters, _, i) => i == 0 ? letters : "-" + letters)
			.toLowerCase()

		pageContructor[pageTemplate] = template
			|| document.getElementById(tagName)
			|| document.getElementById(pageContructor.name)

		window.customElements.define(tagName, pageContructor)

		this.factories.set(pageContructor, factory)
	}

	enter(/** @type {import("../engine").Constructor<SpaceshitsPage>} */ pageContructor) {
		if (this.currentPage) {
			const previousPage = this.currentPage

			previousPage.onExit() // 1

			previousPage.addEventListener("animationend", () => { // 2
				previousPage.onUninstall() // 3

				this.host.removeChild(previousPage) // 4
			}, false)

			previousPage.classList.add("hidden")
			previousPage.classList.remove("visible")
		}

		const newPage = this.factories.get(pageContructor)()

		this.host.appendChild(newPage) // 4

		newPage.onInstall() // 3

		const invokePageEnterCallback = () => {
			newPage.onEnter() // 1
			newPage.removeEventListener("animationend", invokePageEnterCallback, false)
		}

		newPage.addEventListener("animationend", invokePageEnterCallback, false) // 2
		newPage.classList.add("visible")

		this.currentPage = newPage
	}
}

export class SpaceshitsPage extends HTMLElement {
	constructor() {
		super()

		this.classList.add("page", "pull-in", "push-out", "stack-vertical")

		const template = document.importNode(this.constructor[pageTemplate].content, true)
		const shadowDom = this.attachShadow({ mode: "closed" })

		shadowDom.appendChild(template)

		/** @type {{[id: string]: HTMLElement}} */ this.$ = {}

		for (const element of shadowDom.querySelectorAll("[id]")) {
			this.$[element.getAttribute("id")] = element
			element.removeAttribute("id")
		}

		for (const element of shadowDom.querySelectorAll("[data-on]")) {
			const [ event, action ] = element.getAttribute("data-on").split(":")

			element.addEventListener(event, this[action].bind(this), false)
			element.removeAttribute("data-on")
		}
	}

	onInstall() {}
	onEnter() {}
	onExit() {}
	onUninstall() {}
}
