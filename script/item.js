"use strict";

import { ErrorManager, notEnoughError } from "./errorManager.js";
import { Game } from "./game.js";
import { traitEffect, traitTarget, Trait } from "./trait.js";

export class Item {
    constructor(img = "", traits = [], name = "Default Name", cost = 0, milestone = 0, neededUpgrades = []) {
        this.cost = cost;
        this.img = img;
        this.name = name;
        this.traits = traits;
        this.milestone = milestone;
        this.neededUpgrades = neededUpgrades;
        this.isAvailable = false;
        this.isBuyed = false;
        this.itemDiv = null;
    }

    computeTrait(effect, target) {
        const filteredTraits = this.traits.filter((trait) => trait.effect == effect && trait.target == target);
        switch (effect) {
            case traitEffect.ADD:
                return filteredTraits.reduce((acc, trait) => acc + trait.value, 0);
            case traitEffect.MULT:
                return filteredTraits.reduce((acc, trait) => acc * trait.value, 1);
        }
    }

    onClickItem() {
        const trueNeeded = this.neededUpgrades.map((upgrade) => Game.upgradeMap.get(upgrade));
        if (!trueNeeded.every((upgrade) => upgrade.isActive)) {
            ErrorManager.errorMessageDisplay();
            ErrorManager.errorMessageDisplay(`you have not unlocked the ${this.neededUpgrades}`);
            return;
        }
        if (Game.currentTotal >= this.cost) {
            this.isBuyed = true;
            Game.currentTotal -= this.cost;
            this.itemDiv.remove();
            trueNeeded.forEach((upgrade) => upgrade.computeUpgradeItem());
        } else {
            ErrorManager.errorMessageDisplay("Not enough honey!");
        }
    }

    static highlightNumbers(text) {
        return text.replace(/(\d+)(%)?/g, '<span class="highlight-number">$&</span>');
    }
}
