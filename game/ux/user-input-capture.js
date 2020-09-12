import { Transform } from "../math/transform.js"

export class UserInputRegistry {
	/** @param {HTMLElement} observedElement */
	constructor(observedElement) {
		this.mousePosition = new Transform()

		/** @private @type {Set<string>} */
		this.currentlyPressedKeys = new Set()

		/** @private @type {Set<string>} */
		this.pressedKeys = new Set()

		/** @private @type {Set<string>} */
		this.releasedKeys = new Set()

		this.pressedKeys.next = new Set()
		this.releasedKeys.next = new Set()

		this.observe(observedElement)
	}

	/** @param {string} key */
	isPressed(key) {
		return this.currentlyPressedKeys.has(key)
	}

	/** @param {string} key */
	wasPressed(key) {
		return this.pressedKeys.has(key)
	}

	/** @param {string} key */
	wasReleased(key) {
		return this.releasedKeys.has(key)
	}

	/** @private @param {HTMLElement} element */
	observe(element, unFilteredKeys = [ "F5", "F11", "F12" ]) {
		element.addEventListener("mousemove", event => {
			this.mousePosition.x = event.offsetX
			this.mousePosition.y = event.offsetY
		}, false)

		element.addEventListener("contextmenu", event => {
			event.preventDefault()
		}, false)

		element.addEventListener("mousedown", event => {
			event.preventDefault()

			this.pressedKeys.next.add(UserInputRegistry.mouseButtonLabels[event.button]);
		}, false)

		document.addEventListener("mouseup", event => {
			event.preventDefault()

			this.releasedKeys.next.add(UserInputRegistry.mouseButtonLabels[event.button]);
		}, false)

		element.addEventListener("keydown", event => {
			// Don't preventDefault on e.g. F5.
			if (unFilteredKeys.indexOf(event.code) == -1)
				event.preventDefault()

			if (!this.currentlyPressedKeys.has(event.code))
				this.pressedKeys.next.add(event.code)
		}, false)

		document.addEventListener("keyup", event => {
			// Don't preventDefault on e.g. F12.
			if (unFilteredKeys.indexOf(event.code) == -1)
				event.preventDefault()

			this.releasedKeys.next.add(event.code)
		}, false)
	}

	/** @private */
	step() {
		for (const key of this.pressedKeys.next)
			this.currentlyPressedKeys.add(key)

		for (const key of this.releasedKeys.next)
			this.currentlyPressedKeys.delete(key)

		this.pressedKeys = this.pressedKeys.next
		this.releasedKeys = this.releasedKeys.next

		this.pressedKeys.next = new Set()
		this.releasedKeys.next = new Set()
	}
}

UserInputRegistry.mouseButtonLabels = [ "MouseLeft", "MouseMiddle", "MouseRight" ]

/** @implements {import("../core/engine").Routine} */
export class UserInputCaptureRoutine {
	/** @param {UserInputRegistry} userInput */
	constructor(userInput) {
		this.userInput = userInput
	}

	onStep() {
		this.userInput.step()
	}

	// Nothing to do here...
	onAdd() {}
	onRemove() {}
}
