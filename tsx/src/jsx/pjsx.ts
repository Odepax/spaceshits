// Stolen from https://github.com/callumlocke/plain-jsx
(window as any).pjsx = function pjsx(tagName: string, attributes: { [name: string]: string }, ...children: (HTMLElement | string)[]) {
	const element = document.createElement(tagName)

	for (var name in attributes)
		element.setAttribute(name, attributes[name])

	for (const child of children)
		if (child != null)
			element.appendChild(child instanceof HTMLElement ? child : document.createTextNode(child))

	return element
}
