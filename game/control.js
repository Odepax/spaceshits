import { Acceleration } from "../physic/movement.js"
import { MatchRoutine } from "../engine/routine.js"
import { InteractionCentral } from "./interaction.js"
import { ParameterCentral } from "./parameter.js"
import { angleToward } from "../math/angle.js"

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
		const directionY = 0
			- this.interactionCentral.isPressed(this.parameterCentral.moveUpKey)
			+ this.interactionCentral.isPressed(this.parameterCentral.moveDownKey)

		const directionX = 0
			- this.interactionCentral.isPressed(this.parameterCentral.moveLeftKey)
			+ this.interactionCentral.isPressed(this.parameterCentral.moveRightKey)

		const directionAngle = angleToward(0, 0, directionX, directionY)

		Acceleration.x = abs(directionX) * MouseAndKeyboardControl.maxAcceleration * cos(directionAngle)
		Acceleration.y = abs(directionY) * MouseAndKeyboardControl.maxAcceleration * sin(directionAngle)
	}
}
