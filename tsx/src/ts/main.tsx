import { greet } from "./greet"

const greeting = greet("Mark")

document.body.appendChild(<h1>
	<mark>{ greeting }</mark>
</h1>)
