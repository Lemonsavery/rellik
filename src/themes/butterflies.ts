import {Theme, srcToImg} from "./Theme";
import blue from "../../public/assets/identities/butterflies/blue.svg";
import brown from "../../public/assets/identities/butterflies/brown.svg";
import cyan from "../../public/assets/identities/butterflies/cyan.svg";
import green from "../../public/assets/identities/butterflies/green.svg";
import lightblue from "../../public/assets/identities/butterflies/lightblue.svg";
import orange from "../../public/assets/identities/butterflies/orange.svg";
import purple from "../../public/assets/identities/butterflies/purple.svg";
import red from "../../public/assets/identities/butterflies/red.svg";
import teal from "../../public/assets/identities/butterflies/teal.svg";
import yellow from "../../public/assets/identities/butterflies/yellow.svg";



const theme_BASIC: Theme = new Theme({
    id: "butterfly-theme",
    menuBackgroundColor: "repeating-linear-gradient(135deg, hsl(100deg 100% 75%), hsl(100deg 100% 50%), hsl(100deg 100% 75%) 2%)",
    identities: [
        {"butterfly-brown":     srcToImg(brown)},
        {"butterfly-red":       srcToImg(red)},
        {"butterfly-orange":    srcToImg(orange)},
        {"butterfly-yellow":    srcToImg(yellow)},
        {"butterfly-green":     srcToImg(green)},
        {"butterfly-teal":      srcToImg(teal)},
        {"butterfly-cyan":      srcToImg(cyan)},
        {"butterfly-lightblue": srcToImg(lightblue)},
        {"butterfly-blue":      srcToImg(blue)},
        {"butterfly-purple":    srcToImg(purple)},
    ],
});



export default theme_BASIC;