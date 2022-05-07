import modalMenu from "../modalMenus";
import styles from "./customPlayModal.module.css";
import mainPageStyles from "../mainPage.module.css";
import { newUniqueId } from "../helpful";
import itemsModal from "./itemsModal";



const NUM_THEME_IDENTITIES: number = 10;
const MAX_SUPPORTED_SIZE: number = 10;


function rangeInputTickmarks(rangeInput: HTMLInputElement) {
    if (!rangeInput.min || !rangeInput.max) { return "" }; // Only add tickmarks if it has both min and max.
    const TICKMARKS_ID: string = `tickmarks${newUniqueId()}`;
    rangeInput.setAttribute("list", TICKMARKS_ID);
    let tickmarks: HTMLElement = document.createElement("datalist");
    tickmarks.id = TICKMARKS_ID;
    for (let i: number = Number(rangeInput.min); i <= Number(rangeInput.max); i++) {
        let option: HTMLOptionElement = document.createElement("option");
        option.value = String(i);
        tickmarks.append(option);
    }
    return tickmarks;
}


interface SavedRecipe {
    lengthSize: number,
    floating: boolean,
    minIdentities: number,
    maxIdentities: number,
}
class RecipeOptions {
    element: HTMLElement;
    inputs: {[key: string]: HTMLInputElement};
    onUpdate: Function;

    static byId: {[recipeId: string]: RecipeOptions} = {};
    static idOrder: string[] = [];
    static USER_RECIPES_STORAGE_KEY: string = "user recipes";
    static getSavedRecipes() {
        return JSON.parse(localStorage.getItem(this.USER_RECIPES_STORAGE_KEY) ?? "[]")
        .map((recipeData: any) => RecipeOptions.new({
            lengthSize: Number(recipeData.lengthSize),
            floating: recipeData.floating,
            minIdentities: Number(recipeData.minIdentities),
            maxIdentities: Number(recipeData.maxIdentities),
        }));
    }
    static saveRecipes() {
        localStorage.setItem(RecipeOptions.USER_RECIPES_STORAGE_KEY, JSON.stringify(
            RecipeOptions.idOrder.map(recipeId => {
                let inputs: {[key: string]: HTMLInputElement} = RecipeOptions.byId[recipeId].inputs;
                return {
                    lengthSize: inputs.lengthInput.value,
                    floating: inputs.floatingInput.checked,
                    minIdentities: inputs.minIdentitiesInput.value,
                    maxIdentities: inputs.maxIdentitiesInput.value,
                };
        })));
    }

    static new(savedRecipe?: SavedRecipe) {
        if (RecipeOptions.idOrder.length >= 100) return; /* Limit to 100 recipes. 
        There is an insignificant memory leak when spamming instances, even with limiter. */
        return new RecipeOptions(savedRecipe);
    }

    constructor(savedRecipe?: SavedRecipe) {
        const recipeId: string = newUniqueId();

        let lengthInput: HTMLInputElement = (() => {
            let input: HTMLInputElement = document.createElement("input");
            Object.assign(input, {
                type: "range",
                step: 1,
                min: 1,
                max: MAX_SUPPORTED_SIZE,
                value: savedRecipe?.lengthSize ?? 999,
            });
            Object.assign(input.style, {"margin-right": "1em"});

            input.onchange = () => this.onUpdate();
            return input;
        })();
        let floatingInput: HTMLInputElement = (() => {
            let input: HTMLInputElement = document.createElement("input");
            input.type = "checkbox";
            input.checked = savedRecipe?.floating ?? false;
            Object.assign(input.style, {"margin-left": "0.5em"});

            input.onchange = () => this.onUpdate();
            return input;
        })();
        let lengthAndFloatingOptions: HTMLElement = (() => {
            let element: HTMLElement = document.createElement("div");

            Object.assign(element.style, {
                "background-image": "url(https://image.spreadshirtmedia.net/image-server/v1/designs/154767851.png)",
                "background-size": "20%",
                "background-repeat": "no-repeat",
                "background-position": "100% 0%", // TODO: This . -20% for gear svg
                "margin-bottom": "-2.5em",
                "padding-bottom": "2.5em",
            });
        
            let lengthNumber: HTMLElement = document.createElement("span");
            Object.assign(lengthNumber.style, {"display": "inline-block", "width": "1em"});
            lengthInput.addEventListener("input", () => lengthNumber.innerHTML = `${lengthInput.value} `);
            lengthInput.dispatchEvent(new Event("input"));

            element.append("Size: ");
            element.append(lengthNumber);
            element.append(lengthInput);
            element.append(rangeInputTickmarks(lengthInput));

            element.append((() => { // Bundled together so they can wrap as one unit.
                let span: HTMLElement = document.createElement("span");
                Object.assign(span.style, {"white-space": "nowrap"});
                span.append("Floating?");
                span.append(floatingInput);
                return span;
            })());

            return element;
        })();


        let minIdentitiesInput: HTMLInputElement = (() => {
            let input: HTMLInputElement = document.createElement("input");
            Object.assign(input, {
                type: "range",
                step: 1,
                min: 1,
                max: NUM_THEME_IDENTITIES,
                value: savedRecipe?.minIdentities ?? 1,
            });

            input.onchange = () => this.onUpdate();
            return input;
        })();
        let maxIdentitiesInput: HTMLInputElement = (() => {
            let input: HTMLInputElement = document.createElement("input");
            Object.assign(input, {
                type: "range",
                step: 1,
                min: 1,
                max: NUM_THEME_IDENTITIES,
                value: savedRecipe?.maxIdentities ?? NUM_THEME_IDENTITIES,
            });

            input.onchange = () => this.onUpdate();
            return input;
        })();
        let identitiesOptions: HTMLElement = (() => {
            let element: HTMLElement = document.createElement("div");
            Object.assign(element.style, {"display": "inline-flex"});

            element.append((() => {
                let label: HTMLElement = document.createElement("div");
                Object.assign(label.style, {"margin-right": "0.5em"});
                label.innerText = "Identities:\n";

                let minNumber: HTMLElement = document.createElement("span");
                let maxNumber: HTMLElement = document.createElement("span");
                minIdentitiesInput.addEventListener("input", () => minNumber.innerHTML = minIdentitiesInput.value);
                maxIdentitiesInput.addEventListener("input", () => maxNumber.innerHTML = maxIdentitiesInput.value);
                minIdentitiesInput.dispatchEvent(new Event("input"));
                maxIdentitiesInput.dispatchEvent(new Event("input"));
                label.append(minNumber);
                label.append(" - ");
                label.append(maxNumber);

                return label;
            })());
            element.append((() => {
                let both: HTMLElement = document.createElement("div");
                const minMaxStyle = {"width": "2em", "display": "inline-block", "vertical-align": "top"};
                both.append((() => {
                    let div: HTMLElement = document.createElement("div");
                    div.append((() => {
                        let span: HTMLElement = document.createElement("span");
                        Object.assign(span.style, minMaxStyle);
                        span.innerText = "Min";
                        return span;
                    })());
                    div.append(minIdentitiesInput);
                    div.append(rangeInputTickmarks(minIdentitiesInput));
                    return div;
                })());
                both.append((() => {
                    let div: HTMLElement = document.createElement("div");
                    div.append((() => {
                        let span: HTMLElement = document.createElement("span");
                        Object.assign(span.style, minMaxStyle);
                        span.innerText = "Max";
                        return span;
                    })());
                    div.append(maxIdentitiesInput);
                    div.append(rangeInputTickmarks(maxIdentitiesInput));
                    return div;
                })());
                return both;
            })());

            return element;
        })();


        /* // shelved ui
        let identityWeightInputs: {} = {};
        let weightsOption: HTMLElement = (() => {
            let element: HTMLElement = document.createElement("div");
            Object.assign(element.style, {"height": "4em"});

            exampleDigitIdentities.forEach(identity => {
                let input: HTMLInputElement = document.createElement("input");
                input.type = "range";
                Object.assign(input.style, {
                    "transform-origin": "bottom",
                    "transform": "rotate(-90deg)",
                    "width": "18%",
                    // "width": "5em",
                    // "display": "inline-block",
                    // "text-align": "justify",
                    "height": "2em",
                    "margin-right": "-3em",
                    "margin-top": "1.5em",
                });

                identityWeightInputs[identity] = input;
            });

            return element;
        })();
        */


        let recipeOptions: HTMLElement = (() => {
            let element: HTMLElement = document.createElement("div");
            element.className = styles.recipeOptions;
            element.append(lengthAndFloatingOptions);
            element.append(identitiesOptions);
            return element;
        })();



        let copyButton: HTMLButtonElement = (() => {
            let button: HTMLButtonElement = document.createElement("button");
            Object.assign(button.style, {
                "height": "50%",
                "background-color": "hsl(211deg 81% 56%)",
                "border-radius": "2em 0 0 0",
                "background-image": "url(https://pic.onlinewebfonts.com/svg/img_324351.svg)",
                "background-repeat": "no-repeat",
                "background-size": "2.5em",
                "background-position": "center",
            });

            button.onclick = () => {
                this.element.after((RecipeOptions.new({
                    lengthSize: Number(lengthInput.value),
                    floating: floatingInput.checked,
                    minIdentities: Number(minIdentitiesInput.value),
                    maxIdentities: Number(maxIdentitiesInput.value),
                }))?.element ?? "");
                RecipeOptions.saveRecipes();
            };
            return button;
        })();
        let deleteButton: HTMLButtonElement = (() => {
            let button: HTMLButtonElement = document.createElement("button");
            Object.assign(button.style, {
                "height": "50%",
                "background-color": "hsl(0deg 72% 52%)",
                "border-radius": "0 0 0 2em",
                "background-image": "url(https://www.svgrepo.com/show/21045/delete-button.svg)",
                "background-repeat": "no-repeat",
                "background-size": "2.5em",
                "background-position": "center",
            });

            button.onclick = () => {
                delete RecipeOptions.byId[recipeId];
                RecipeOptions.idOrder = RecipeOptions.idOrder.filter(x => x !== recipeId);
                this.element.remove();
                RecipeOptions.saveRecipes();
            };
            return button;
        })();
        let hiddenButtons: HTMLElement = (() => {
            let element: HTMLElement = document.createElement("div");
            Object.assign(element.style, {
                "margin-right": "-9999px",
                "width": "min-content",
                "font-size": 0,
            });
            const hiddenButtonWidth = {"width": "5em"};
            Object.assign(copyButton.style, hiddenButtonWidth);
            Object.assign(deleteButton.style, hiddenButtonWidth);
            element.append(copyButton);
            element.append(document.createElement("br")); // Necessary to stack the buttons in Firefox.
            element.append(deleteButton);
            return element;
        })();



        let recipeDiv: HTMLElement = (() => { /*
            Necessary for the horizontal scrolling that hides the hiddenButtons. */
            let element: HTMLElement = document.createElement("div");
            element.className = styles.recipeDiv;
            return element;
        })();
        recipeDiv.append(recipeOptions);
        recipeDiv.append(hiddenButtons);



        this.element = recipeDiv;
        
        this.inputs = {
            lengthInput,
            floatingInput,
            minIdentitiesInput,
            maxIdentitiesInput,
        };

        this.onUpdate = (save: boolean = true) => {
            if (Number(sizeInput.value) <= Number(lengthInput.min)) {
                /* The lengthInput will become invisible, and the rest 
                of the recipe UI will bug out if lengthInput is shown 
                in this situation, so don't show it. */
                lengthInput.style.visibility = "hidden";
                lengthInput.max = lengthInput.min;
            } else {
                lengthInput.max = sizeInput.value;
                lengthInput.style.visibility = "visible";
            } // Enforce max length <= game's length.

            if (lengthInput.value === lengthInput.max) {
                floatingInput.checked = false;
                floatingInput.disabled = true;
            } else {
                floatingInput.disabled = false;
            } // Prohibit floating at max length.

            if (Number(maxIdentitiesInput.value) < Number(minIdentitiesInput.value)) {
                let temp: string = maxIdentitiesInput.value;
                maxIdentitiesInput.value = minIdentitiesInput.value;
                minIdentitiesInput.value = temp;
            } // Enforce min < max.


            lengthInput.dispatchEvent(new Event("input"));
            minIdentitiesInput.dispatchEvent(new Event("input"));
            maxIdentitiesInput.dispatchEvent(new Event("input"));

            if (save) RecipeOptions.saveRecipes();
        };
        this.onUpdate(false);



        RecipeOptions.byId[recipeId] = this;
        RecipeOptions.idOrder.push(recipeId);
    }


    static onUpdateAll() {
        RecipeOptions.idOrder.forEach(recipeId => {
            RecipeOptions.byId[recipeId].onUpdate(false);
        });
        RecipeOptions.saveRecipes();
    }
}


let sizeInput: HTMLInputElement = (() => {
    const SIZE_CHOICE_STORAGE_KEY: string = "solution size choice";
    let input: HTMLInputElement = document.createElement("input");
    Object.assign(input, {
        type: "range",
        step: 1,
        value: Number(localStorage.getItem(SIZE_CHOICE_STORAGE_KEY) ?? 4),
        min: 1,
        max: MAX_SUPPORTED_SIZE,
    });
    Object.assign(input.style, {"accent-color": "darkorange"});

    input.addEventListener("change", () => {
        localStorage.setItem(SIZE_CHOICE_STORAGE_KEY, input.value);
        RecipeOptions.onUpdateAll();
    });
    return input;
})();
let sizeOption: HTMLElement = (() => {
    let element: HTMLElement = document.createElement("div");

    let sizeNumber: HTMLElement = document.createElement("span");
    Object.assign(sizeNumber.style, {"display": "inline-block", "width": "1em"});
    sizeInput.addEventListener("input", () => sizeNumber.innerHTML = `${sizeInput.value} `);
    sizeInput.dispatchEvent(new Event("input"));

    element.append("Size: ");
    element.append(sizeNumber);
    element.append(sizeInput);
    element.append(rangeInputTickmarks(sizeInput));
    return element;
})();


let guessInput: HTMLInputElement = (() => {
    const GUESS_NUMBER_CHOICE_STORAGE_KEY: string = "guess number choice";
    let input: HTMLInputElement = document.createElement("input");
    Object.assign(input, {
        type: "number",
        value: Number(localStorage.getItem(GUESS_NUMBER_CHOICE_STORAGE_KEY) ?? 10),
        min: 1,
        max: 99,
    });
    Object.assign(input.style, {
        "width": "2.3em",
        "font-size": "inherit",
        "font-family": "inherit",
        "text-align": "right",
        "border-radius": "0.3em",
        "background-color": "hsl(0deg 0% 100% / 80%)",
        "margin-right": "1em",
    });

    input.onchange = () => {
        // Validate
        let value: number = Number(input.value.replace(/[^0-9]/g, "")) || 0;
        value = Math.max(Number(input.min), Math.min(value, Number(input.max)));
        input.value = String(value);

        localStorage.setItem(GUESS_NUMBER_CHOICE_STORAGE_KEY, input.value);
    };
    input.onchange(new Event(""));

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { input.blur() }
    }); // Hides keyboard on Enter for mobile.

    return input;
})();
let endlessInput: HTMLInputElement = (() => {
    const ENDLESS_MODE_CHOICE_STORAGE_KEY: string = "endless mode choice";
    let input: HTMLInputElement = document.createElement("input");
    input.type = "checkbox";
    input.checked = localStorage.getItem(ENDLESS_MODE_CHOICE_STORAGE_KEY) === "true" ?? false;
    input.onchange = () => {
        // Disable guess input while checked.
        guessInput.disabled = input.checked;

        localStorage.setItem(ENDLESS_MODE_CHOICE_STORAGE_KEY, input.checked.toString());
    };
    input.onchange(new Event(""));

    return input;
})();
let guessOption: HTMLElement = (() => {
    let element: HTMLElement = document.createElement("div");
    element.append("How many guesses? ");
    element.append(guessInput);
    element.append((() => { // Bundled together so they can wrap as one unit.
        let span: HTMLElement = document.createElement("span");
        Object.assign(span.style, {"white-space": "nowrap"});
        span.append(endlessInput);
        span.append(" Endless mode");
        return span;
    })());
    return element;
})();


let recipes: HTMLElement = (() => {
    let element: HTMLElement = document.createElement("div");
    Object.assign(element.style, {
        "overflow-y": "auto",
        "border": "black double 0.3em",
        "border-radius": "1em",
        "margin-top": "0.7em",
        "max-height": "calc(100vh - 12em)",
        "background-color": "darkorange",
    });

    let addButton: HTMLButtonElement = (() => {
        let button: HTMLButtonElement = document.createElement("button");
        Object.assign(button.style, {
            "width": "100%",
            "border-radius": "9999vw",
            "font-size": "inherit",
            "background-color": "hsl(120deg 40% 50%)",
        });
        button.innerText = "+";

        button.onclick = () => {
            button.before((RecipeOptions.new())?.element ?? "");
            RecipeOptions.saveRecipes();
        };
        return button;
    })();

    element.append(addButton); // Should stay at bottom of recipe list.
    RecipeOptions.getSavedRecipes().forEach((recipeElement: RecipeOptions) => addButton.before(recipeElement?.element ?? ""));

    return element;
})();


// submit button
let bottomButtons: HTMLElement = (() => {
    let element: HTMLElement = document.createElement("div");
    Object.assign(element.style, {"margin-top": "0.3em"});

    const butNotMainMenuStyle = {
        "font-size": "inherit",
        "padding": "0.2em 1em",
        "border-width": "0.1em",
        "margin": "0",
    };
    const edgeMargin: string = "clamp(0em, calc(100% - 14em), 3em)";

    let playButton: HTMLButtonElement = (() => {
        let button: HTMLButtonElement = document.createElement("button");
        button.className = mainPageStyles.button;
        Object.assign(button.style, butNotMainMenuStyle);
        Object.assign(button.style, {"margin-left": edgeMargin});
        button.innerText = "Play";
        return button;
    })();

    let itemsButton: HTMLButtonElement = (() => {
        let button: HTMLButtonElement = document.createElement("button");
        button.className = mainPageStyles.button;
        Object.assign(button.style, butNotMainMenuStyle);
        Object.assign(button.style, {"float": "right", "margin-right": edgeMargin});
        button.innerText = "Items";

        button.onclick = () => itemsModal.open();
        return button;
    })();

    element.append(playButton);
    element.append(itemsButton);

    return element;
})();


let customPlayModal = new modalMenu();
customPlayModal.inner.append(sizeOption);
customPlayModal.inner.append(guessOption);
customPlayModal.inner.append(recipes);
customPlayModal.inner.append(bottomButtons);



export default customPlayModal;