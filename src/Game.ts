import { newUniqueId } from "./helpful";



function toPositiveInt(num: number, min: number = 1) {
    return Math.floor(Math.max(num, min));
}

const DIGIT_IDENTITY_UNSELECTED = "⬜️"; /* The identity of digits that have no user inputted identity yet. */
const DIGIT_IDENTITY_ANY = "🔳"; /* The identity of digits in fixed solutions that don't need to be solved. */
const DIGIT_IDENTITY_DEFAULT = "no identities supplied"; /* Used only when no digit identities are supplied. */


class Digit {
    identity: string;
    isHidden: boolean;
    isFloating: boolean;
    isCurrent: boolean;

    constructor() {
        this.identity = DIGIT_IDENTITY_UNSELECTED;
        this.isHidden = false;
        this.isFloating = false;
        this.isCurrent = false;
    }
}


class Guess {
    digits: {
        [d: string]: Digit
    };
    digitOrder: string[];
    isPast: boolean;
    isCurrent: boolean;
    isFuture: boolean;
    id: string;

    constructor(guessSize: number) {
        this.digits = {};
        for (let d = 0; d < guessSize; d++) {
            this.digits[d] = new Digit;
        }
        this.digitOrder = Object.keys(this.digits);

        this.isPast = false;
        this.isCurrent = false;
        this.isFuture = false;

        this.id = newUniqueId();
    }
}

interface NewGuessParam {
    guessSize: number,
    orderIndex?: number,
    isPast?: boolean,
    isCurrent?: boolean,
    isFuture?: boolean,
}

class Guesses {
    order: string[];
    g: {
        [guessId: string]: Guess
    };

    constructor(guessProps: {
        numStartingGuesses: number,
        guessSize: number,
    }) {
        let numStartingGuesses: number = guessProps.numStartingGuesses;
        let guessSize: number = guessProps.guessSize;
        this.order = [];
        this.g = {};
        for (let i = 0; i < numStartingGuesses; i++) {
            this.addGuess({
                guessSize: guessSize,
                isCurrent: i === 0,
                isFuture: i > 0,
            });
        }
    }

    addGuess(guessParam: NewGuessParam) {
        let guess: Guess = new Guess(guessParam.guessSize);
        let guessId: string = guess.id;
        this.g[guessId] = guess;
        // Eventually allow for digits to be passed here, to create guesses and add them wherever.

        guess.isPast = guessParam.isPast ?? guess.isPast;
        guess.isCurrent = guessParam.isCurrent ?? guess.isCurrent;
        guess.isFuture = guessParam.isFuture ?? guess.isFuture;

        let index: number = guessParam.orderIndex ?? -1;
        if (index >= 0) {
            // This needs to set past and future props correctly.
            // Allows option to place guess 
            this.order.splice(index, 0, guessId);
        } else { // Place guess at end of order.
            this.order.push(guessId);
            guess.isPast = false;
            guess.isCurrent = false;
            guess.isFuture = true;
        }

        return guess;
    }
}


interface InitSolutionParam {
    recipe: ValidRecipe,
    guessSize: number,
    digitIdentities: string[],
}
class Solution {
    digits: {[d: string]: Digit};
    digitOrder: string[];
    isFloating: boolean;
    isSolved: boolean;
    id: string;

    constructor(param: InitSolutionParam) {
        let recipe: ValidRecipe = param.recipe;
        let numDigits: number = recipe.numDigits;
        let digitIdentityWeights: number[] = recipe.digitIdentityWeights;
        let minIdentities: number = recipe.minIdentities;
        let maxIdentities: number = recipe.maxIdentities;
        const GUESS_SIZE: number = param.guessSize;
        const DIGIT_IDENTITIES: string[] = param.digitIdentities;
        this.isFloating = recipe.isFloating;
        this.id = newUniqueId();

        this.digits = {};
        const solutionSize = this.isFloating ? numDigits : GUESS_SIZE;
        for (let d = 0; d < solutionSize; d++) {
            this.digits[d] = new Digit;
        }
        this.digitOrder = Object.keys(this.digits);
        
        let validRandomizedIdentities = (() => {
            let A: string[] = Array(numDigits).fill(DIGIT_IDENTITY_UNSELECTED);
            let summedWeights: number[] = [];
            let weightSum: number = 0;
            let reSumWeights: boolean = true;
            let identityIndexesIncluded: number[] = [];
            let numIdentitiesIncluded: number = 0;
            let maxLimitHit: boolean = false;

            let A_length: number = A.length;
            let digitIdentityWeights_length: number = digitIdentityWeights.length;
            for (let i = 0; i < A_length; i++) {
                if (reSumWeights) {
                    /* For weighted random selection, each index in summedWeights 
                    must hold the sum of digitIdentityWeights up through that 
                    index (unless the number at that index is zero). */
                    reSumWeights = false;
                    summedWeights = Array(digitIdentityWeights_length).fill(0);
                    weightSum = 0;
                    for (let i_w = 0; i_w < digitIdentityWeights_length; i_w++) {
                        let weight: number = digitIdentityWeights[i_w];
                        weightSum += weight;
                        summedWeights[i_w] = weight ? weightSum : weight;
                    }
                }

                // Identity is chosen by weighted random selection.
                let randomChoice: number = Math.random() * weightSum;
                for (let i_w = 0; i_w < digitIdentityWeights_length; i_w++) {
                    if (randomChoice <= summedWeights[i_w]) {
                        A[i] = DIGIT_IDENTITIES[i_w];
                        if (!identityIndexesIncluded.includes(i_w)) {
                            identityIndexesIncluded.push(i_w);
                            numIdentitiesIncluded++;
                        }
                        break;
                    }
                }

                if (numIdentitiesIncluded === maxIdentities && !maxLimitHit) {
                    /* If the number of identities added reaches maximum, future 
                    identities should be chosen from only the ones already chosen. */
                    maxLimitHit = true;
                    for (let i_w = 0; i_w < digitIdentityWeights_length; i_w++) {
                        if (!identityIndexesIncluded.includes(i_w)) {
                            digitIdentityWeights[i_w] = 0;
                            reSumWeights = true;
                        }
                    }
                }
                if (minIdentities - numIdentitiesIncluded === A_length - i - 1
                && minIdentities !== numIdentitiesIncluded
                ) {
                    /* If the number of identities still needing to be added, reaches the number of 
                    digits yet to be determined (must be more than 0), then one of every unchosen 
                    possible identity should be added, which yields all digits as determined. */
                    for (let i_w = 0; i_w < digitIdentityWeights_length; i_w++) {
                        if (identityIndexesIncluded.includes(i_w)) {
                            digitIdentityWeights[i_w] = 0;
                            reSumWeights = true;
                        }
                    }
                }
            }

            return A;
        })();

        let i = 0;
        let numANY = this.digitOrder.length - numDigits; // Number of DIGIT_IDENTITY_ANY that should be in solution.
        this.digitOrder.forEach(d => {
            let digit: Digit = this.digits[d];
            digit.isHidden = true;
            digit.isFloating = this.isFloating;
            digit.isCurrent = false;

            let identity = DIGIT_IDENTITY_ANY;
            if (numANY > 0) {
                numANY--; // Leave identity as DIGIT_IDENTITY_ANY.
            } else {
                identity = validRandomizedIdentities[i++];
            }

            digit.identity = identity;
        });

        this.digitOrder = this.digitOrder.map(x=>({x,r:Math.random()})).sort((a,b)=>a.r-b.r).map(({x})=>x); // Inefficient randomize.

        this.isSolved = false;
    }
}

interface NewSolutionParam {
    recipe: ValidRecipe,
    orderIndex: number,
    guessSize: number,
    digitIdentities: string[],
}

class Solutions {
    order: string[];
    s: {
        [solutionId: string]: Solution
    };

    constructor(solutionRecipes: {
        recipes: {[recipeId: string]: ValidRecipe},
        order: string[],
        guessSize: number,
        digitIdentities: string[],
    }) {
        let order: string[] = solutionRecipes.order;
        this.order = [];
        this.s = {};
        order.forEach(recipeId => {
            this.addSolution({
                recipe: solutionRecipes.recipes[recipeId],
                orderIndex: order.length, // Place at end of order.
                guessSize: solutionRecipes.guessSize,
                digitIdentities: solutionRecipes.digitIdentities,
            });
        });
    }

    addSolution(param: NewSolutionParam) {
        let solution: Solution = new Solution({
            recipe: param.recipe,
            guessSize: param.guessSize,
            digitIdentities: param.digitIdentities,
        });
        let solutionId: string = solution.id;
        this.order.splice(param.orderIndex, 0, solutionId);
        this.s[solutionId] = solution;
    }
}


interface NewFeedback {
    guess: Guess,
    solution: Solution,
};

class Feedback {
    guess: Guess;
    solution: Solution;
    strayOnly: boolean;
    numPerfect: number;
    numStray: number;
    isSolved: boolean;
    wasSolved: boolean;
    isHidden?: boolean;
    id: string;
    
    constructor(param: NewFeedback) {
        this.guess = param.guess;
        this.solution = param.solution;
        this.strayOnly = this.solution.isFloating;
        this.id = newUniqueId();

        this.numPerfect = 0;
        this.numStray = 0;
        this.isSolved = false;
        this.wasSolved = false;

        if (this.guess.isPast) {
            this.gradeGuess();
        }
    }

    gradeGuess() {
        if (this.solution.isSolved) {
            this.wasSolved = true;
            return;
        }

        this.isSolved = false;
        this.numPerfect = 0;
        this.numStray = 0;
        const guess: string[] = this.guess.digitOrder.map(x => this.guess.digits[x].identity);
        const solution: string[] = this.solution.digitOrder.map(x => this.solution.digits[x].identity);
        const guessLength: number = guess.length;
        
        if (this.strayOnly) {
            this.calculateNumStray(guess, solution);

            const solutionLength: number = solution.length;
            if (this.numStray === solutionLength) {
                // In this case, basically check if solution is a substring of guess.
                const m: number = guessLength - solutionLength + 1;
                for (let i = 0; i < m; i++) {
                    if (guess.slice(i, solutionLength + i).every((x,d)=>x===solution[d])) { // The second parameter of slice is not truely necessary here.
                        this.isSolved = true;
                        break;
                    }
                }
            }
        } else {
            let g: string[] = [];
            let s: string[] = [];

            for (let i = 0; i < guessLength; i++) {
                let guessDigitIdentity: string = guess[i];
                let solutionDigitIdentity: string = solution[i];
                if (guessDigitIdentity === solutionDigitIdentity) {
                    this.numPerfect++;
                } else { /* Guess digits that don't match perfectly to solution 
                    digits will be checked for being present anywhere in the set of 
                    unmatched solution digits. Solution digits of identity 
                    DIGIT_IDENTITY_ANY should not be included. */
                    g.push(guessDigitIdentity);
                    if (solutionDigitIdentity !== DIGIT_IDENTITY_ANY) {
                        s.push(solutionDigitIdentity);
                    }
                }
            }

            if (s.length === 0) {
                this.isSolved = true;
            }

            this.calculateNumStray(g, s);
        }

        if (this.isSolved) {
            this.solution.isSolved = true;
            this.solution.digitOrder.forEach(d => {
                this.solution.digits[d].isHidden = false;
            });
        }
    }
    calculateNumStray(guessDigits: string[], solutionDigits: string[]) {
        let solution: string[] = solutionDigits.slice();
        guessDigits.forEach(identity => {
            if (solution.includes(identity)) {
                this.numStray++;
                solution.splice(solution.indexOf(identity), 1); /* Don't let a solution 
                digit be matched to more than one guess digit. */
            }
        });
    }
}

interface NewGuessFeedbacksParam {
    guess: Guess,
    solutions: Solutions,
}

class Feedbacks {
    f: {
        [feedbackId: string]: Feedback
    };
    byGuess: {
        [guessId: string]: {
            [solutionId: string]: string
        }
    };
    bySolution: {
        [solutionId: string]: {
            [guessId: string]: string
        }
    };

    constructor(info: {
        guesses: Guesses,
        solutions: Solutions,
    }) {
        let guesses: Guesses = info.guesses;
        let solutions: Solutions = info.solutions;
        let solutionsOrder: string[] = solutions.order;
        this.f = {};
        this.byGuess = {};
        this.bySolution = {};

        solutionsOrder.forEach(solutionId => {
            this.bySolution[solutionId] = {};
        });

        guesses.order.forEach(guessId => {
            this.addFeedbacksToGuess({
                guess: guesses.g[guessId],
                solutions: solutions,
            });
        });
    }

    addFeedbacksToGuess(param: NewGuessFeedbacksParam) {
        let guess: Guess = param.guess;
        let guessId: string = guess.id;
        let solutions: Solutions = param.solutions;
        let bySolution: {[solutionId: string]: string} = {};

        solutions.order.forEach(solutionId => {
            let feedback: Feedback = new Feedback({
                guess: guess,
                solution: solutions.s[solutionId],
            });
            let feedbackId: string = feedback.id;
            this.f[feedbackId] = feedback;
            bySolution[solutionId] = feedbackId;
            this.bySolution[solutionId][guessId] = feedbackId;
        });

        this.byGuess[guessId] = bySolution;
    }
}


interface RawCreationParameters {
    numRemainingGuesses: number,
    numStartingGuesses?: number,
    guessSize: number,
    digitIdentities: string[],
    solutionRecipes: {
        recipes: {
            [recipeId: string]: RawRecipe
        },
        order: string[],
    },
    endlessGuessMode?: boolean,
}

interface RawRecipe {
    numDigits: number,
    isFloating?: boolean,
    digitIdentityWeights?: number[],
    numIdentities?: [number, number],
}

interface ValidCreationParameters {
    numRemainingGuesses: number,
    numStartingGuesses: number,
    guessSize: number,
    digitIdentities: string[],
    solutionRecipes: {
        recipes: {
            [recipeId: string]: ValidRecipe
        },
        order: string[],
    },
    endlessGuessMode: boolean,
}

interface ValidRecipe {
    wasInvalid?: boolean, // maybe remove the optionality?
    numDigits: number,
    isFloating: boolean,
    digitIdentityWeights: number[],
    minIdentities: number,
    maxIdentities: number,
}

interface RecipeValidationParams {
    recipe: RawRecipe,
    guessSize: number,
    digitIdentityWeightsDefault: number[],
}

function validateRecipe(param: RecipeValidationParams) {
    let isValid: boolean = true;

    let recipe: RawRecipe = param.recipe;
    const GUESS_SIZE: number = param.guessSize;
    const DIGIT_IDENTITY_WEIGHTS_DEFAULT: number[] = param.digitIdentityWeightsDefault;

    let numDigits: number = Math.max(1, Math.min(recipe.numDigits, GUESS_SIZE));
    if (numDigits !== recipe.numDigits) { isValid = false; }

    recipe.isFloating = recipe.isFloating ?? false;
    let isFloating: boolean = recipe.isFloating && !(numDigits === GUESS_SIZE);
    if (isFloating !== recipe.isFloating) { isValid = false; }

    let digitIdentityWeights: number[] = (() => {
        const defaultWeights: number[] = DIGIT_IDENTITY_WEIGHTS_DEFAULT.slice();
        if (!recipe.digitIdentityWeights) { // This case does not invalidate the recipe.
            recipe.digitIdentityWeights = defaultWeights;
            return defaultWeights.slice();
        }

        let W: number[] = recipe.digitIdentityWeights;
        if (W.length === DIGIT_IDENTITY_WEIGHTS_DEFAULT.length) {
            let sum: number = 0;
            W = W.map(x => {
                let y: number = Math.max(0, x); // Prohibit negative weights.
                if (x !== y) { isValid = false; }
                sum += y;
                return y;
            });
            if (sum > 0) { // If W contains any weights...
                return W;
            }
        }
        isValid = false;
        return defaultWeights;
    })();

    let numIdentitiesCap: number = Math.min(numDigits, digitIdentityWeights.filter(x => x > 0).length);
    recipe.numIdentities = recipe.numIdentities ?? [1, numIdentitiesCap];
    let ni: [number, number] = recipe.numIdentities;
    let minIdentities: number = Math.max(1, Math.min(ni[0], ni[1], numIdentitiesCap));
    let maxIdentities: number = Math.min(Math.max(1, ni[0], ni[1]), numIdentitiesCap);
    if (!ni.includes(minIdentities) || !ni.includes(maxIdentities)) { isValid = false; }

    return {
        wasInvalid: !isValid,
        numDigits: numDigits,
        isFloating: isFloating,
        digitIdentityWeights: digitIdentityWeights,
        minIdentities: minIdentities,
        maxIdentities: maxIdentities,
    };
}

function validateCreationParameters(param: RawCreationParameters) {
    let isValid: boolean = true;

    let numRemainingGuesses: number = toPositiveInt(param.numRemainingGuesses);
    if (numRemainingGuesses !== param.numRemainingGuesses) { isValid = false; }

    let numStartingGuesses: number = toPositiveInt(param.numStartingGuesses ?? 2); /* Default 
    to showing the current guess and the next one. */
    numStartingGuesses = Math.min(numRemainingGuesses, numStartingGuesses); // Does not invalidate.

    let guessSize: number = toPositiveInt(param.guessSize);
    if (guessSize !== param.guessSize) { isValid = false; }

    let digitIdentities: string[] = (() => {
        let digitIdentities: string[] = [];
        param.digitIdentities.forEach(x => {
            if (!digitIdentities.includes(x)) {
                digitIdentities.push(x);
            }
        }); // De-dupe

        digitIdentities = digitIdentities.filter(
            (x: string) => x !== DIGIT_IDENTITY_UNSELECTED && x !== DIGIT_IDENTITY_ANY
        );
        
        return digitIdentities.length < 1 ? [DIGIT_IDENTITY_DEFAULT] : digitIdentities;
    })();
    if (param.digitIdentities.length !== digitIdentities.length // Check for shallow inequality.
    || !param.digitIdentities.every((x,i)=>x===digitIdentities[i])) { isValid = false; }
    const DIGIT_IDENTITY_WEIGHTS_DEFAULT: number[] = Array(digitIdentities.length).fill(1);

    let endlessGuessMode: boolean = param.endlessGuessMode ?? false;
    
    let solutionRecipes: {recipes: {[recipeId: string]: ValidRecipe}, order: string[]} = {
        recipes: {},
        order: [],
    };
    param.solutionRecipes.order.forEach(recipeId => { // Ensure order has no dupes (it shouldn't).
        if (!solutionRecipes.order.includes(recipeId)) {
            solutionRecipes.order.push(recipeId);
        }
    });
    solutionRecipes.order.forEach(recipeId => {
        if (param.solutionRecipes.recipes[recipeId]) {
            solutionRecipes.recipes[recipeId] = validateRecipe({
                recipe: param.solutionRecipes.recipes[recipeId],
                guessSize: guessSize,
                digitIdentityWeightsDefault: DIGIT_IDENTITY_WEIGHTS_DEFAULT,
            });
            if (solutionRecipes.recipes[recipeId].wasInvalid) { isValid = false; }
        } else { /* Every recipeId must correspond to a recipe, however there is no 
            need to check if every recipe corresponds to an recipeId. */
            solutionRecipes.order = solutionRecipes.order.filter(x => x !== recipeId);
            isValid = false;
        }
    });
    param.solutionRecipes.order = solutionRecipes.order.slice();

    return {
        valid: { // For use as parameters for Game creation.
            numRemainingGuesses: numRemainingGuesses,
            numStartingGuesses: numStartingGuesses,
            guessSize: guessSize,
            digitIdentities: digitIdentities,
            solutionRecipes: solutionRecipes,
            endlessGuessMode: endlessGuessMode,
        },
        raw: param, // For setting the creation parameter interface back to a valid state.
        isValid: isValid,
        // changes: ,
    };
}


class Game {
    readonly GUESS_SIZE: number;
    readonly DIGIT_IDENTITIES: string[];
    guesses: Guesses;
    solutions: Solutions;
    feedbacks: Feedbacks;
    currentGuess: Guess;
    canCommitGuess: boolean;
    endlessGuessMode: boolean;
    numRemainingGuesses: number;
    isComplete: boolean;
    isWon: boolean;
    isLost: boolean;
    showHiddenDigitsInConsole: boolean; // FOR CONSOLE USE ONLY!!! very fragile and hacky

    constructor(creationParameters: ValidCreationParameters) {
        let numStartingGuesses: number = creationParameters.numStartingGuesses;
        this.numRemainingGuesses = creationParameters.numRemainingGuesses;
        this.GUESS_SIZE = creationParameters.guessSize;
        this.DIGIT_IDENTITIES = creationParameters.digitIdentities;
        Object.freeze(this.DIGIT_IDENTITIES); // If a color is to be removed from a ludo, this should maybe be changeable.
        this.endlessGuessMode = creationParameters.endlessGuessMode;
        this.isComplete = false;
        this.isWon = false;
        this.isLost = false;
        /* When created outside Game, identities should be simply pushed to it. 
        Order of pushes can be used to be precise about colors when solutions are 
        pre-defined, like for chess puzzles. */

        this.guesses = new Guesses({
            numStartingGuesses: numStartingGuesses,
            guessSize: this.GUESS_SIZE,
        });
        this.currentGuess = this.guesses.g[this.guesses.order[0]]; // Just the initial assignment.
        for (let guessId of this.guesses.order) {
            let guess: Guess = this.guesses.g[guessId];
            if (guess.isCurrent) {
                this.currentGuess = guess; // Actual assignment.
                break;
            }
        }
        this.currentGuess.isCurrent = true;
        this.currentGuess.isFuture = false;
    
        this.solutions = new Solutions({
            recipes: creationParameters.solutionRecipes.recipes,
            order: creationParameters.solutionRecipes.order,
            guessSize: this.GUESS_SIZE,
            digitIdentities: this.DIGIT_IDENTITIES,
        });

        this.feedbacks = new Feedbacks({
            guesses: this.guesses,
            solutions: this.solutions,
        });

        this.canCommitGuess = false;
        this.showHiddenDigitsInConsole = false; // FOR CONSOLE USE ONLY!!! very fragile and hacky
    }

    makeNextGuessCurrent(addGuessToEnd: boolean = true) {
        if (addGuessToEnd) {
            this.feedbacks.addFeedbacksToGuess({
                guess: this.guesses.addGuess({guessSize: this.GUESS_SIZE}),
                solutions: this.solutions,
            });
        }

        let guessOrder: string[] = this.guesses.order;
        this.currentGuess.isCurrent = false;
        this.currentGuess.isPast = true;
        this.currentGuess = this.guesses.g[guessOrder[guessOrder.indexOf(this.currentGuess.id) + 1]];
        this.currentGuess.isFuture = false;
        this.currentGuess.isCurrent = true;
    }

    determineCanCommitGuess() {
        this.canCommitGuess = true;
        this.currentGuess.digitOrder.forEach(d => {
            if (!this.DIGIT_IDENTITIES.includes(this.currentGuess.digits[d].identity)) {
                this.canCommitGuess = false;
            }
        });
    }
    commitGuess() {
        if (this.isComplete) { return } // Game is done.
        this.determineCanCommitGuess();
        if (!this.canCommitGuess) { return }
        this.canCommitGuess = false;

        // Grade the guess, and potentially solve solutions.
        let bySolution: {[solutionId: string]: string} = this.feedbacks.byGuess[this.currentGuess.id];
        let newlySolvedSolutions: string[] = [];
        let solutionsOrder: string[] = this.solutions.order;
        let gamePotentiallyWon: boolean = true;
        solutionsOrder.forEach(solutionId => {
            let feedback: Feedback = this.feedbacks.f[bySolution[solutionId]];
            feedback.gradeGuess();

            if (feedback.isSolved) {
                newlySolvedSolutions.push(solutionId);
            }

            gamePotentiallyWon = gamePotentiallyWon && (feedback.isSolved || feedback.wasSolved);
        });
        
        // Move newly solved solution to bottom of unsolved solutions, but above other solved ones.
        newlySolvedSolutions.forEach(solutionId => {
            solutionsOrder.splice(solutionsOrder.indexOf(solutionId), 1);
        });
        const solutionsOrderLength: number = solutionsOrder.length;
        let firstIndexOfSolved: number = solutionsOrderLength;
        for (let i = 0; i < solutionsOrderLength; i++) {
            if (this.solutions.s[solutionsOrder[i]].isSolved) {
                firstIndexOfSolved = i;
                break;
            }
        }
        newlySolvedSolutions.reverse().forEach(solutionId => {
            solutionsOrder.splice(firstIndexOfSolved, 0, solutionId);
        });

        this.currentGuess.isCurrent = false;
        this.currentGuess.isPast = true;
        this.numRemainingGuesses--;
        if (gamePotentiallyWon) {
            this.gameWon();
        } else if (this.endlessGuessMode) {
            this.numRemainingGuesses++; // Keep it constant.
            this.makeNextGuessCurrent(true); // And add a guess to end.
        } else if (this.numRemainingGuesses > 0) {
            const g: {[guessId: string]: Guess} = this.guesses.g;
            let numFutureShown: number = this.guesses.order.reduce((sum,guessId)=>sum+(g[guessId].isFuture?1:0),0);
            this.makeNextGuessCurrent(this.numRemainingGuesses > numFutureShown); /* And only add 
            a guess if it wouldn't put the number of shown future guesses past numFutureShown. */
        } else {
            this.gameLost();
        }
        

        console.clear(); // FOR CONSOLE USE ONLY!!! very fragile and hacky
        this.displayGameInConsole(); // FOR CONSOLE USE ONLY!!! very fragile and hacky
    }
    go() { this.commitGuess(); } // FOR CONSOLE USE ONLY!!! very fragile and hacky

    gameWon() {
        this.isComplete = true;
        this.isWon = true;
        this.isLost = false;
    }
    gameLost() {
        this.isComplete = true;
        this.isWon = false;
        this.isLost = true;
    }

    guessIdentityAtTo(index: number, identity: string) {
        if (this.isComplete) { return } // Game is done.
        if (!(index >= 0 && index < this.currentGuess.digitOrder.length)) { return } // Invalid index.
        
        let digit: Digit = this.currentGuess.digits[index];
        if (this.DIGIT_IDENTITIES.includes(identity)) {
            digit.identity = identity;
        } else {
            digit.identity = DIGIT_IDENTITY_UNSELECTED;
        }

        this.determineCanCommitGuess();
    }
    guess(guessString: string) { // FOR CONSOLE USE ONLY!!! very fragile and hacky
        if (this.isComplete) { return } // Game is done.
        let i = 0;
        guessString.toUpperCase().split("").map(letter => {
            switch(letter) {
                case "A": return this.DIGIT_IDENTITIES[0] ?? DIGIT_IDENTITY_UNSELECTED;
                case "S": return this.DIGIT_IDENTITIES[1] ?? DIGIT_IDENTITY_UNSELECTED;
                case "D": return this.DIGIT_IDENTITIES[2] ?? DIGIT_IDENTITY_UNSELECTED;
                case "F": return this.DIGIT_IDENTITIES[3] ?? DIGIT_IDENTITY_UNSELECTED;
                case "J": return this.DIGIT_IDENTITIES[4] ?? DIGIT_IDENTITY_UNSELECTED;
                case "K": return this.DIGIT_IDENTITIES[5] ?? DIGIT_IDENTITY_UNSELECTED;
                case "L": return this.DIGIT_IDENTITIES[6] ?? DIGIT_IDENTITY_UNSELECTED;
                case ";": return this.DIGIT_IDENTITIES[7] ?? DIGIT_IDENTITY_UNSELECTED;
                default:  return DIGIT_IDENTITY_UNSELECTED;
            }
        }).forEach((identity: string) => {
            this.guessIdentityAtTo(i++, identity);
        });
        console.clear();
        this.displayGameInConsole();
    }

    displayGameInConsole() { // FOR CONSOLE USE ONLY!!! very fragile and hacky
        let tableOutput: {
            [solution: string]: {
                [guess: string]: string
            }
        } = {};
        let uniqueSolutionPrefixIndex: number = 0;
        let uniquePrefix: string[] = ["🕛","🕧","🕐","🕜","🕑","🕝","🕒","🕞","🕓","🕟","🕔","🕠","🕕","🕡","🕖","🕢","🕗","🕣","🕘","🕤","🕙","🕥","🕚","🕦"];
        let guesses: Guesses = this.guesses;
        let solutions: Solutions = this.solutions;
        solutions.order.forEach((solutionId: string) => {
            let solution: Solution = solutions.s[solutionId];
            let solutionRow: {[key: string]: string} = {};
            let uniqueGuessPrefixIndex: number = 0;
            tableOutput[uniquePrefix[uniqueSolutionPrefixIndex++]
            + solution.digitOrder.map(d => {
                let digit: Digit = solution.digits[d];
                let identity: string = digit.identity;
                return !(digit.isHidden && !this.showHiddenDigitsInConsole) || identity === DIGIT_IDENTITY_ANY
                    ? identity : DIGIT_IDENTITY_UNSELECTED;
            }).join("")] = solutionRow;

            guesses.order.forEach((guessId: string) => {
                let guess: Guess = guesses.g[guessId];
                let feedbackStr: string = (() => {
                    let feedback: Feedback = this.feedbacks.f[this.feedbacks.byGuess[guess.id][solution.id]];
                    if (feedback.wasSolved) { return "complete"; }
                    if (feedback.isSolved) { return "⭐️"; }
                    return `${"✅".repeat(feedback.numPerfect)}${"🅾️".repeat(feedback.numStray)}`;
                })();
    
                solutionRow[uniquePrefix[uniqueGuessPrefixIndex++]
                + guess.digitOrder.map(d => guess.digits[d].identity).join("")] = feedbackStr;
            });
        });
    
        // console.clear();
        // console.log(this);
        console.log(`Controls:\n  Game.togglePeek()\n  Game.guess("ASDFGHJK")\n  Game.go()`);
        console.log(this.DIGIT_IDENTITIES.join(""));
        console.log("%c A   S   D   F   J   K   L   ;", "font-family:ui-monospace;");
        console.table(tableOutput);
        console.log(`Guesses remaining: ${this.endlessGuessMode ? "∞" : this.numRemainingGuesses}`);
        console.log(this.canCommitGuess ? "Guess is ready!" : "Guess unready");
        if (this.isComplete) {
            if (this.isWon) {
                console.log(`You Won!`);
            } else if (this.isLost) {
                console.log(`You Lost...`);
            }
            console.log("Reload the page to play again.");
        }
    }

    togglePeek() { // FOR CONSOLE USE ONLY!!! very fragile and hacky
        if (this.isComplete) { return } // Game is done.
        this.showHiddenDigitsInConsole = !this.showHiddenDigitsInConsole;
        console.clear();
        this.displayGameInConsole();
    }

    static validateRecipe = validateRecipe;
    static validateCreationParameters = validateCreationParameters;
}


// add markIdentity to digits
// ludo should have an area to take notes
// what kind of changes may be made during a ludo?
// You should be able to flip the orientation of the entire GUI, for left/right handed preference.
// add an endless mode, seperate from endlessGuesses, where solved solutions get deleted and replaced with a new random solution from the recipes.

// allow for digits to be passed to addGuess.


export type {
    RawCreationParameters,
    RawRecipe,
    ValidCreationParameters,
    RecipeValidationParams,
};
export default Game;