"use strict";

import { Upgrade } from './upgrade.js';
import { ClickImprovement } from './clickImprovement.js';
import { ErrorManager, notEnoughError } from './errorManager.js';

export class Game {
    static deleteStoredDataButton = document.getElementById('deleteButton');
    static addButtonElement = document.getElementById('counterAdd');
    static currentTotal = 0;
    static totalEarned = 0;
    static counterTotalSpeed = document.getElementById('totalSpeed');
    static spaceCanvas = document.getElementById('newElementsContainer');
    static autoInterval = null;
    static Doigby = new Audio('audio/doigby.mp3');
    static counterDisplayElement = document.getElementById('counterDisplay');
    static idleFarmerElements = document.querySelectorAll(".idleFarmer");
    static upgradePriceMilestones = Array.from({ length: 1000 }, (_, i) => Math.round(200 + 100 * i));
    static currentMapUpgradePriceIndex = 0;
    static fallingPot = [];
    static startTimer = 0.0;
    static isSavingDisabled = false;
    static upgradeMap = new Map([
        ["Honey-Maker", new Upgrade(1, 200, 1)],
        ["Honey-Farm", new Upgrade(4, 500, 200)],
        ["Honey-Miner", new Upgrade(10, 10000, 2000)]
    ]);
    static milestonesMap = new Map([
        [0, { img: Object.assign(new Image(), { src: "img/honey.png" }), factor: 1, size: 32 }],
        [2000, { img: Object.assign(new Image(), { src: "img/box.png" }), factor: 2000, size: 128 }]
    ]);

    static gainHoney(value) {
        this.currentTotal += value;
        this.totalEarned += value;
    }

    static showUpgrade(upgradeIndex) {
        // const nextIndex = ++upgradeIndex
        // const upgrade = Array.from(this.upgradeMap.values())[nextIndex]
        // upgrade.isAvailable = true
    }

    static initialize() {
        this.autoInterval = setInterval(this.refreshTimer.bind(this), 500);
        this.onResize();
        this.idleFarmerElements.forEach((element) => {
            const name = element.getAttribute('data-upgrade');
            const upgrade = this.upgradeMap.get(name);
            upgrade.element = element;
            upgrade.name = name;
            upgrade.buttonUnlock = element.querySelector('.counterAuto');
            upgrade.buttonUpgrade = element.querySelector('.counterAutoUpgrade');
            upgrade.buttonUnlock.addEventListener('click', () => upgrade.onClickCounter());
            upgrade.buttonUpgrade.addEventListener('click', () => upgrade.onClickCounterUpgrade());
            upgrade.refreshSpeed();
        }, this);
        this.refresh();
    }

    static updateImage() {
        let currentConfig = null;
        for (const [limit, config] of this.milestonesMap) {
            if (this.currentTotal >= limit) {
                currentConfig = config;
            }
        }
        return currentConfig;
    }

    static refresh() {
        this.upgradeMap.forEach((upgrade) => upgrade.updateAvailableClass(this.totalEarned));
        const totalString = Math.floor(this.currentTotal).toLocaleString("en-us");
        document.title = `Honey : ${totalString}`;
        let config = this.updateImage();
        const ctx = this.spaceCanvas.getContext("2d");
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, this.spaceCanvas.width, this.spaceCanvas.height);
        const { img, factor, size } = config;
        this.counterDisplayElement.textContent = `${totalString} honey`;
        for (let i = 0; i < Math.floor(this.currentTotal / factor); i++) {
            ctx.drawImage(img, (i * size) % this.spaceCanvas.width, Math.floor((i * size) / this.spaceCanvas.width) * size, size, size);
        }
        this.saveState();
    }

    static animationFalling() {
        for (let i = 0; i < ClickImprovement.clickIncrement; i++) {
            const newPot = {
                x: Math.random() * this.spaceCanvas.width - 50,
                y: -100,
                isFalling: true,
                speed: 2 + 10 * Math.random()
            };
            this.fallingPot.push(newPot);
        }
    }

    static onResize() {
        this.spaceCanvas.width = window.innerWidth;
        this.spaceCanvas.height = window.innerHeight;
        this.refresh();
    }

    static onMouseDown() {
        this.gainHoney(ClickImprovement.clickIncrement);
        let audioPlay = new Audio('audio/honey-sfx.mp3');
        audioPlay.volume = 0.2;
        this.Doigby.play();
        this.Doigby.volume = 0.1;
        this.animationFalling();
        audioPlay.play();
        this.refresh();
    }

    static refreshTimer() {
        const time = Date.now();
        const dif = time - this.startTimer;
        let gain = 0.0;
        this.upgradeMap.forEach((upgrade) => {
            gain += dif / 1000 * upgrade.currentSpeed;
        });
        if (gain >= 1) {
            this.gainHoney(gain);
            this.startTimer = time;
            this.refresh();
        }
    }

    static update() {
        this.refreshTimer();
        const ctxFalling = this.spaceCanvas.getContext("2d");
        if (this.fallingPot.length) {
            ctxFalling.clearRect(0, 0, this.spaceCanvas.width, this.spaceCanvas.height);
            this.refresh();
            this.fallingPot.forEach((pot) => {
                if (pot.isFalling) {
                    pot.y += pot.speed;
                    ctxFalling.drawImage(this.milestonesMap.get(0).img, pot.x, pot.y, 100, 100);
                }
            });
            this.fallingPot = this.fallingPot.filter((pot) => pot.y < this.spaceCanvas.height);
        }
        window.requestAnimationFrame(this.update.bind(this));
    }

    static refreshInterval() {
        this.refreshTimer();
    }

    static computeTotalSpeed() {
        const totalspeed = this.upgradeMap.values().reduce((acc, item) => item.currentSpeed + acc, 0);
        this.counterTotalSpeed.textContent = `${totalspeed} honey/s`;
    }

    static saveState() {
        if (this.isSavingDisabled) return;

        const state = {
            totalEarned: this.totalEarned,
            currentTotal: this.currentTotal,
            upgradeMap: JSON.stringify(Object.fromEntries(this.upgradeMap)),
            currentUpgradePriceMilestonesIndex: this.currentUpgradePriceMilestonesIndex,
            clickIncrement: ClickImprovement.clickIncrement,
            clickMilestoneIndex: ClickImprovement.currentMilestoneIndex,
            startTimer: this.startTimer,
        };

        localStorage.setItem('gameState', JSON.stringify(state));
    }

    static loadState() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.currentTotal = state.currentTotal;
            this.totalEarned = state.totalEarned;

            const parsedUpgradeMap = JSON.parse(state.upgradeMap);
            this.upgradeMap = new Map(Object.entries(parsedUpgradeMap).map(([key, value]) => {
                return [key, Object.assign(new Upgrade(), value)];
            }));
            this.currentUpgradePriceMilestonesIndex = state.currentUpgradePriceMilestonesIndex;
            ClickImprovement.clickIncrement = state.clickIncrement;
            ClickImprovement.currentMilestoneIndex = state.clickMilestoneIndex;
            this.startTimer = state.startTimer;

            ClickImprovement.actualMilestone();
            this.refresh();
        }
    }

    static clearState() {
        const userConfirm = window.confirm('Are you sure you want to erase all your data?');
        if (userConfirm) {
            this.isSavingDisabled = true;
            localStorage.removeItem('gameState');
            this.loadState();
            window.location.reload();
        }
    }
}

Game.loadState();
Game.initialize();
Game.update();
Game.addButtonElement.addEventListener('mousedown', () => Game.onMouseDown());
Game.deleteStoredDataButton.addEventListener('click', () => Game.clearState());
ClickImprovement.improveClickElement.addEventListener('click', () => ClickImprovement.upgradeClick());
ClickImprovement.initialize();

window.addEventListener("resize", () => Game.onResize());
