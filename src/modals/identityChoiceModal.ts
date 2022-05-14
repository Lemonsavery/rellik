import modalMenu from "../modalMenus";
import type Theme from "../themes/Theme";
import Themes from "../themes/Themes";
import {identityChoiceButton} from "./customPlayModal";
import {selectedThemeId} from "./gameThemesModal";
import {RecipeOptions} from "./customPlayModal"; 



const SELECTED_IDENTITIES_STORAGE_KEY: string = "selected identity indexes";
export let selectedIdentityIndexes: number[] = JSON.parse(localStorage.getItem(SELECTED_IDENTITIES_STORAGE_KEY) ?? "[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]");


let identityChoiceModal = new modalMenu();

let identitySelector: HTMLElement = document.createElement("div");
export const generateIdentitySelector = () => {
    identitySelector.remove();
    identitySelector = document.createElement("div");
    Object.assign(identitySelector.style, {"display": "grid"});

    let element1: HTMLElement = document.createElement("div");
    let element2: HTMLElement = document.createElement("div");
    Object.assign(element1.style, {"font-size": "2em", "display": "inline-flex"});
    Object.assign(element2.style, {"font-size": "2em", "display": "inline-flex"});
    
    let theme: Theme = Themes[selectedThemeId];
    theme.identityOrder.forEach((identityId, i) => {
        let identity: HTMLElement = theme.identityAssets[identityId].cloneNode() as HTMLElement;
        Object.assign(identity.style, {"margin": "0.03em", "cursor": "pointer"});
        const opacity: string = "opacity(0.3)";
        
        identity.style.filter = selectedIdentityIndexes.includes(i) ? "" : opacity;
        identity.addEventListener("click", () => {
            const unselect: boolean = selectedIdentityIndexes.includes(i);
            if (unselect) {
                if (selectedIdentityIndexes.length <= 2) { return } // Prohibit less than 2 identities being selected.
                selectedIdentityIndexes = selectedIdentityIndexes.filter(x=>x!==i);
            } else { selectedIdentityIndexes.push(i); }
            
            identity.style.filter = unselect ? opacity : "";
            localStorage.setItem(SELECTED_IDENTITIES_STORAGE_KEY, JSON.stringify(selectedIdentityIndexes));
            identityChoiceButton.dispatchEvent(new Event("identityChoicesModalUpdate"));
            RecipeOptions.onIdentityChoiceChange();
        });
        
        if (i < Math.ceil(theme.identityOrder.length/2)) {
            element1.append(identity);
        } else {
            element2.append(identity);
        } // Stack the identities into two rows.
    });
    
    identitySelector.append(element1);
    identitySelector.append(element2);
    identityChoiceModal.inner.append(identitySelector);
};
generateIdentitySelector();



export default identityChoiceModal;