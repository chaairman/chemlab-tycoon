// src/UIManager.ts

import * as PIXI from 'pixi.js';
import { Inventory } from './Inventory';

type ButtonClickHandler = () => void;

export class UIManager {
    private stage: PIXI.Container;
    private currencyText: PIXI.Text;
    private inventoryText: PIXI.Text;
    private placementText: PIXI.Text;
    private textStyle: PIXI.TextStyle;
    private buttonTextStyle: PIXI.TextStyle;

    constructor(
        stage: PIXI.Container,
        onBuyChemicalAClick: ButtonClickHandler,
        onSellProductBClick: ButtonClickHandler,
        onBuyMixerClick: ButtonClickHandler
    ) {
        // ... (Styles and other text elements as before) ...
        this.stage = stage;
        this.textStyle = new PIXI.TextStyle({ /* ... */ fontFamily: 'Arial', fontSize: 24, fill: 0xffffff, stroke: { color: 0x000000, width: 4 }, align: 'left' });
        this.buttonTextStyle = new PIXI.TextStyle({ /* ... */ fontFamily: 'Arial', fontSize: 18, fill: 0x000000, align: 'center' });
        this.currencyText = new PIXI.Text({ text: 'Currency: $---', style: this.textStyle });
        this.inventoryText = new PIXI.Text({ text: 'Inventory: -/-', style: this.textStyle });
        this.placementText = new PIXI.Text({ text: '', style: this.textStyle });
        this.currencyText.position.set(10, 10);
        this.inventoryText.position.set(10, 40);
        this.placementText.position.set(10, 150);
        this.stage.addChild(this.currencyText, this.inventoryText, this.placementText);

        // --- Button Elements ---
        const buttonWidth = 180; const buttonHeight = 40; const buttonPadding = 10;
        const buttonRow1Y = this.inventoryText.y + this.inventoryText.height + buttonPadding * 2;
        const buttonRow2Y = buttonRow1Y + buttonHeight + buttonPadding;
        this.createButton('Buy Raw A ($10)', 10, buttonRow1Y, buttonWidth, buttonHeight, onBuyChemicalAClick);
        this.createButton('Sell Product B ($25)', 10 + buttonWidth + buttonPadding, buttonRow1Y, buttonWidth, buttonHeight, onSellProductBClick);
        this.createButton('Buy Mixer ($100)', 10, buttonRow2Y, buttonWidth, buttonHeight, onBuyMixerClick);
        console.log("UIManager initialized with buttons.");
    }

    private createButton(text: string, x: number, y: number, width: number, height: number, onClick: ButtonClickHandler): PIXI.Container {
        const buttonContainer = new PIXI.Container(); /* ... as before ... */
        buttonContainer.position.set(x, y);
        const buttonBackground = new PIXI.Graphics() .roundRect(0, 0, width, height, 8).fill(0xCCCCCC).stroke({ width: 2, color: 0x333333 });
        const buttonText = new PIXI.Text({ text: text, style: this.buttonTextStyle }); buttonText.anchor.set(0.5); buttonText.position.set(width / 2, height / 2);
        buttonContainer.addChild(buttonBackground, buttonText);
        buttonContainer.eventMode = 'static'; buttonContainer.cursor = 'pointer';

        // --- MODIFICATION HERE ---
        // Attach the click handler and stop propagation
        buttonContainer.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
            // Stop this event from bubbling up to the stage listener
            event.stopPropagation();
            // Execute the original callback function passed from GameManager
            onClick();
        });
        // --- END MODIFICATION ---

        this.stage.addChild(buttonContainer);
        return buttonContainer;
    }

    public updateCurrency(amount: number): void { this.currencyText.text = `Currency: $${amount}`; }
    public updateInventory(inventory: Inventory): void { const load = inventory.getLoad(); const capacity = inventory.getCapacity(); this.inventoryText.text = `Inventory: ${load} / ${capacity}`; }
    public updatePlacementText(message: string): void { this.placementText.text = message; }
}