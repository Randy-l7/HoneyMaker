"use strict";

const addButtonElement = document.getElementById('counterAdd');
const subButtonElement = document.getElementById('counterSub');
const counterDisplayElement = document.getElementById('counterDisplay');
const counterAutoElement = document.getElementById('counterAuto');
const errorMessageElement = document.getElementById('errorMessage');
const improveClickElement = document.getElementById('clickImprove');

const mielCanvas = document.getElementById('newElementsContainer');
const miel = new Image();
const boite = new Image();
miel.src = "Miel.png";
boite.src = "Boite.png";
mielCanvas.width = window.innerWidth;
mielCanvas.height = window.innerHeight;

class Game {
    constructor() {
        this.total = 0;
        this.autoInterval = null;
        this.Doigby = new Audio('youtube_8P5WCI0iQlo_audio.mp3');
        this.unlockStatus = 0;
        this.currentSpeed = 1;
        this.milestonesMap = new Map([
            [0, { img: miel, factor: 1, size: 32 }],
            [200, { img: boite, factor: 200, size: 128 }]
        ]);}

        updateImage() {
            let currentConfig = null
            for (const [limit, config]  of this.milestonesMap) {
                    if (this.total>=limit) {    
                        currentConfig = config
                    }
            }
            return currentConfig;
        }
        }
    


class ClickImprovement {
    constructor() {
        this.clickIncrement = 1;
        this.milestones = [10, 50, 100, 250, 500, 1000];
        this.currentMilestoneIndex = 0;
    }

    actualMilestone() {
        improveClickElement.textContent = `Improve Click (${this.milestones[this.currentMilestoneIndex]})`;
    }

    upgradeClick() {
        if (game.total >= this.milestones[this.currentMilestoneIndex]) {
            this.clickIncrement = Math.pow(2, this.currentMilestoneIndex + 1);
            this.currentMilestoneIndex++;
            console.log(this.milestones[this.currentMilestoneIndex - 1]);
            game.total -= this.milestones[this.currentMilestoneIndex - 1];
            updateCounterDisplay();
            this.actualMilestone();
            refresh();
        } else {
            errorMessageDisplay();
        }
    }
}

const updateCounterDisplay = () => {
    if (game.total < 0) {
        game.total = 0;
    }
    document.body.style.setProperty('background-color', 'white');
    counterDisplayElement.textContent = game.total;
};

addEventListener("resize", () => {
    mielCanvas.width = window.innerWidth;
    mielCanvas.height = window.innerHeight;
    refresh();
});

const refresh = () => {
    let config = game.updateImage()
    const ctx = mielCanvas.getContext("2d");
    ctx.clearRect(0, 0, mielCanvas.width, mielCanvas.height);
    const {img, factor, size} = config;
    for (let i = 0; i < Math.floor((game.total)/factor); i++) {
            ctx.drawImage(img, (i * size) % mielCanvas.width, Math.floor((i * size) / mielCanvas.width) * size, size, size);
    
    } }
;

addButtonElement.addEventListener('mousedown', () => {
    game.total += clickImprovement.clickIncrement;
    let audioPlay = new Audio('PLOUF.mp3');
    audioPlay.play();
    updateCounterDisplay();
    game.Doigby.play();
    refresh();
});

counterAutoElement.addEventListener('click', () => {
     let incrementCounter = () => {
            game.total += clickImprovement.clickIncrement;
            refresh();
            console.log(game.total);
            updateCounterDisplay();
            
        };
    if (game.total < 100 && game.unlockStatus === 0) {
        errorMessageDisplay(); }
    else if(game.total>=100 && game.unlockStatus === 0) {
        game.unlockStatus = 1
        counterAutoElement.textContent =`Current speed : ${game.currentSpeed}/s`
        game.autoInterval = setInterval(incrementCounter, 1000);

    }
    

        
    }
);

improveClickElement.addEventListener('click', () => {
    clickImprovement.upgradeClick();
});

const errorMessageDisplay = () => {
    errorMessageElement.style.animation = 'none';
    errorMessageElement.classList.add('visible');
    setTimeout(() => {
        errorMessageElement.style.animation = 'fadeOut 1s forwards';
    }, 1000);
}

const game = new Game();
const clickImprovement = new ClickImprovement();

clickImprovement.actualMilestone();
updateCounterDisplay();
