import type Theme from "./Theme";
import theme_BASIC from "./basic";



export const Themes: {[themeName: string]: Theme} = {
    [theme_BASIC.id]: theme_BASIC,
};
export let menuThemeOrder = [
    theme_BASIC.id,
];
export default Themes;