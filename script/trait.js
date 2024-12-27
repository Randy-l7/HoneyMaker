export const traitEffect = {
    NONE: 0,
    ADD: 1,
    MULT: 2
};

export const traitTarget = {
    NONE: 0,
    GLOBAL: 1,
    MAKER: 2,
    FARM: 3,
    MINER: 4,
    BANK: 5
};

export class Trait {
    constructor(effect = traitEffect.NONE, target = traitTarget.NONE, value = 0) {
        this.effect = effect;
        this.target = target;
        this.value = value;
    }
}
