import { Link } from "./engine.js"

/** @abstract @implements {import("./engine").Routine} */
export class AutoIteratingRoutine {
	constructor() {
		/** @protected @type {Set<Link>} */
		this.links = new Set()
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.links.has(link) && this.accepts(link)) {
			this.links.add(link)
			this.onAdded(link)
		}
	}

	/** @param {Link} link */
	onRemove(link) {
		if (this.links.delete(link))
			this.onRemoved(link)
	}

	onStep() {
		for (const link of this.links)
			this.onSubStep(link)
	}

	/** @protected @abstract @param {Link} link */
	onAdded(link) {}

	/** @protected @abstract @param {Link} link */
	onRemoved(link) {}

	/** @protected @abstract @param {Link} link @returns {boolean} */
	accepts(link) {
		throw this.constructor.name + "#accepts(Link) was not implemented."
	}

	/** @protected @abstract @param {Link} link */
	onSubStep(link) {
		throw this.constructor.name + "#onSubStep(Link) was not implemented."
	}
}
