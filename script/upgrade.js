"use strict";

import { Game } from './game.js';
import { ErrorManager } from './errorManager.js';


export class Upgrade {
    constructor(upgradeFactor = 0, baseCost = 0) {
        this._currentSpeed = 0;
        this.isActive = false;
        this.upgradeFactor = upgradeFactor;
        this.baseCost = baseCost;
        this.level = 0;
        this.buttonUnlock = null;
        this.buttonUpgrade = null;
        this.name = "default upgrade";
        
    }

    get currentSpeed() {
        return this._currentSpeed;
    }

    set currentSpeed(value) {
        this._currentSpeed = value;
        this.refreshSpeed();
    }

    refreshSpeed() {
        if (this.currentSpeed) {
            this.buttonUnlock.textContent = `Current speed : ${this.currentSpeed.toLocaleString('en-US')}/s`;
            this.buttonUpgrade.textContent = `Upgrade \n(${this.baseCost * Math.pow(1.5, this.level+1)})`
        }
    }

    onClickCounter() {
        if (Game.total < 100 && !this.isActive) {
            ErrorManager.errorMessageDisplay();
        } else if (Game.total >= 100 && !this.isActive) {
            if (!Game.startTimer) {
                Game.startTimer = Date.now();
            }
            Game.total -= this.baseCost;
            this.isActive = true;
            this.currentSpeed += this.upgradeFactor;
            this.buttonUnlock.classList.add('locked');
           
            Game.refresh();
        }
    }

    onClickCounterUpgrade() {
        if (!this.isActive) {
            console.log(`Upgrade "${this.name}" n'est pas encore débloquée.`);
            return;
        }

        const cost = this.baseCost * Math.pow(1.5, this.level);
        if (Game.total < cost) {
            ErrorManager.errorMessageDisplay();
        } else {
            this.level++;
            this.currentSpeed += this.upgradeFactor;
            Game.total -= cost;
            Game.refresh();

        }
    }
}