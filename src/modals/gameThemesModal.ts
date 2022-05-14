import modalMenu from "../modalMenus";
import type Theme from "../themes/Theme";
import { Themes, menuThemeOrder } from "../themes/Themes";
import {generateIdentitySelector} from "./identityChoiceModal";
import {identityChoiceButton} from "./customPlayModal";



const THEME_CHOICE_STORAGE_KEY: string = "theme choice";
export let selectedThemeId: string = localStorage.getItem(THEME_CHOICE_STORAGE_KEY) ?? Themes[menuThemeOrder[0]].id;


let themeOptions: HTMLElement = (() => {
    let element: HTMLElement = document.createElement("div");
    Object.assign(element.style, { // Mostly same as recipe customization in Custom Play modal.
        "overflow-y": "auto",
        "border": "black double 0.3em",
        "border-radius": "1em",
        "background-color": "darkorange",
        "display": "grid",
    });

    menuThemeOrder.forEach(themeName => {
        const theme: Theme = Themes[themeName];
        let option: HTMLElement = document.createElement("div");

        const specialScrolleePaddingRight = "0.15em";
        Object.assign(option.style, {
            "display": "inline-flex",
            "border-radius": "999vw",
            "padding": specialScrolleePaddingRight,
            "padding-right": "0", // Let the scrollee pad itself, so the overflow disappear is completely rounded.
            "font-size": "2em",
            "overflow": "hidden",
            "background": theme.menuBackgroundColor,
        });
        option.className = "widthFillAvailable";

        let button: HTMLInputElement = (() => {
            let button: HTMLInputElement = document.createElement("input");
            Object.assign(button, {
                type: "radio",
                name: "selectedTheme",
                checked: theme.id === selectedThemeId,
            });
            Object.assign(button.style, {
                "accent-color": "black",
                "margin": "auto",
                "margin-inline": "1em",
                "height": "2em",
                "width": "2em",
            });

            button.onchange = () => {
                selectedThemeId = theme.id;
                generateIdentitySelector();
                identityChoiceButton.dispatchEvent(new Event("identityChoicesModalUpdate"));
                localStorage.setItem(THEME_CHOICE_STORAGE_KEY, selectedThemeId);
            };
            return button;
        })();

        option.append(button);
        option.append((() => {
            let scroller: HTMLElement = document.createElement("div");
            Object.assign(scroller.style, {"overflow-x": "auto", "display": "grid"}); // grid just removes some weird lower padding style that's annoying.
            let scrollee: HTMLElement = document.createElement("div");
            Object.assign(scrollee.style, {
                "display": "inline-flex",
                "border-radius": "999vw",
                "padding-right": specialScrolleePaddingRight,
            });

            theme.identityOrder.forEach(identityId => {
                scrollee.append(theme.identityAssets[identityId].cloneNode());
            });

            scroller.append(scrollee);
            return scroller;
        })());

        element.append(option);
    });

    return element;
})();



let gameThemesModal = new modalMenu();
gameThemesModal.inner.append(themeOptions);



export default gameThemesModal;