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



const theme_BASIC_DUPE: Theme = new Theme({
    id: "basicDupe-theme",
    menuBackgroundColor: "repeating-linear-gradient(135deg, gray, hsl(0deg 0% 30%), gray 2%)",
    identities: [
        {"basic-blue":      srcToImg(blue)},
        {"basic-cyan":      srcToImg(cyan)},
        {"basic-darkgreen": srcToImg(darkgreen)},
        {"basic-green":     srcToImg(green)},
        {"basic-orange":    srcToImg(orange)},
        {"basic-pink":      srcToImg(pink)},
        {"basic-purple":    srcToImg(purple)},
        {"basic-red":       srcToImg(red)},
        {"basic-shade":     srcToImg(shade)},
        {"basic-yellow":    srcToImg(yellow)},
    ],
});



export default theme_BASIC_DUPE;