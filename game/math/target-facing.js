import { Transform } from "./transform.js"
import { Angle } from "./angle.js"

export const TargetFacing = {
	/** @param {Transform} subjectPosition @param {Transform} targetPosition */
	instant(subjectPosition, targetPosition) {
		subjectPosition.a = subjectPosition.directionTo(targetPosition)
	},

	/** @param {Transform} subjectPosition @param {Transform} subjectVelocity @param {Transform} targetPosition @param {number} steeringSpeed @param {number} spf */
	smooth(subjectPosition, subjectVelocity, targetPosition, steeringSpeed, spf) {
		const directionAngle = Angle.shortArcBetween(subjectPosition.a, subjectPosition.directionTo(targetPosition))

		if (Math.abs(directionAngle) < steeringSpeed * spf) {
			subjectVelocity.a = 0
			subjectPosition.a += directionAngle
		}

		else
			subjectVelocity.a = Math.sign(directionAngle) * steeringSpeed
	},

	/** @param {Transform} subjectPosition @param {Transform} targetPosition @param {Transform} targetVelocity @param {number} anticipationSpeed */
	anticipatedInstant(subjectPosition, targetPosition, targetVelocity, anticipationSpeed) {
		const futureTargetPosition = getFutureTargetPosition(subjectPosition, targetPosition, targetVelocity, anticipationSpeed)

		this.instant(subjectPosition, futureTargetPosition)
	},

	/** @param {Transform} subjectPosition @param {Transform} subjectVelocity @param {Transform} targetPosition @param {Transform} targetVelocity @param {number} steeringSpeed @param {number} spf @param {number} anticipationSpeed */
	anticipatedSmooth(subjectPosition, subjectVelocity, targetPosition, targetVelocity, steeringSpeed, spf, anticipationSpeed) {
		const futureTargetPosition = getFutureTargetPosition(subjectPosition, targetPosition, targetVelocity, anticipationSpeed)

		this.smooth(subjectPosition, subjectVelocity, futureTargetPosition, steeringSpeed, spf)
	}
}

/** @param {Transform} subjectPosition @param {Transform} targetPosition @param {Transform} targetVelocity @param {number} anticipationSpeed */
function getFutureTargetPosition(subjectPosition, targetPosition, targetVelocity, anticipationSpeed) {
	// Stolen from the Internets:
	// https://stackoverflow.com/a/2249237
	// https://stackoverflow.com/questions/2248876/2d-game-fire-at-a-moving-target-by-predicting-intersection-of-projectile-and-u/2249237#2249237
	const a = targetVelocity.squaredLength - anticipationSpeed * anticipationSpeed

	const b = 2 * (
		  targetVelocity.x * (targetPosition.x - subjectPosition.x)
		+ targetVelocity.y * (targetPosition.y - subjectPosition.y)
	)

	const c = subjectPosition.squaredLengthTo(targetPosition)

	const disc = b * b - 4 * a * c

	if (disc < 0)
		return;

	let anticipationTime = 0

	if (disc == 0)
		anticipationTime = -b / (2 * a)

	else {
		const t1 = (-b + Math.sqrt(disc)) / (2 * a)
		const t2 = (-b - Math.sqrt(disc)) / (2 * a)

		if (t1 < 0 && t2 < 0)
			return;

		else if (0 < t1 && 0 < t2)
			anticipationTime = Math.min(t1, t2)

		else
			anticipationTime = Math.max(t1, t2)
	}

	return targetPosition
		.copy
		.offsetBy({
			x: targetVelocity.x * anticipationTime,
			y: targetVelocity.y * anticipationTime
		})
}
