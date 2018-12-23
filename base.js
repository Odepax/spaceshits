let _logCount = 500
function log() {
	if (--_logCount > 0) {
		console.log(...arguments)
	}
}

// -----------------------------------------------------------------

const RED = "crimson"
const ORANGE = "darkorange"
const YELLOW = "gold"
const GREEN = "greenyellow"
const TEAL = "mediumseagreen"
const BLUE = "deepskyblue"
const PURPLE = "mediumpurple"
const PINK = "hotpink"
const WHITE = "ghostwhite"
const LIGHT = "silver"
const GREY = "gray"
const DARK = "darkslategray"
const BLACK = "black"

const MILLI_SECOND = 0.001
const MILLI_SECONDS = 0.001
const SECOND = 1
const SECONDS = 1
const MINUTE = 60
const MINUTES = 60

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

// -----------------------------------------------------------------

const Hook = {
	afterClockTicks: Symbol("Hook/Universe: After a universe lives a cycle"),
	afterUniverseInstanciatesLink: Symbol("Hook/Link: After a universe instanciates an link"),
	afterLinkInstantiatesTrait: Symbol("Hook/Trait: After an link instantiates a trait"),
	beforeUniverseAddsTrait: Symbol("Hook/Trait: Before a universe adds a trait"),
	afterUniverseAddsTrait: Symbol("Hook/Trait: After a universe adds a trait"),
	afterUniverseUpdatesTrait: Symbol("Hook/Trait: After a universe updates a trait"),
	afterUniverseRemovesTrait: Symbol("Hook/Trait: After a universe removes a trait"),
}

const Poll = {
	traitHasBehavior: Symbol("Poll/Trait: Determines if a trait has update or removal hooks"),
	lastUniverseTimestamp: Symbol("Poll/Universe: Gets the last timestamp in milli-seconds")
}

class Universe {
	constructor() {
		this.links = new Set()
		this.traits = new Set()

		this.isRunning = false
		this.tickTime = 0

		this[Poll.lastUniverseTimestamp] = 0
	}

	add(linkConstructor, ...linkParameters) {
		const link = new linkConstructor(this)

		link[Hook.afterUniverseInstanciatesLink](...linkParameters)

		for (const trait of link.traits) {
			if (!this.traits.has(trait)) {
				trait[Hook.beforeUniverseAddsTrait]()

				if (trait[Poll.traitHasBehavior]) {
					this.traits.add(trait)
				}

				trait[Hook.afterUniverseAddsTrait]()
			}
		}

		this.links.add(link)

		return link
	}

	remove(link) {
		if (this.links.has(link)) {

			for (const trait of link.traits) {
				this.traits.delete(trait)
				trait[Hook.afterUniverseRemovesTrait]()
			}

			this.links.delete(link)
		}
	}

	update() {
		for (const trait of this.traits) {
			trait[Hook.afterUniverseUpdatesTrait]()
		}
	}

	run() {
		this.isRunning = true

		requestAnimationFrame(timestamp => {
			this[Poll.lastUniverseTimestamp] = timestamp

			requestAnimationFrame(timestamp => this[Hook.afterClockTicks](timestamp))
		})
	}

	freeze() {
		this.isRunning = false
	}

	[Hook.afterClockTicks](timestamp) {
		this.tickTime = (timestamp - this[Poll.lastUniverseTimestamp]) * MILLI_SECONDS
		this[Poll.lastUniverseTimestamp] = timestamp

		this.update()

		if (this.isRunning) {
			requestAnimationFrame(timestamp => this[Hook.afterClockTicks](timestamp))
		}
	}
}

class Link {
	constructor(universe) {
		this.universe = universe
		this.traits = new Set()
	}

	add(traitConstructor, ...traitParameters) {
		if (traitConstructor.prototype instanceof Trait || traitConstructor === Trait) {
			if (!this.traits.has(traitConstructor)) {
				const trait = new traitConstructor(this)
				
				trait[Hook.afterLinkInstantiatesTrait](...traitParameters)
				
				this.traits.add(trait)

				return this[traitConstructor.name] = trait
			}
		} else {
			return this[traitConstructor.name] = new traitConstructor(...traitParameters)
		}
	}

	onInitialize() {}

	[Hook.afterUniverseInstanciatesLink]() { this.onInitialize(...arguments) }
}

class Trait {
	constructor(link) {
		this.link = link
		this.universe = link.universe

		this[Poll.traitHasBehavior] = !!(this.onUpdate || this.onRemoving || this.onRemoved)
	}

	onInitialize() {}
	onAdding() {}
	onAdded() {}
	// onUpdate() {}
	// onRemoving() {}
	// onRemoved() {}

	[Hook.afterLinkInstantiatesTrait]() { this.onInitialize(...arguments) }
	[Hook.beforeUniverseAddsTrait]() { this.onAdding() }
	[Hook.afterUniverseAddsTrait]() { this.onAdded() }
	[Hook.afterUniverseRemovesTrait]() { this.onRemoved && this.onRemoved() }
	[Hook.afterUniverseUpdatesTrait]() {
		this.onUpdate && this.onUpdate()

		if (this.onRemoving && this.onRemoving()) {
			this.universe.remove(this.link)
		}
	}
}
