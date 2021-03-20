import { PageElement } from "./page"

class CounterButton extends PageElement<CounterButton, {
	nextReward: number,
	clickCount: number
}> {
	private rewardSpan: HTMLSpanElement
	private clickButton: HTMLButtonElement

	// Might as well use a decorator...
	// Or single file components...
	static [PageElement.template] = PageElement.jsxTemplate(
		<template class="Card Padding--large">
			<span id="rewardSpan" class="Margin--small-bottom"></span>
			<button id="clickButton" class="Button Button--large Button--blue"></button>
		</template>
	)

	connectedCallback() {
		this.$bind(this.rewardSpan, "textContent", "nextReward")
		this.$bind(this.clickButton, "textContent", "clickCount")
		this.$on(this.clickButton, "click", "handleClick")

		this.$.nextReward = 1
		this.$.clickCount = 0
	}

	handleClick() {
		this.$.clickCount += this.$.nextReward

		if (((2 ** this.$.clickCount) % this.$.clickCount) == 0)
			this.$.nextReward += 2
	}
}

class UpperMessage extends PageElement<UpperMessage, {
	message: string
}> {
	private messageInput: HTMLInputElement

	static [PageElement.template] = PageElement.jsxTemplate(
		<template class="Card Padding--large">
			<input id="messageInput" type="text" />
		</template>
	)

	connectedCallback() {
		this.$bind(this.messageInput, "value", "message")
		this.$on(this.messageInput, "change", "handleChange")
	}

	handleChange() {
		this.$.message = this.messageInput.value
			.toUpperCase()
			.replace(/[^A-Z]+/g, " ")
			.trim()
	}
}

customElements.define("gix-counterbutton", CounterButton)
customElements.define("gix-uppdermessage", UpperMessage)

document.body.appendChild(new CounterButton())
document.body.appendChild(new UpperMessage())
