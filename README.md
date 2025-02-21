# # Fancy Calculator

This project is a web-based tool designed to help users calculate the ingredients needed for crafting recipes in games or other applications.

**Key Features:**
*   **Dynamic Product List:**  Users can search and select products from a dropdown list populated from a `crafting_data.json` file.
*   **Requested Product Management:**  Users can add products to a "requested products" list and specify quantities.
*   **Step-by-Step Ingredient Calculation:** The application automatically calculates and displays the crafting steps required to produce the requested products.
*   **Completed Step Tracking:**  Ingredients in each step are marked as "completed" when the input quantity matches the required quantity.
*   **Hide/Show Completed Steps:**  A toggle button allows users to hide or show completed steps, providing a cleaner view of remaining tasks. This state is persistent, meaning new steps completed will automatically be hidden if the "Hide Completed" mode is active.


**How to Use:**
1.  **Select Products:** Use the search input to find and select the products you want to craft from the dropdown list.
2.  **Specify Quantities:**  Adjust the quantities of the selected products in the "Requested Products" list using the "+" and "-" buttons.
3.  **Calculate Ingredients:** Click the button to calculate the crafting steps. The required ingredients will be displayed step-by-step.
4.  **Track Progress:**  As you gather ingredients, input the quantities you have in the input fields next to each ingredient. Ingredients will be marked as completed when you have enough.
5.  **Hide Completed Steps (Optional):** Use the "Ocultar Completados" button to hide steps where all ingredients are completed for a focused view.

**Data Source:**
The crafting recipes and product data are loaded from the `crafting_data.json` file.  You can modify this file to customize the calculator for different crafting systems.

**Technologies Used:**
*   HTML
*   CSS
*   JavaScript

This project aims to simplify crafting calculations and provide a user-friendly interface for managing crafting tasks.