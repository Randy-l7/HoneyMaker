"use strict";

import { Game } from './game.js';
import { ErrorManager, notEnoughError } from './errorManager.js';


export class ClickImprovement {
    static clickIncrement = 1;
    static milestones = Array.from({ length: 100 }, (_, i) => Math.round(10 + Math.pow(20 * i, 1.8)));
    static currentUpgradePriceMilestonesIndex = 0;
    static currentMilestoneIndex = 0;
    static improveClickElement = document.getElementById('clickImprove');

    static initialize() {
        this.actualMilestone();
    }

    static actualMilestone() {
        this.improveClickElement.textContent = `Improve Click (${(this.milestones[this.currentMilestoneIndex] || 0).toLocaleString('en-US')})`;
    }

    static upgradeClick() {
        if (Game.currentTotal >= this.milestones[this.currentMilestoneIndex]) {
            this.clickIncrement = Math.pow(1.5, this.currentMilestoneIndex + 1);
            this.currentMilestoneIndex++;
            Game.currentTotal -= this.milestones[this.currentMilestoneIndex - 1];
            this.actualMilestone();
            Game.refresh();
        } else {
            ErrorManager.errorMessageDisplay("Not enough honey!");
        }
    }
}