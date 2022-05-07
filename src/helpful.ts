export function wrapInDiv(element: Element) {
    let div: HTMLElement = document.createElement("div");
    div.append(element);
    return div;
}

var nextUniqueId: number = 0;
export function newUniqueId() { return (++nextUniqueId).toString(); }