import modalMenu from "../modalMenus";



let closeButtonSideInput: HTMLInputElement = (() => {
    const CLOSE_BUTTON_SIDE_SETTING_STORAGE_KEY: string = "close button side setting";
    let input: HTMLInputElement = document.createElement("input");
    input.type = "checkbox";
    input.checked = (localStorage.getItem(CLOSE_BUTTON_SIDE_SETTING_STORAGE_KEY) ?? "false") === "true";

    let closeButtonLeftSettingStyleElement: HTMLStyleElement = document.createElement("style");
    document.body.append(closeButtonLeftSettingStyleElement);
    const closeButtonLeftSettingStyling: string = `.closeButtonLeftSetting {
        right: revert;
        left: -4.5vmin;
    }`;
    input.addEventListener("change", () => {
        if (input.checked) {
            closeButtonLeftSettingStyleElement.innerHTML = closeButtonLeftSettingStyling;
        } else {
            closeButtonLeftSettingStyleElement.innerHTML = "";
        }
        localStorage.setItem(CLOSE_BUTTON_SIDE_SETTING_STORAGE_KEY, String(input.checked));
    });
    input.dispatchEvent(new Event("change"));

    return input;
})();
let closeButtonSide: HTMLElement = (() => {
    let element: HTMLElement = document.createElement("div");
    Object.assign(element.style, {
        "border": "double black",
        "border-left": "none",
        "border-right": "none",
        "width": "max-content",
        "padding": "0.2em",
        "max-width": "95%", // To enable text wrapping.
    });
    element.append(closeButtonSideInput);
    element.append(" Show close button on left instead");
    return element;
})();




let settingsModal = new modalMenu();
settingsModal.inner.append(closeButtonSide);
settingsModal.inner.append((() => document.createElement("br"))());
settingsModal.inner.append("⚙️\n\nThis game is under extremely early development, so many assets are placeholders.");
settingsModal.inner.append((() => document.createElement("br"))());
settingsModal.inner.append("🎨🌈🍁🍒📡🌊😈🧿️");
settingsModal.inner.append((() => document.createElement("br"))());
settingsModal.inner.append("\n\nhttps://red-pillows-doubt-66-190-62-67.loca.lt");



export default settingsModal;