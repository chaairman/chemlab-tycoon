// src/UIManager.ts

import * as PIXI from 'pixi.js';
import { Inventory } from './Inventory';
// Import specific types from GameManager if needed, or use generic functions
// For now, we'll define the function types directly in the constructor signature

/**
 * Type definition for the function signature expected for button click handlers.
 * Takes no arguments and returns void.
 */
type ButtonClickHandler = () => void;

/**
 * Manages the creation, positioning, and updating of UI elements
 * rendered directly onto the Pixi.js stage.
 */
export class UIManager { // Ensure 'export' is here
    private stage: PIXI.Container;
    private currencyText: PIXI.Text;
    private inventoryText: PIXI.Text;
    private textStyle: PIXI.TextStyle;
    private buttonTextStyle: PIXI.TextStyle; // Style for button text

    /**
     * Initializes the UIManager.
     * @param stage - The main PIXI.Container to add UI elements to.
     * @param onBuyChemicalAClick - Callback function executed when the "Buy A" button is clicked.
     * @param onSellProductBClick - Callback function executed when the "Sell B" button is clicked.
     */
    constructor(
        stage: PIXI.Container,
        onBuyChemicalAClick: ButtonClickHandler, // Receive callback for Buy A
        onSellProductBClick: ButtonClickHandler  // Receive callback for Sell B
    ) {
        this.stage = stage;

        // --- Text Styles ---
        this.textStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff, // White color
            stroke: { color: 0x000000, width: 4 }, // Black outline
            align: 'left',
        });

        // Slightly smaller style for button text
        this.buttonTextStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0x000000, // Black color for text on button
            align: 'center',
        });


        // --- Info Text Elements ---
        this.currencyText = new PIXI.Text({ text: 'Currency: $---', style: this.textStyle });
        this.inventoryText = new PIXI.Text({ text: 'Inventory: -/-', style: this.textStyle });

        this.currencyText.position.set(10, 10);
        this.inventoryText.position.set(10, 40); // Position below currency

        this.stage.addChild(this.currencyText);
        this.stage.addChild(this.inventoryText);


        // --- Button Elements ---
        // Define button properties
        const buttonWidth = 180;
        const buttonHeight = 40;
        const buttonPadding = 10;
        const startY = this.inventoryText.y + this.inventoryText.height + buttonPadding * 2; // Position buttons below inventory text

        // Create "Buy Raw Chemical A" Button
        this.createButton(
            'Buy Raw A ($10)',      // Button Text
            10,                     // X position
            startY,                 // Y position
            buttonWidth,
            buttonHeight,
            onBuyChemicalAClick     // Action to perform on click
        );

        // Create "Sell Product B" Button
        this.createButton(
            'Sell Product B ($25)', // Button Text
            10 + buttonWidth + buttonPadding, // Position next to the first button
            startY,                 // Y position (same row)
            buttonWidth,
            buttonHeight,
            onSellProductBClick     // Action to perform on click
        );

        console.log("UIManager initialized with buttons.");
    }

    /**
     * Creates a visual button with text and attaches a click handler.
     * @param text - The text to display on the button.
     * @param x - The x position of the button container.
     * @param y - The y position of the button container.
     * @param width - The width of the button background.
     * @param height - The height of the button background.
     * @param onClick - The function to call when the button is clicked.
     * @returns The PIXI.Container representing the button.
     */
    private createButton(text: string, x: number, y: number, width: number, height: number, onClick: ButtonClickHandler): PIXI.Container {
        // Create a container to hold the button graphics and text
        const buttonContainer = new PIXI.Container();
        buttonContainer.position.set(x, y);

        // Create the button background graphic (a rounded rectangle)
        const buttonBackground = new PIXI.Graphics();
        buttonBackground.roundRect(0, 0, width, height, 8); // x, y, width, height, radius
        buttonBackground.fill(0xCCCCCC); // Light grey background
        buttonBackground.stroke({ width: 2, color: 0x333333 }); // Dark border

        // Create the text label for the button
        const buttonText = new PIXI.Text({ text: text, style: this.buttonTextStyle });
        // Center the text within the button
        buttonText.anchor.set(0.5); // Set anchor to the center of the text
        buttonText.position.set(width / 2, height / 2); // Position text in the middle of the background

        // Add background and text to the container
        buttonContainer.addChild(buttonBackground);
        buttonContainer.addChild(buttonText);

        // Make the button interactive
        buttonContainer.eventMode = 'static'; // Recommended event mode for buttons
        buttonContainer.cursor = 'pointer';  // Show pointer cursor on hover

        // Attach the click handler
        buttonContainer.on('pointerdown', onClick); // Execute the passed function on click

        // Add the button container to the main stage
        this.stage.addChild(buttonContainer);

        console.log(`Button created: "${text}" at (${x}, ${y})`);
        return buttonContainer;
    }


    /** Updates the displayed currency value. */
    public updateCurrency(amount: number): void {
        this.currencyText.text = `Currency: $${amount}`;
    }

    /** Updates the displayed inventory status. */
    public updateInventory(inventory: Inventory): void {
        const load = inventory.getLoad();
        const capacity = inventory.getCapacity();
        this.inventoryText.text = `Inventory: ${load} / ${capacity}`;
    }
} // Ensure closing brace is present