"use strict";

import { Item } from './item.js';
import { traitEffect, traitTarget, Trait } from "./trait.js";
import { Game } from "./game.js";

export class Shop {
    static itemList = [];

    static initialize() {
        this.itemList = [
            new Item(
                "img/honey.png",
                [new Trait(traitEffect.MULT, traitTarget.MAKER, 1.1)],
                `Cooler Honey \nImprove the Honey-Maker speed by 10%`,
                500,
                150,
                ["Honey-Maker"]
            ),
            new Item(
                "img/box.png",
                [new Trait(traitEffect.MULT, traitTarget.FARM, 1.2)],
                `Cooler Farm \nImprove the Honey-Farm speed by 20%`,
                1000,
                500,
                ["Honey-Farm"]
            ),
            new Item(
                "img/plank.png",
                [new Trait(traitEffect.MULT, traitTarget.MINER, 1.15)],
                `Cooler Farm \nImprove the Honey-Miner speed by 15%`,
                3000,
                1000,
                ["Honey-Miner"]
            )
        ];
    }

    static updateAvailableItem(total) {
        this.itemList.forEach(item => {
            if (total >= item.milestone) {
                if (!item.isAvailable && !item.isBuyed) {
                    item.isAvailable = true;
                    this.addItems(item);
                }
            }
        });
    }

    static highlightNumbers(text) {
        return text.replace(/(\d+)(%)?/g, '<span class="highlight-number">$&</span>');
    }

    static addItems(item) {
        const container = document.querySelector(".shopContainer");

        const div = document.createElement("div");
        div.className = "item";
        item.itemDiv = div;

        const img = document.createElement("img");
        img.src = item.img;
        img.alt = item.name;

        const span = document.createElement("span");
        span.className = "tooltiptext";
        span.textContent = item.name;
        span.innerHTML = item.name.replace(/\n/g, '<br>');
        span.innerHTML = Item.highlightNumbers(span.innerHTML);

        div.appendChild(img);
        div.appendChild(span);
        container.appendChild(div);

        div.addEventListener('click', () => item.onClickItem());
    }

    static computeItem(effect, target) {
        const buyedItems = this.itemList.filter((item) => item.isBuyed);
        switch (effect) {
            case traitEffect.ADD:
                return buyedItems.reduce((acc, item) => acc + item.computeTrait(effect, target), 0);
            case traitEffect.MULT:
                return buyedItems.reduce((acc, item) => acc * item.computeTrait(effect, target), 1);
        }
    }
}
