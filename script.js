"use strict";

const addButtonElement = document.getElementById('counterAdd');

class Game {
    static total = 0;
    static currentSpeed = 0;
    static spaceCanvas = document.getElementById('newElementsContainer');
    static autoInterval = null;
    static Doigby = new Audio('audio/doigby.mp3');
    static counterAutoElement = document.getElementById('counterAuto');
    static counterDisplayElement = document.getElementById('counterDisplay');
    static counterAutoUpgrade = document.getElementById("counterAutoUpgrade");
    static upgradePrice = this.counterAutoUpgrade.querySelector("#upgradePrice");
    static upgradePriceMilestones = Array.from({ length: 1000 }, (_, i) => Math.round(200 + 100 * i));
    static currentUpgradePriceMilestonesIndex = 0;
    static fallingPot = [];
    static startTimer = 0.0;
    static milestonesMap = new Map([
        [0, { img: Object.assign(new Image(), { src: "img/honey.png" }), factor: 1, size: 32 }],
        [2000, { img: Object.assign(new Image(), { src: "img/box.png" }), factor: 2000, size: 128 }]
    ]);

    static initialize() {
        this.autoInterval = setInterval(this.refreshTimer.bind(this), 500);
        this.onResize();
        this.actualUpgradeMilestones();
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
        if (this.currentSpeed) {
            this.counterAutoElement.textContent = `Current speed : ${this.currentSpeed.toLocaleString('en-US')}/s`;
        }
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

    static onClickCounter() {
        if (this.total < 100 && this.currentSpeed === 0) {
            ErrorManager.errorMessageDisplay();
        } else if (this.total >= 100 && this.currentSpeed === 0) {
            this.currentSpeed = 1;
            this.total -= 100;
            this.refresh();
            this.startTimer = Date.now();
        }
    }

    static onClickCounterUpgrade() {
        if (this.currentSpeed === 0) {
            ErrorManager.errorMessageDisplay();
        } else if (this.total >= this.upgradePriceMilestones[this.currentUpgradePriceMilestonesIndex]) {
            this.currentSpeed += 1;
            this.currentUpgradePriceMilestonesIndex++;
            this.total -= this.upgradePriceMilestones[this.currentUpgradePriceMilestonesIndex - 1];
            this.refresh();
            this.actualUpgradeMilestones();
        } else {
            ErrorManager.errorMessageDisplay();
        }
    }

    static actualUpgradeMilestones() {
        this.upgradePrice.textContent = `(${(this.upgradePriceMilestones[this.currentUpgradePriceMilestonesIndex] || 0).toLocaleString('en-US')} Miel)`;
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
        gain += dif / 1000 * this.currentSpeed;
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
            currentSpeed: this.currentSpeed,
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
            this.currentSpeed = state.currentSpeed;
            this.currentUpgradePriceMilestonesIndex = state.currentUpgradePriceMilestonesIndex;
            ClickImprovement.clickIncrement = state.clickIncrement;
            ClickImprovement.currentMilestoneIndex = state.clickMilestoneIndex;
            this.startTimer = state.startTimer;

            ClickImprovement.actualMilestone();
            this.actualUpgradeMilestones();
            this.refresh();
        }
    }
}

class ClickImprovement {
    static clickIncrement = 1;
    static milestones = Array.from({ length: 100 }, (_, i) => Math.round(10 * Math.pow(10 + i, i)));
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
        if (Game.total >= this.milestones[this.currentMilestoneIndex]) {
            this.clickIncrement = Math.pow(2, this.currentMilestoneIndex + 1);
            this.currentMilestoneIndex++;
            Game.total -= this.milestones[this.currentMilestoneIndex - 1];
            this.actualMilestone();
            Game.refresh();
        } else {
            ErrorManager.errorMessageDisplay();
        }
    }
}

class ErrorManager {
    static errorMessageElement = document.getElementById('errorMessage');

    static errorMessageDisplay() {
        this.errorMessageElement.style.animation = 'none';
        this.errorMessageElement.classList.add('visible');
        setTimeout(() => {
            this.errorMessageElement.style.animation = 'fadeOut 1s forwards';
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('counterAdd');
    const rect = button.getBoundingClientRect();
    const x = rect.left;
    const y = rect.top;
});

Game.loadState();
Game.update();
addButtonElement.addEventListener('mousedown', () => Game.onMouseDown());
Game.counterAutoElement.addEventListener('click', () => Game.onClickCounter());
ClickImprovement.improveClickElement.addEventListener('click', () => ClickImprovement.upgradeClick());
ClickImprovement.initialize();
Game.initialize();
window.addEventListener("resize", () => Game.onResize());
Game.counterAutoUpgrade.addEventListener('click', () => Game.onClickCounterUpgrade());
