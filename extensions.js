let _logCount = 500

function log() {
	if (--_logCount > 0) {
		console.log(...arguments)
	}
}

// -----------------------------------------------------------------

const PI = Math.PI
const abs = Math.abs
const sign = Math.sign
const sin = Math.sin
const cos = Math.cos
const atan = Math.atan
const atan2 = Math.atan2
const ceil = Math.ceil
const round = Math.round
const sqrt = Math.sqrt
const square = x => x * x
const min = Math.min
const max = Math.max
const absMin = (a, b) => abs(a) < abs(b) ? a : b
const absMax = (a, b) => abs(a) > abs(b) ? a : b
const rand = (min, max) => Math.random() * (max - min) + min
const randBetween = (...values) => values[parseInt(Math.random() * values.length)]

// -----------------------------------------------------------------

Promise.delay = function delay(timeout, value) {
	return new Promise(resolve => setTimeout(_ => resolve(value), timeout))
}

// -----------------------------------------------------------------

Object.prototype.apply = function apply(init) {
	if (typeof init == "function") {
		init(this)
	} else {
		Object.assign(this, init)
	}

	return this
}

Document.prototype.parseElements = function parseElements(htmlString) {
	const div = this.createElement("div")

	div.innerHTML = htmlString

	const identifiedElements = {}

	for (const element of div.querySelectorAll("[id]")) {
		identifiedElements[element.getAttribute("id")] = element
		element.removeAttribute("id")
	}

	return [ div.children, identifiedElements ]
}

Node.prototype.appendChildren = function appendChildren(htmlCollection) {
	for (const element of htmlCollection) {
		this.appendChild(element)
	}

	return htmlCollection
}

CanvasRenderingContext2D.prototype.applyTransform = function applyTransform({ x, y, a = 0 }, rotate = true) {
	this.translate(x, y)

	rotate && this.rotate(a)
}

CanvasRenderingContext2D.prototype.resetTransform = function resetTransform() {
	this.setTransform(1, 0, 0, 1, 0, 0)
}
