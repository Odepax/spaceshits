/**
 * @template S The type of the child class, i.e. `class X extends PageElement<X, ...>`.
 * @template T The type of the bindable data bag, i.e. `this.$`.
 */
export abstract class PageElement<S extends PageElement<S, T>, T> extends HTMLElement {
	protected static readonly template = Symbol()

	protected static jsxTemplate(template: HTMLTemplateElement) {
		let child
		while (child = template.firstChild)
			template.content.appendChild(child)

		return template
	}

	private $callbacks = new Map<PropertyKey, Function[]>()

	protected readonly $ = new Proxy({}, {
		set: (target: T, key: PropertyKey, value: any) => {
			if (target[key] != value) {
				target[key] = value

				const callbacks = this.$callbacks.get(key)
				if (callbacks)
					for (const callback of callbacks)
						callback(value)
			}

			return true
		}
	}) as T

	protected $bind<E extends HTMLElement>(element: E, property: keyof E, binding: keyof T) {
		const callback = value => element[property] = value

		const callbacks = this.$callbacks.get(binding)
		if (callbacks) callbacks.push(callback)
		else this.$callbacks.set(binding, [ callback ])
	}

	// The A type was stolen from https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c
	protected $on<E extends HTMLElement, K extends keyof HTMLElementEventMap, A extends { [P in keyof S]: S[P] extends (event: HTMLElementEventMap[K]) => void ? P : never }[keyof S]>(element: E, event: K, action: A) {
		element.addEventListener(event, e => this[action as any](e))
	}

	constructor() {
		super()

		const template = this.constructor[PageElement.template] as HTMLTemplateElement

		this.className = template.className
		this.appendChild(document.importNode(template.content, true))

		for (const element of this.querySelectorAll("[id]") as any) {
			this[element.getAttribute("id")] = element
			element.removeAttribute("id")
		}
	}
}
