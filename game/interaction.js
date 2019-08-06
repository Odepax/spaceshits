import { Transform } from "../physic/mechanic.js";
import { Routine } from "../engine/core.js";

export class InteractionCentral {
	constructor(/** @type {HTMLElement} */ observedElement) {
		this.mousePosition = new Transform()

		/** @private @type {Set<string>} */ this.currentlyPressedKeys = new Set()
		/** @private @type {Set<string>} */ this.pressedKeys = new Set()
		/** @private @type {Set<string>} */ this.releasedKeys = new Set()
		/** @private @type {Set<string>} */ this.pressedKeys.next = new Set()
		/** @private @type {Set<string>} */ this.releasedKeys.next = new Set()

		this.observe(observedElement)
	}

	isPressed(/** @type {string} */ key) { return this.currentlyPressedKeys.has(key) }
	wasPressed(/** @type {string} */ key) { return this.pressedKeys.has(key) }
	wasReleased(/** @type {string} */ key) { return this.releasedKeys.has(key) }

	observe(/** @type {HTMLElement} */ element) {
		element.addEventListener("mousemove", event => {
			this.mousePosition.x = event.offsetX
			this.mousePosition.y = event.offsetY
		}, false)

		element.addEventListener("contextmenu", event => {
			event.preventDefault()
		}, false)

		element.addEventListener("mousedown", event => {
			event.preventDefault()

			switch (event.button) {
				case 0: this.pressedKeys.next.add("MouseLeft"); break
				case 2: this.pressedKeys.next.add("MouseRight"); break
				case 1: this.pressedKeys.next.add("MouseMiddle"); break
			}
		}, false)

		document.addEventListener("mouseup", event => {
			event.preventDefault()

			switch (event.button) {
				case 0: this.releasedKeys.next.add("MouseLeft"); break
				case 2: this.releasedKeys.next.add("MouseRight"); break
				case 1: this.releasedKeys.next.add("MouseMiddle"); break
			}
		}, false)

		element.addEventListener("keydown", event => {
			if (event.code != "F5" && event.code != "F11" && event.code != "F12") {
				event.preventDefault()
			}

			if (!this.currentlyPressedKeys.has(event.code)) {
				this.pressedKeys.next.add(event.code)
			}
		}, false)

		document.addEventListener("keyup", event => {
			if (event.code != "F5" && event.code != "F11" && event.code != "F12") {
				event.preventDefault()
			}

			this.releasedKeys.next.add(event.code)
		}, false)
	}

	/** @private */ step() {
		for (const key of this.pressedKeys.next) {
			this.currentlyPressedKeys.add(key)
		}

		for (const key of this.releasedKeys.next) {
			this.currentlyPressedKeys.delete(key)
		}

		this.pressedKeys = this.pressedKeys.next
		this.releasedKeys = this.releasedKeys.next

		this.pressedKeys.next = new Set()
		this.releasedKeys.next = new Set()
	}
}

export class InteractionRoutine extends Routine {
	constructor(/** @type {InteractionCentral} */ interactionCentral) {
		this.interactionCentral = interactionCentral
	}

	onStep(/** @type {Link[]} */ links) {
		this.interactionCentral.step()
	}
}
