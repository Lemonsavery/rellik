import type Theme from "./Theme";
import theme_BASIC from "./basic";
import theme_BASIC_DUPE from "./basic-dupe";



export const Themes: {[themeName: string]: Theme} = {
    [theme_BASIC.id]: theme_BASIC,
    [theme_BASIC_DUPE.id]: theme_BASIC_DUPE,
};
export let menuThemeOrder = [
    theme_BASIC.id,
    theme_BASIC_DUPE.id,
];
export default Themes;