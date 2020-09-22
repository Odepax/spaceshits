import { Link } from "../core/engine.js"
import { Motion } from "../physic/motion.js"
import { UserInputRegistry } from "../ux/user-input-capture.js"
import { Player } from "../lore/player.js"
import { Transform } from "../math/transform.js"
import { Force } from "../math/force.js"
import { Universe } from "../core/engine.js"
import { GameKeeper } from "../lore/game-keeper.js"

/** @implements {import("../core/engine").Routine} */
export class PlayerControlRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		this.userInput = userInput
		this.game = game
		this.universe = universe

		/** @private @type {Player} */
		this.player = null
		this.acceleration = new Transform()
		this.maxAcceleration = 1500
		this.dragFactor = 0.005
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player)
			this.player = link
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null
	}

	onStep() {
		if (!this.player)
			return

		const [ motion ] = this.player.get(Motion)

		this.acceleration.x = 0
			- this.userInput.isPressed(this.game.keyBindings.left)
			+ this.userInput.isPressed(this.game.keyBindings.right)

		this.acceleration.y = 0
			- this.userInput.isPressed(this.game.keyBindings.up)
			+ this.userInput.isPressed(this.game.keyBindings.down)

		if (this.acceleration.x || this.acceleration.y)
			this.acceleration.l = this.maxAcceleration

		const spf = Math.min(this.universe.clock.spf, 10)

		Force.apply(this.acceleration, motion.velocity, spf)
		Force.applyFriction(motion.velocity, this.dragFactor, spf)

		motion.position.a = motion.position.directionTo(this.userInput.mousePosition)
	}
}

/** @implements {import("../core/engine").Routine} */
export class PlayerAimRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game */
	constructor(userInput, game) {
		this.userInput = userInput
		this.game = game

		/** @private @type {Player} */
		this.player = null
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player)
			this.player = link
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null
	}

	onStep() {
		if (!this.player)
			return

		const [ motion ] = this.player.get(Motion)

		motion.position.a = motion.position.directionTo(this.userInput.mousePosition)
	}
}
