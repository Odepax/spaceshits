import { MatchRoutine } from "./routine.js"
import { InteractionCentral } from "./central/interaction.js"
import { ParameterCentral } from "./central/parameter.js"
import { Acceleration } from "./dynamic.js"
import { direction } from "./math/angle.js"
import { Vector } from "./math/vector.js";

const { abs, cos, sin } = Math

export class MouseAndKeyboardControl {
	constructor(/** @type {number} */ maxSpeed, /** @type {number} */ maxAcceleration) {
		this.maxSpeed = maxSpeed
		this.maxAcceleration = maxAcceleration
	}
}

export class MouseAndKeyboardControlRoutine extends MatchRoutine {
	constructor(/** @type {InteractionCentral} */ interactionCentral, /** @type {ParameterCentral} */ parameterCentral) {
		super([ MouseAndKeyboardControl, Acceleration ])

		this.interactionCentral = interactionCentral
		this.parameterCentral = parameterCentral
	}

	/** @param {{ MouseAndKeyboardControl: MouseAndKeyboardControl, Acceleration: Acceleration }} */
	onSubStep({ MouseAndKeyboardControl, Acceleration }) {
		const direction = new Vector(
			  0
			- this.interactionCentral.isPressed(this.parameterCentral.moveLeftKey)
			+ this.interactionCentral.isPressed(this.parameterCentral.moveRightKey),
			  0
			- this.interactionCentral.isPressed(this.parameterCentral.moveUpKey)
			+ this.interactionCentral.isPressed(this.parameterCentral.moveDownKey)
		)

		const directionAngle = direction.d

// TODO
		Acceleration.x = abs(direction.x) * MouseAndKeyboardControl.maxAcceleration * cos(directionAngle)
		Acceleration.y = abs(direction.y) * MouseAndKeyboardControl.maxAcceleration * sin(directionAngle)
	}
}
