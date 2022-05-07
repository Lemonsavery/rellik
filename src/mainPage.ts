import styles from "./mainPage.module.css";
import musicVolumeSlider from "./music";
import quickPlayModal from "./modals/quickPlayModal";
import campaignModal from "./modals/campaignModal";
import customPlayModal from "./modals/customPlayModal";
import gameThemesModal from "./modals/gameThemesModal";
import settingsModal from "./modals/settingsModal";
import { wrapInDiv } from "./helpful"; // TODO: Maybe define that especially for this file, not as a global helper.



const mainPageTitle: HTMLElement = (() => {
    let element: HTMLElement = document.createElement("div");
    Object.assign(element.style, {"font-size": "35vmin", "text-align": "center"});
    element.innerHTML = `<span style="
        background-image: url(https://giffiles.alphacoders.com/375/37530.gif);
        background-size: cover;
        background-position: bottom;
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;

        padding-left: 6vmin;
    ">Re<span style="letter-spacing: 2.6vmin;">lliK</span>
    </span>`;
    return element;
})();



let quickPlayButton: HTMLButtonElement = (() => {
    let button: HTMLButtonElement = document.createElement("button");
    button.innerText = "Quick Play";
    button.className = styles.button;
    button.onclick = () => quickPlayModal.open();
    return button;
})();


let campaignButton: HTMLButtonElement = (() => {
    let button: HTMLButtonElement = document.createElement("button");
    button.innerText = "Campaign";
    button.className = styles.button;
    button.onclick = () => campaignModal.open();
    return button;
})();


let customPlayButton: HTMLButtonElement = (() => {
    let button: HTMLButtonElement = document.createElement("button");
    button.innerText = "Custom Play";
    button.className = styles.button;
    button.onclick = () => customPlayModal.open();
    return button;
})();


let gameThemesButton: HTMLButtonElement = (() => {
    let button: HTMLButtonElement = document.createElement("button");
    button.innerText = "Game Themes";
    button.className = styles.button;
    button.onclick = () => gameThemesModal.open();
    return button;
})();


let gearButton: HTMLButtonElement = (() => {
    let button: HTMLButtonElement = document.createElement("button");
    Object.assign(button.style, {
        "background-image": "url(https://icon-library.com/images/gear-icon-svg/gear-icon-svg-17.jpg)",
        "background-size": "contain",
        "background-repeat": "no-repeat",
        "background-position": "center",
        "height": "8vmin",
        "border": "none",
        "position": "absolute",
    });
    button.className = `${styles.gearButton} ${styles.button}`;
    button.onclick = () => settingsModal.open();
    return button;
})();



let mainPage: HTMLElement = (() => {
    let element: HTMLElement = document.createElement("div");
    Object.assign(element.style, {"text-align": "center"});

    element.append(mainPageTitle);
    element.append(wrapInDiv(quickPlayButton));
    element.append(wrapInDiv(campaignButton));
    element.append(wrapInDiv(customPlayButton));
    element.append(wrapInDiv(gameThemesButton));
    
    let gearAndVolume: HTMLElement = document.createElement("div");
    Object.assign(gearAndVolume.style, {"display": "inline-flex", "font-size": "3vmin"}); // TODO: Needs tweaking to get it in the right spot, cause Range doesnt style easilly and stays a constant size :(
    let gearDiv: HTMLElement = wrapInDiv(gearButton); // Necessary wrapper to stop flickering page scroll bar when spinning.
    Object.assign(gearDiv.style, {"height": "8vmin"});
    gearAndVolume.append(gearDiv);
    Object.assign(musicVolumeSlider.style, {"place-self": "center", "margin-left": "10vmin"});
    gearAndVolume.append(musicVolumeSlider);
    element.append(gearAndVolume);
    return element;
})();



export default mainPage;