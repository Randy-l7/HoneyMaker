"use strict";

import { Game } from './game.js';
import { ErrorManager, notEnoughError } from './errorManager.js';


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
            this.buttonUpgrade.textContent = `Upgrade \n(${Math.floor(this.baseCost * Math.pow(1.5, this.level)).toLocaleString("en-us")})`
            this.buttonUnlock.classList.add('locked');
            Game.computeTotalSpeed();
        }
    }

    onClickCounter() {
        if (Game.total < this.baseCost && !this.isActive) {
            ErrorManager.errorMessageDisplay("Not enough honey!");
        } else if (Game.total >= this.baseCost && !this.isActive) {
            if (!Game.startTimer) {
                Game.startTimer = Date.now();
            }
            Game.total -= this.baseCost;
            this.isActive = true;
            this.currentSpeed += this.upgradeFactor;
            
           
            Game.refresh();
        }
    }

    onClickCounterUpgrade() {
        if (!this.isActive) {
            ErrorManager.errorMessageDisplay(`Upgrade "${this.name}" is not yet unlocked!`);
            return;
        }

        const cost = this.baseCost * Math.pow(1.5, this.level);
        if (Game.total < cost) {
            ErrorManager.errorMessageDisplay("Not enough honey!");
        } else {
            this.level++;
            this.currentSpeed += this.upgradeFactor;
            Game.total -= cost;
            Game.refresh();

        }
    }
}