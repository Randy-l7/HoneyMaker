"use strict";

export const notEnoughError = "Not enough honey!"

export class ErrorManager {
    static errorMessageElement = document.getElementById('errorMessage');

    static errorMessageDisplay(errorText) {
        this.errorMessageElement.textContent = errorText
        this.errorMessageElement.style.animation = 'none';
        this.errorMessageElement.classList.add('visible');
        setTimeout(() => {
            this.errorMessageElement.style.animation = 'fadeOut 1s forwards';
        }, 1000);
    
    }
}