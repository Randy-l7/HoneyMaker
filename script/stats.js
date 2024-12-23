"use strict";

import { Game } from './game.js';

export class Stats {
    static openModal = document.getElementById('open-modal');
    static closeModal = document.getElementById('close-modal');
    static modal = document.getElementById('modal');
    static globalHoney = document.getElementById('globalStatsHoney');

    static onClickStatsContainer(target) {
        if (target == "open") {
            this.modal.style.display = "flex";
            this.showTotalEarned();
        } else if (target == "close") {
            this.modal.style.display = "none";
        }
    }

    static showTotalEarned() {
        this.globalHoney.textContent = `${Math.floor(Game.totalEarned.toLocaleString("en-us"))}`;
    }
}

Stats.openModal.addEventListener('click', () => Stats.onClickStatsContainer("open"));
Stats.closeModal.addEventListener('click', () => Stats.onClickStatsContainer("close"));
Stats.modal.addEventListener('click', (e) => {
    if (e.target === Stats.modal) {
        Stats.onClickStatsContainer("close");
    }
});
