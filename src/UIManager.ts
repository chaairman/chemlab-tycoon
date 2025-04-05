// src/UIManager.ts

import * as PIXI from 'pixi.js';
import { Inventory } from './Inventory';

// Type alias for click handlers remains the same
type ButtonClickHandler = () => void;

/**
 * Manages the creation, positioning, and updating of UI elements.
 */
export class UIManager {
    private stage: PIXI.Container;
    private currencyText: PIXI.Text;
    private inventoryText: PIXI.Text;
    private placementText: PIXI.Text;
    private textStyle: PIXI.TextStyle;
    private buttonTextStyle: PIXI.TextStyle;

    /**
     * Initializes the UIManager.
     * @param stage - The main PIXI.Container to add UI elements to.
     * @param onBuyChemicalAClick - Callback for "Buy A" button.
     * @param onSellProductBClick - Callback for "Sell B" button.
     * @param onBuyMixerClick - Callback for "Buy Mixer" button.
     * @param onBuyHeaterClick - Callback for "Buy Heater" button. // Added new callback parameter
     */
    constructor(
        stage: PIXI.Container,
        onBuyChemicalAClick: ButtonClickHandler,
        onSellProductBClick: ButtonClickHandler,
        onBuyMixerClick: ButtonClickHandler,
        onBuyHeaterClick: ButtonClickHandler // Added parameter
    ) {
        this.stage = stage;

        // --- Styles (remain the same) ---
        this.textStyle = new PIXI.TextStyle({ fontFamily: 'Arial', fontSize: 24, fill: 0xffffff, stroke: { color: 0x000000, width: 4 }, align: 'left', });
        this.buttonTextStyle = new PIXI.TextStyle({ fontFamily: 'Arial', fontSize: 18, fill: 0x000000, align: 'center', });

        // --- Info Text (remain the same) ---
        this.currencyText = new PIXI.Text({ text: 'Currency: $---', style: this.textStyle });
        this.inventoryText = new PIXI.Text({ text: 'Inventory: -/-', style: this.textStyle });
        this.placementText = new PIXI.Text({ text: '', style: this.textStyle });
        this.currencyText.position.set(10, 10);
        this.inventoryText.position.set(10, 40);
        this.placementText.position.set(10, 150); // Might need adjusting later
        this.stage.addChild(this.currencyText, this.inventoryText, this.placementText);

        // --- Buttons ---
        const buttonWidth = 180; const buttonHeight = 40; const buttonPadding = 10;
        const buttonRow1Y = this.inventoryText.y + this.inventoryText.height + buttonPadding * 2;
        const buttonRow2Y = buttonRow1Y + buttonHeight + buttonPadding;

        // Row 1: Chemicals
        this.createButton('Buy Raw A ($10)', 10, buttonRow1Y, buttonWidth, buttonHeight, onBuyChemicalAClick);
        this.createButton('Sell Product B ($25)', 10 + buttonWidth + buttonPadding, buttonRow1Y, buttonWidth, buttonHeight, onSellProductBClick);
        // Note: No sell button for Product C yet, add later if desired

        // Row 2: Machines
        this.createButton('Buy Mixer ($100)', 10, buttonRow2Y, buttonWidth, buttonHeight, onBuyMixerClick);
        // Add the new "Buy Heater" button next to the Mixer button
        this.createButton(
            'Buy Heater ($300)',
            10 + buttonWidth + buttonPadding, // Position next to Mixer button
            buttonRow2Y,                       // Same row as Mixer button
            buttonWidth,
            buttonHeight,
            onBuyHeaterClick                   // Use the new callback
        );

        console.log("UIManager initialized with Heater button.");
    }

    // createButton method remains exactly the same as before
    private createButton(text: string, x: number, y: number, width: number, height: number, onClick: ButtonClickHandler): PIXI.Container {
        const buttonContainer = new PIXI.Container(); buttonContainer.position.set(x, y);
        const buttonBackground = new PIXI.Graphics() .roundRect(0, 0, width, height, 8).fill(0xCCCCCC).stroke({ width: 2, color: 0x333333 });
        const buttonText = new PIXI.Text({ text: text, style: this.buttonTextStyle }); buttonText.anchor.set(0.5); buttonText.position.set(width / 2, height / 2);
        buttonContainer.addChild(buttonBackground, buttonText);
        buttonContainer.eventMode = 'static'; buttonContainer.cursor = 'pointer';
        buttonContainer.on('pointerdown', (event: PIXI.FederatedPointerEvent) => { event.stopPropagation(); onClick(); }); // Keep stopPropagation
        this.stage.addChild(buttonContainer);
        return buttonContainer;
    }

    // updateCurrency, updateInventory, updatePlacementText methods remain exactly the same
    public updateCurrency(amount: number): void { this.currencyText.text = `Currency: $${amount}`; }
    public updateInventory(inventory: Inventory): void { const load = inventory.getLoad(); const capacity = inventory.getCapacity(); this.inventoryText.text = `Inventory: ${load} / ${capacity}`; }
    public updatePlacementText(message: string): void { this.placementText.text = message; }
}