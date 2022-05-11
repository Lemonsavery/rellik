export interface ThemeDescription {
    id: string,
    menuBackgroundColor: string,
    identities: {[identityId: string]: HTMLElement}[],
    // else
}
export class Theme {
    id: string;
    menuBackgroundColor: string;
    identityAssets: {[identityId: string]: HTMLElement};
    identityOrder: string[];
    // else

    constructor(X: ThemeDescription) {
        this.id = X.id;
        this.menuBackgroundColor = X.menuBackgroundColor;
        this.identityAssets = {};
        this.identityOrder = [];
        X.identities.forEach(identity => {
            Object.assign(this.identityAssets, identity);
            this.identityOrder.push(Object.keys(identity)[0]);
        });
        // else
    }
}

export function srcToImg(src: string) {
    let div: HTMLElement = document.createElement("div");
    div.className = "identityImg";
    div.style.backgroundImage = `url(${src})`;
    return div;
}



export default Theme;