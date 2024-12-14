"use strict";

const addButtonElement = document.getElementById('counterAdd');



class Game {
    static total = 1000;
    static unlockStatus = 0;
    static currentSpeed = 1;
    static spaceCanvas = document.getElementById('newElementsContainer');
    static autoInterval = null;
    static Doigby = new Audio('youtube_8P5WCI0iQlo_audio.mp3');
    static counterAutoElement = document.getElementById('counterAuto');
    static counterDisplayElement = document.getElementById('counterDisplay');
    static counterAutoUpgrade = document.getElementById("counterAutoUpgrade");
    static upgradePrice = this.counterAutoUpgrade.querySelector("#upgradePrice");
    static upgradePriceMilestones = [200,1000,10000,200000]
    static currentUpgradePriceMilestonesIndex = 0
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
            ErrorManager.errorMessageDisplay(); }
        else if(this.total>=100 && this.unlockStatus === 0) {
            this.unlockStatus = 1
            this.total -=100;
            this.refresh();
            this.incrementCounter();
        }
    
    }

    static incrementCounter() {
        if (this.autoInterval) {
        clearInterval(this.autoInterval)
         }
        this.total += 1;
        this.autoInterval = setInterval(() => Game.incrementCounter(), (1000/this.currentSpeed));
        console.log(this.total);
        this.counterAutoElement.textContent =`Current speed : ${this.currentSpeed}/s`
        this.refresh();
    }

    static onClickCounterUpgrade() {
        if (this.unlockStatus === 0) {
            ErrorManager.errorMessageDisplay();
        }
        else if (this.total >= this.upgradePriceMilestones[this.currentUpgradePriceMilestonesIndex]) {
            this.currentSpeed = Math.pow(2, this.currentUpgradePriceMilestonesIndex + 1);
            console.log(this.currentSpeed)
            this.currentUpgradePriceMilestonesIndex++;
            this.total -= this.upgradePriceMilestones[this.currentUpgradePriceMilestonesIndex - 1];
            this.refresh();
            this.actualUpgradeMilestones();


        }
    }
    static actualUpgradeMilestones() {
        console.log(this.upgradePriceMilestones[this.currentUpgradePriceMilestonesIndex])
        this.upgradePrice.textContent = `(${this.upgradePriceMilestones[this.currentUpgradePriceMilestonesIndex]} Miel)`
    }    
    



    static onMouseDown() {
     this.total += ClickImprovement.clickIncrement;
    let audioPlay = new Audio('PLOUF.mp3');
    audioPlay.play();
    this.Doigby.play();
    this.refresh();
    }
}


class ClickImprovement {

    static clickIncrement = 1;
    static milestones = [10, 50, 100, 250, 500, 1000,20000,50000,99999999999];
    static currentMilestoneIndex = 0;
    static improveClickElement = document.getElementById('clickImprove');
    static initialize() {
        this.actualMilestone();
        Game.onResize();
        
        Game.actualUpgradeMilestones()
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




addButtonElement.addEventListener('mousedown', () => Game.onMouseDown());
Game.counterAutoElement.addEventListener('click', () => Game.onClickCounter());
ClickImprovement.improveClickElement.addEventListener('click', () => ClickImprovement.upgradeClick())
ClickImprovement.initialize();
window.addEventListener("resize", () => Game.onResize() );
Game.counterAutoUpgrade.addEventListener('click', () => Game.onClickCounterUpgrade());