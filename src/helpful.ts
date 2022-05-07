export function wrapInDiv(element: Element) {
    let div: HTMLElement = document.createElement("div");
    div.append(element);
    return div;
}
