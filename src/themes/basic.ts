import {Theme, srcToImg} from "./Theme";
import green from "../../public/assets/identities/basic/green.svg";
import red from "../../public/assets/identities/basic/red.svg";
import blue from "../../public/assets/identities/basic/blue.svg";
import purple from "../../public/assets/identities/basic/purple.svg";
import pink from "../../public/assets/identities/basic/pink.svg";
import cyan from "../../public/assets/identities/basic/cyan.svg";
import yellow from "../../public/assets/identities/basic/yellow.svg";
import orange from "../../public/assets/identities/basic/orange.svg";
import darkgreen from "../../public/assets/identities/basic/darkgreen.svg";
import shade from "../../public/assets/identities/basic/shade.svg";



const theme_BASIC: Theme = new Theme({
    id: "basic-theme",
    menuBackgroundColor: "repeating-linear-gradient(135deg, white, hsl(0deg 0% 90%), white 2%)",
    identities: [
        {"basic-pink":      srcToImg(pink)},
        {"basic-red":       srcToImg(red)},
        {"basic-orange":    srcToImg(orange)},
        {"basic-yellow":    srcToImg(yellow)},
        {"basic-green":     srcToImg(green)},
        {"basic-darkgreen": srcToImg(darkgreen)},
        {"basic-cyan":      srcToImg(cyan)},
        {"basic-blue":      srcToImg(blue)},
        {"basic-purple":    srcToImg(purple)},
        {"basic-shade":     srcToImg(shade)},
    ],
});



export default theme_BASIC;