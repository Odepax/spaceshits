﻿import { Transform } from "../physic/mecanic.js"

export class TargetSeeking {
	constructor(/** @type {{ Transform: Transform }} */ target) {
		this.target = target
	}
}

export class MouseAndKeyboardControl {
	constructor(/** @type {whatever} */ input) {
		this.input = input
	}
}