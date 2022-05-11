const MUSIC_VOLUME_STORAGE_KEY: string = "music volume";



let music: HTMLAudioElement = (() => {
    let element: HTMLAudioElement = document.createElement("audio");
    element.volume = 0;
    element.src = "https://www.coolmathgames.com/sites/default/files/public_games/24804/media/audio/bgm.ogg"; // Taken from https://www.coolmathgames.com/0-puzzle-ball
    element.loop = true;
    return element;
})();
const playMusic = () => {
    if (music.volume) music.play();
};
window.addEventListener("blur", () => music.pause());
window.addEventListener("focus", () => playMusic());
window.addEventListener("click", () => playMusic());


let musicVolumeInput: HTMLInputElement = (() => {
    let input: HTMLInputElement = document.createElement("input");
    input.type = "range";
    input.value = String(Number(localStorage.getItem(MUSIC_VOLUME_STORAGE_KEY)) * 100);

    input.oninput = () => music.volume = Number(input.value) / 100;
    input.onchange = () => {
        localStorage.setItem(MUSIC_VOLUME_STORAGE_KEY, music.volume.toString());
        playMusic();
    };
    input.oninput(new Event(""));
    return input;
})();


let musicVolumeSlider: HTMLElement = (() => {
    // Add icons to left and right of slider input, and style it.
    const iconStyling = {
        "display": "inline-block",
        "height": "3vmin",
        "aspect-ratio": "1",
        "background-size": "contain",
    };
    let element: HTMLElement = document.createElement("div");
    element.append((() => { // Left audio icon
        let icon: HTMLElement = document.createElement("span");
        Object.assign(icon.style, iconStyling, {
            "background-image": "url(https://img.icons8.com/material-sharp/452/no-audio.png)",
        });
        return icon;
    })());
    Object.assign(musicVolumeInput.style, {"margin-inline": "0.5em", "accent-color": "black"});
    element.append(musicVolumeInput);
    element.append((() => { // Right audio icon
        let icon: HTMLElement = document.createElement("span");
        Object.assign(icon.style, iconStyling, {
            "background-image": "url(https://img.icons8.com/material/452/speaker--v1.png)",
        });
        return icon;
    })());
    return element;
})();


// TODO: Later, a system needs to be put into place to sync different volume sliders. make a slider creator, and have the change listener update all sliders in some list.
export default musicVolumeSlider;
export { music };