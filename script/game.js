"use strict";

import { Upgrade } from './upgrade.js';
import { ClickImprovement } from './clickImprovement.js';
import { ErrorManager, notEnoughError } from './errorManager.js';
import { Stats } from './stats.js';
import { Item } from './item.js';
import { Shop } from './shop.js';
import { traitEffect, traitTarget, Trait } from "./trait.js";

export class Game {
    static globalSpeedUpgrade = 1;
    static settingsbutton = document.getElementById('settings');
    static deleteStoredDataButton = document.getElementById('deleteButton');
    static volumeButton = document.getElementById('volume-button');
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
    static isMuted = false;
    static fallingPot = [];
    static startTimer = 0.0;
    static isSavingDisabled = false;
    static levelMap = new Map([
        [1, "#4CAF50"], // Vert
        [5, "#2196F3"], // Bleu
        [10, "#FF9800"], // Orange
        [25, "#F44336"], // Rouge
        [50, "#9C27B0"], // Violet
        [100, "linear-gradient(to right, red, orange, violet)"]
    ]);
    static upgradeMap = new Map([
        ["Honey-Maker", new Upgrade(1, 200, 10, traitTarget.MAKER)],
        ["Honey-Farm", new Upgrade(4, 500, 200, traitTarget.FARM)],
        ["Honey-Miner", new Upgrade(10, 10000, 2000, traitTarget.MINER)],
        ["Honey-Bank", new Upgrade(50, 75000, 15000, traitTarget.BANK)]
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

        this.idleFarmerElements.forEach((element) => {
            const name = element.getAttribute('data-upgrade');
            const upgrade = this.upgradeMap.get(name);
            upgrade.element = element;
            upgrade.name = name;
            upgrade.buttonUnlock = element.querySelector('.counterAuto');
            upgrade.buttonUpgrade = element.querySelector('.counterAutoUpgrade');
            upgrade.buttonUnlock.addEventListener('click', () => upgrade.onClickCounter());
            upgrade.buttonUpgrade.addEventListener('click', () => upgrade.onClickCounterUpgrade());
            upgrade.levelColor = element.querySelector('.level-display');
            upgrade.updateLevelStyle();
            upgrade.refreshSpeed();
        }, this);
        this.onResize();
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
        Shop.updateAvailableItem(this.totalEarned);
        this.upgradeMap.forEach((upgrade) => upgrade.updateAvailableClass(this.totalEarned, this.currentTotal));
        const totalString = Math.floor(this.currentTotal).toLocaleString("en-us");
        document.title = `Honey : ${totalString}`;
        let config = this.updateImage();
        const ctx = this.spaceCanvas.getContext("2d");
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, this.spaceCanvas.width, this.spaceCanvas.height);
        const { img, factor, size } = config;
        this.counterDisplayElement.textContent = `${totalString} honey`;
        for (let i = 0; i < Math.floor(this.currentTotal / factor) && i < 2000; i++) {
            ctx.drawImage(img, (i * size) % this.spaceCanvas.width, Math.floor((i * size) / this.spaceCanvas.width) * size, size, size);
        }
        this.saveState();
        Stats.showTotalEarned();
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
        if (!this.isMuted) {
            this.Doigby.play();
            this.Doigby.volume = 0.1;
        }
        this.animationFalling();
        audioPlay.play();
        this.refresh();
    }

    static refreshTimer() {
        const time = Date.now();
        const dif = time - this.startTimer;
        let gain = 0.0;
        this.upgradeMap.forEach((upgrade) => {
            upgrade.computeUpgradeItem();
            gain += (dif / 1000.0) * upgrade.computeSpeed;
            // gain += (dif / 1000 * (upgrade.currentSpeed+Shop.computeItem(traitEffect.ADD,upgrade.target))) * Shop.computeItem(traitEffect.MULT, upgrade.target) ;
        });
        this.globalSpeedUpgrade = Shop.computeItem(traitEffect.MULT, traitTarget.GLOBAL);
        gain += (dif / 1000 * Shop.computeItem(traitEffect.ADD, traitTarget.GLOBAL));
        gain *= this.globalSpeedUpgrade;
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

    static volumeControl() {
        if (!this.isMuted) {
            this.isMuted = true;
            this.volumeButton.textContent = "music_off";
            this.Doigby.volume = 0;
            return;
        }
        this.isMuted = false;
        this.volumeButton.textContent = "music_note";
        this.Doigby.volume = 0.1;
    }

    static refreshInterval() {
        this.refreshTimer();
    }

    static computeTotalSpeed() {
        const totalspeed = this.upgradeMap.values().reduce((acc, upgrade) => upgrade.computeSpeed + acc, 0) * this.globalSpeedUpgrade;
        this.counterTotalSpeed.textContent = `${totalspeed.toFixed(1)} honey/s`;
    }

    static saveState() {
        if (this.isSavingDisabled) return;
        const state = {
            items: Shop.itemList.map(item => ({
                name: item.name,
                isBuyed: item.isBuyed,
            })),
            totalEarned: this.totalEarned,
            currentTotal: this.currentTotal,
            upgradeMap: JSON.stringify(Object.fromEntries(this.upgradeMap)),
            currentUpgradePriceMilestonesIndex: this.currentUpgradePriceMilestonesIndex,
            clickIncrement: ClickImprovement.clickIncrement,
            clickMilestoneIndex: ClickImprovement.currentMilestoneIndex,
            startTimer: this.startTimer,
            isMuted: this.isMuted
        };

        localStorage.setItem('gameState', JSON.stringify(state));
    }

    static loadState() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            const state = JSON.parse(savedState);
            state.items.forEach(savedItem => {
                const item = Shop.itemList.find(i => i.name === savedItem.name);
                if (item) {
                    item.isBuyed = savedItem.isBuyed;
                }
            });
            this.currentTotal = state.currentTotal;
            this.totalEarned = state.totalEarned;
            this.isMuted = state.isMuted

            const parsedUpgradeMap = JSON.parse(state.upgradeMap);
            this.upgradeMap = new Map(Object.entries(parsedUpgradeMap).map(([key, value]) => {
                return [key, Object.assign(new Upgrade(), value)];
            }));
            this.currentUpgradePriceMilestonesIndex = state.currentUpgradePriceMilestonesIndex;
            ClickImprovement.clickIncrement = state.clickIncrement;
            ClickImprovement.currentMilestoneIndex = state.clickMilestoneIndex;
            this.startTimer = state.startTimer;

            ClickImprovement.actualMilestone();
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

    static onClickSetting() {
        this.settingsbutton.parentElement.parentElement.classList.toggle('active');
    }
}

Shop.initialize();
Game.loadState();
Game.initialize();
Game.update();
Game.settingsbutton.addEventListener('click', () => Game.onClickSetting());
Game.addButtonElement.addEventListener('mousedown', () => Game.onMouseDown());
Game.deleteStoredDataButton.addEventListener('click', () => Game.clearState());
Game.volumeButton.addEventListener('click', () => Game.volumeControl());
ClickImprovement.improveClickElement.addEventListener('click', () => ClickImprovement.upgradeClick());
ClickImprovement.initialize();
window.addEventListener("resize", () => Game.onResize());
