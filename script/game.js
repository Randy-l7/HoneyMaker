"use strict";

import { Upgrade } from './upgrade.js';
import { ClickImprovement } from './clickImprovement.js';
import { ErrorManager } from './errorManager.js';


const addButtonElement = document.getElementById('counterAdd');



export class Game {
    static total = 0;
    static spaceCanvas = document.getElementById('newElementsContainer');
    static autoInterval = null;
    static Doigby = new Audio('audio/doigby.mp3');
    static counterAutoElement = document.querySelectorAll(".counterAuto");
    static counterDisplayElement = document.getElementById('counterDisplay');
    static counterAutoUpgradeButtons = document.querySelectorAll(".counterAutoUpgrade");
    static upgradePrices = Array.from(this.counterAutoUpgradeButtons).map(button => button.querySelector(".upgradePrice"));
    static upgradePriceMilestones = Array.from({ length: 1000 }, (_, i) => Math.round(200 + 100 * i));
    static currentMapUpgradePriceIndex = 0;
    static fallingPot = [];
    static startTimer = 0.0;
    static upgradeMap = new Map([
        ["Honey-Maker", new Upgrade(1, 200)],
        ["Honey-Farm", new Upgrade(4, 500)]
    ]);
    static milestonesMap = new Map([
        [0, { img: Object.assign(new Image(), { src: "img/honey.png" }), factor: 1, size: 32 }],
        [2000, { img: Object.assign(new Image(), { src: "img/box.png" }), factor: 2000, size: 128 }]
    ]);

    static initialize() {
        console.log(this.counterAutoUpgradeButtons);
        this.autoInterval = setInterval(this.refreshTimer.bind(this), 500);
        this.onResize();
        this.counterAutoUpgradeButtons.forEach((button) => {
            const name = button.getAttribute('data-upgrade');
            const upgrade = this.upgradeMap.get(name);
            upgrade.name = name
            upgrade.buttonUpgrade = button
            button.addEventListener('click', () => upgrade.onClickCounterUpgrade());
        }, this);
        console.log(this.counterAutoElement);
        this.counterAutoElement.forEach((button) => {
            console.log(button);
            const name = button.getAttribute('data-upgrade');
            const upgrade = this.upgradeMap.get(name);
            upgrade.buttonUnlock = button
            button.addEventListener('click', () => upgrade.onClickCounter());
        }, this);
        this.upgradeMap.forEach((item)=> {
            item.refreshSpeed();
        })
    }

    static updateImage() {
        let currentConfig = null;
        for (const [limit, config] of this.milestonesMap) {
            if (this.total >= limit) {
                currentConfig = config;
            }
        }
        return currentConfig;
    }

    static refresh() {
        const totalString = Math.floor(this.total).toLocaleString("en-us");
        document.title = `Honey : ${totalString}`;
        let config = this.updateImage();
        const ctx = this.spaceCanvas.getContext("2d");
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, this.spaceCanvas.width, this.spaceCanvas.height);
        const { img, factor, size } = config;
        this.counterDisplayElement.textContent = totalString;
        for (let i = 0; i < Math.floor(this.total / factor); i++) {
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
        this.total += ClickImprovement.clickIncrement;
        let audioPlay = new Audio('audio/honey-sfx.mp3');
        this.animationFalling();
        audioPlay.play();
        this.Doigby.play();
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
            this.total += gain;
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

    static saveState() {
        const state = {
            total: this.total,
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
            this.total = state.total;
           
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
}

Game.loadState();
Game.update();
addButtonElement.addEventListener('mousedown', () => Game.onMouseDown());

ClickImprovement.improveClickElement.addEventListener('click', () => ClickImprovement.upgradeClick());
ClickImprovement.initialize();
Game.initialize();
window.addEventListener("resize", () => Game.onResize());
