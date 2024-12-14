"use strict";

const addButtonElement = document.getElementById('counterAdd');

class Game {
    static total = 0;
    static unlockStatus = 0;
    static currentSpeed = 1;
    static spaceCanvas = document.getElementById('newElementsContainer');
    static autoInterval = null;
    static Doigby = new Audio('youtube_8P5WCI0iQlo_audio.mp3');
    static counterAutoElement = document.getElementById('counterAuto');
    static counterDisplayElement = document.getElementById('counterDisplay');
    static counterAutoUpgrade = document.getElementById("counterAutoUpgrade");
    static upgradePrice = this.counterAutoUpgrade.querySelector("#upgradePrice");
    static upgradePriceMilestones = [200, 1000, 10000, 200000];
    static currentUpgradePriceMilestonesIndex = 0;
    static fallingPot = [];
    static milestonesMap = new Map([
        [0, { img: Object.assign(new Image(), { src: "Miel.png" }), factor: 1, size: 32 }],
        [2000, { img: Object.assign(new Image(), { src: "Boite.png" }), factor: 2000, size: 128 }]
    ]);

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
        let config = this.updateImage();
        const ctx = this.spaceCanvas.getContext("2d");
        ctx.clearRect(0, 0, this.spaceCanvas.width, this.spaceCanvas.height);
        const { img, factor, size } = config;
        this.counterDisplayElement.textContent = this.total;
        for (let i = 0; i < Math.floor(this.total / factor); i++) {
            ctx.drawImage(img, (i * size) % this.spaceCanvas.width, Math.floor((i * size) / this.spaceCanvas.width) * size, size, size);
        }
        this.saveState();
    }

    static animationFalling() {
        const ctxFalling = this.spaceCanvas.getContext("2d");
        for (let i = 0;i<=ClickImprovement.clickIncrement;i++) {
        const newPot = {
            x: Math.random() * this.spaceCanvas.width,
            y: 0,
            isFalling: true,
            speed: 2 + 10 * Math.random()
        
        };
        this.fallingPot.push(newPot);
    }

        

        const animation = () => {
            ctxFalling.clearRect(0, 0, this.spaceCanvas.width, this.spaceCanvas.height);
            this.refresh();
            this.fallingPot.forEach((pot) => {
                if (pot.isFalling) {
                    pot.y += pot.speed;
                    ctxFalling.drawImage(this.milestonesMap.get(0).img, pot.x, pot.y, 100, 100);
                }
            });
            this.fallingPot = this.fallingPot.filter((pot) => pot.y < this.spaceCanvas.height);

            if (this.fallingPot.length > 0)
                requestAnimationFrame(animation);
        };
        requestAnimationFrame(animation);
    }

    static onResize() {
        console.log("La fenêtre est redimensionnée !");
        console.log("Canvas :", this.spaceCanvas.width);
        this.spaceCanvas.width = window.innerWidth;
        this.spaceCanvas.height = window.innerHeight;
        this.refresh();
    }

    static onClickCounter() {
        if (this.total < 100 && this.unlockStatus === 0) {
            ErrorManager.errorMessageDisplay();
        } else if (this.total >= 100 && this.unlockStatus === 0) {
            this.unlockStatus = 1;
            this.total -= 100;
            this.refresh();
            this.incrementCounter();
        }
    }

    static incrementCounter() {
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
        }
        this.total += 1;
        this.autoInterval = setInterval(() => Game.incrementCounter(), (1000 / this.currentSpeed));
        console.log(this.total);
        this.counterAutoElement.textContent = `Current speed : ${this.currentSpeed}/s`;
        this.refresh();
    }

    static onClickCounterUpgrade() {
        if (this.unlockStatus === 0) {
            ErrorManager.errorMessageDisplay();
        } else if (this.total >= this.upgradePriceMilestones[this.currentUpgradePriceMilestonesIndex]) {
            this.currentSpeed = Math.pow(2, this.currentUpgradePriceMilestonesIndex + 1);
            console.log(this.currentSpeed);
            this.currentUpgradePriceMilestonesIndex++;
            this.total -= this.upgradePriceMilestones[this.currentUpgradePriceMilestonesIndex - 1];
            this.refresh();
            this.actualUpgradeMilestones();
        }
    }

    static actualUpgradeMilestones() {
        console.log(this.upgradePriceMilestones[this.currentUpgradePriceMilestonesIndex]);
        this.upgradePrice.textContent = `(${this.upgradePriceMilestones[this.currentUpgradePriceMilestonesIndex]} Miel)`;
    }

    static onMouseDown() {
        this.total += ClickImprovement.clickIncrement;
        let audioPlay = new Audio('PLOUF.mp3');
        this.animationFalling();
        audioPlay.play();
        this.Doigby.play();
        console.log(this.fallingPot.isFalling);
        console.log('ratio');
        this.refresh();
    }

    static saveState() {
        const state = {
            total: this.total,
            unlockStatus: this.unlockStatus,
            currentSpeed: this.currentSpeed,
            currentUpgradePriceMilestonesIndex: this.currentUpgradePriceMilestonesIndex,
            clickIncrement: ClickImprovement.clickIncrement,
            clickMilestoneIndex: ClickImprovement.currentMilestoneIndex
        };
        localStorage.setItem('gameState', JSON.stringify(state));
        console.log("saved");
    }

    static loadState() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.total = state.total;
            this.unlockStatus = state.unlockStatus;
            this.currentSpeed = state.currentSpeed;
            this.currentUpgradePriceMilestonesIndex = state.currentUpgradePriceMilestonesIndex;
            ClickImprovement.clickIncrement = state.clickIncrement;
            ClickImprovement.currentMilestoneIndex = state.clickMilestoneIndex;

            if (this.unlockStatus === 1) {
                this.incrementCounter();
            }

            ClickImprovement.actualMilestone();
            this.actualUpgradeMilestones();
            this.refresh();
        }
    }
}

class ClickImprovement {
    static clickIncrement = 1;
    static milestones = [10, 50, 100, 250, 500, 1000, 20000, 50000, 99999999999];
    static currentMilestoneIndex = 0;
    static improveClickElement = document.getElementById('clickImprove');

    static initialize() {
        this.actualMilestone();
        Game.onResize();
        Game.actualUpgradeMilestones();
    }

    static actualMilestone() {
        this.improveClickElement.textContent = `Improve Click (${this.milestones[this.currentMilestoneIndex]})`;
    }

    static upgradeClick() {
        if (Game.total >= this.milestones[this.currentMilestoneIndex]) {
            this.clickIncrement = Math.pow(2, this.currentMilestoneIndex + 1);
            this.currentMilestoneIndex++;
            console.log(this.milestones[this.currentMilestoneIndex - 1]);
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
    console.log(`x: ${x}, y: ${y}`);
});

Game.loadState();
addButtonElement.addEventListener('mousedown', () => Game.onMouseDown());
Game.counterAutoElement.addEventListener('click', () => Game.onClickCounter());
ClickImprovement.improveClickElement.addEventListener('click', () => ClickImprovement.upgradeClick());
ClickImprovement.initialize();
window.addEventListener("resize", () => Game.onResize());
Game.counterAutoUpgrade.addEventListener('click', () => Game.onClickCounterUpgrade());
