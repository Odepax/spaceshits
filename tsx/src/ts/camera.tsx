import { Link, Routine, Universe } from "./engine"

class Transform {
	constructor(
		public x: number = 0,
		public y: number = 0,
		public a: number = 0
	) {}
}

class Camera {
	constructor(
		public outputCanvas: HTMLCanvasElement,
		public targetPosition: Transform,
		public speed: number,
		public zoom: number = 1
	) {}
}

class KeyboardControl {
	constructor(
		public speed: number,
		public up: string = "KeyW",
		public left: string = "KeyA",
		public down: string = "KeyS",
		public right: string = "KeyD"
	) {}
}

class Shape {
	constructor(
		public color: string,
		public radius: number = 20
	) {}
}

class KeyboardControlRoutine extends Routine {
	playerPosition: Transform
	playerControl: KeyboardControl

	private pressedKeys = new Set<string>()

	onAdd(link: Link) {
		if (link.hasAll(Transform, KeyboardControl)) {
			link.pick({ playerPosition: Transform, playerControl: KeyboardControl }, this)

			document.addEventListener("keydown", ({ code }) => this.pressedKeys.add(code))
			document.addEventListener("keyup", ({ code }) => this.pressedKeys.delete(code))
		}
	}

	onStep() {
		const vpf = this.playerControl.speed * this.universe.clock.spf

		if (this.pressedKeys.has(this.playerControl.up)) this.playerPosition.y -= vpf
		if (this.pressedKeys.has(this.playerControl.left)) this.playerPosition.x -= vpf
		if (this.pressedKeys.has(this.playerControl.down)) this.playerPosition.y += vpf
		if (this.pressedKeys.has(this.playerControl.right)) this.playerPosition.x += vpf
	}
}

function absMin(a, b) {
	return Math.abs(a) < Math.abs(b)
		? a
		: b
}

class CameraRoutine extends Routine {
	cameraPosition: Transform
	camera: Camera

	private objects: [ Transform, Shape ][] = []

	onAdd(link: Link) {
		if (link.hasAll(Transform, Camera)) {
			link.pick({ cameraPosition: Transform, camera: Camera }, this)

			document.addEventListener("wheel", ({ deltaY }) => {
				if (deltaY < 0) // Zoom in.
					this.camera.zoom *= -deltaY / 97

				else // Zoom out.
					this.camera.zoom /= deltaY / 97

				console.log(this.camera.zoom)
			})
		}

		else if (link.hasAll(Transform, Shape))
			this.objects.push(link.getAll(Transform, Shape))
	}

	onStep() {
		const g = this.camera.outputCanvas.getContext("2d")
		const vpf = this.camera.speed * this.universe.clock.spf
		const zoom = this.camera.zoom

		const dx = this.camera.targetPosition.x - this.cameraPosition.x
		const dy = this.camera.targetPosition.y - this.cameraPosition.y

		this.cameraPosition.x += absMin(Math.sign(dx) * vpf, dx)
		this.cameraPosition.y += absMin(Math.sign(dy) * vpf, dy)

		const cx = this.cameraPosition.x - this.camera.outputCanvas.width / zoom / 2
		const cy = this.cameraPosition.y - this.camera.outputCanvas.height / zoom / 2

		g.clearRect(0, 0, this.camera.outputCanvas.width, this.camera.outputCanvas.height)

		for (const [ { x, y }, { radius, color } ] of this.objects) {
			g.fillStyle = color

			g.beginPath()
			g.arc((x - cx) * zoom, (y - cy) * zoom, radius * zoom, 0, 2 * Math.PI)
			g.fill()
		}
	}
}

const canvas: HTMLCanvasElement = <canvas width={ 500 } height={ 500 }></canvas>
const playerPosition = new Transform()

const camera = Link.new() ; {
	camera.add(new Transform(playerPosition.x, playerPosition.y))
	camera.add(new Camera(canvas, playerPosition, 300))
}

const universe = new Universe() ; {
	universe.register(new KeyboardControlRoutine())
	universe.register(new CameraRoutine())

	universe.add(camera)
	universe.start()
}

const player = Link.new() ; {
	player.add(playerPosition)
	player.add(new KeyboardControl(450))
	player.add(new Shape("deepskyblue"))
}

universe.add(player)

const N = 50
for (let i = 0; i < N; ++i) {
	const object = Link.new() ; {
		object.add(new Transform(Math.random() * 1000 - 500, Math.random() * 1000 - 500))
		object.add(new Shape("orange"))
	}

	universe.add(object)
}

document.body.appendChild(canvas)
