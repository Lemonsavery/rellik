import type Theme from "./Theme";
import theme_BASIC from "./basic";
import theme_BUTTERFLY from "./butterflies";



export const Themes: {[themeName: string]: Theme} = {
    [theme_BASIC.id]: theme_BASIC,
    [theme_BUTTERFLY.id]: theme_BUTTERFLY,
};
export let menuThemeOrder = [
    theme_BASIC.id,
    theme_BUTTERFLY.id,
];
export default Themes;