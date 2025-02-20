let craftingData = {}; // craftingData ahora se declara vacía globalmente
const animalFeeds = [
  "Chicken Feed",
  "Cow Feed",
  "Pig Feed",
  "Sheep Feed",
  "Goat Feed",
];
let requestedProducts = {};
let availableProductsList = [];

async function loadCraftingData() {
  try {
    const response = await fetch("crafting_data.json"); // Busca el archivo JSON
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    craftingData = await response.json(); // Parsea el JSON y asigna a craftingData
    availableProductsList = Object.keys(craftingData).sort(); // Inicializa la lista de productos AHORA
    populateDropdown(availableProductsList); // Popula el dropdown AHORA
  } catch (error) {
    console.error("Could not load crafting data:", error);
    document.getElementById("output").innerHTML =
      "<p>No se pudieron cargar los datos de productos. Por favor, revisa la consola para más detalles.</p>";
  }
}

function initializeProductList() {
  loadCraftingData(); // Carga los datos JSON al inicio
}

function populateDropdown(products) {
  const dropdownList = document.getElementById("productDropdownList");
  dropdownList.innerHTML = "";

  products.forEach((productName) => {
    const dropdownItem = document.createElement("div");
    dropdownItem.classList.add("dropdown-item");
    dropdownItem.textContent = productName;
    dropdownItem.addEventListener("click", () => {
      addProductToList(productName);
      document.getElementById("productSearch").value = "";
      dropdownList.classList.remove("show");
    });
    dropdownList.appendChild(dropdownItem);
  });
}

function filterDropdown() {
  const searchInput = document.getElementById("productSearch");
  const filterValue = searchInput.value.toLowerCase();
  const filteredProducts = availableProductsList.filter((product) =>
    product.toLowerCase().includes(filterValue)
  );
  populateDropdown(filteredProducts);
  document.getElementById("productDropdownList").classList.add("show");
}

function showDropdown() {
  const dropdownList = document.getElementById("productDropdownList");
  populateDropdown(availableProductsList);
  dropdownList.classList.add("show");
}

function addProductToList(productName) {
  if (requestedProducts[productName]) {
    requestedProducts[productName]++;
  } else {
    requestedProducts[productName] = 1;
  }
  updateRequestedProductDisplay();
}

function updateRequestedProductDisplay() {
  const requestedListDiv = document.getElementById("requestedProductsList");
  requestedListDiv.innerHTML = "";

  for (const productName in requestedProducts) {
    const quantity = requestedProducts[productName];
    const listItem = document.createElement("div");
    listItem.classList.add("requested-item");

    const productNameSpan = document.createElement("span");
    productNameSpan.textContent = `${quantity} ${productName} `;

    const decreaseButton = document.createElement("button");
    decreaseButton.textContent = "-";
    decreaseButton.addEventListener("click", () =>
      changeQuantity(productName, -1)
    );

    const increaseButton = document.createElement("button");
    increaseButton.textContent = "+";
    increaseButton.addEventListener("click", () =>
      changeQuantity(productName, 1)
    );

    listItem.appendChild(productNameSpan);
    listItem.appendChild(decreaseButton);
    listItem.appendChild(increaseButton);
    requestedListDiv.appendChild(listItem);
  }
}

function changeQuantity(productName, change) {
  requestedProducts[productName] += change;
  if (requestedProducts[productName] <= 0) {
    delete requestedProducts[productName];
  }
  updateRequestedProductDisplay();
}

function calculateIngredientsFromDynamicList() {
  if (Object.keys(requestedProducts).length === 0) {
    document.getElementById("output").innerHTML =
      "<p>Por favor, añade productos a tu lista.</p>";
    return;
  }

  const steps = calculateSteps(requestedProducts);
  displaySteps(steps);
}

function calculateSteps(requestedProducts) {
  let currentStepIngredients = { ...requestedProducts };
  let steps = [];
  let stepCount = 1;
  let topLevelProducts = { ...requestedProducts };
  let baseIngredients = {};

  while (true) {
    let nextStepIngredients = {};
    let stepCraftedIngredients = {};
    let stepCraftedProductNames = [];
    let hasCraftedItemsInStep = false;

    for (const productName in currentStepIngredients) {
      let quantity = currentStepIngredients[productName];
      let recipe = craftingData[productName];

      if (recipe && Object.keys(recipe).length > 0) {
        hasCraftedItemsInStep = true;
        stepCraftedProductNames.push(productName);
        for (const ingredient in recipe) {
          let ingredientQuantity = recipe[ingredient] * quantity;
          if (animalFeeds.includes(ingredient)) {
            ingredientQuantity = Math.ceil(ingredientQuantity);
          }
          stepCraftedIngredients[ingredient] =
            (stepCraftedIngredients[ingredient] || 0) + ingredientQuantity;
          nextStepIngredients[ingredient] =
            (nextStepIngredients[ingredient] || 0) + ingredientQuantity;
        }
      } else {
        let baseIngredientQuantity = quantity;
        baseIngredientQuantity = Math.ceil(baseIngredientQuantity);
        baseIngredients[productName] =
          (baseIngredients[productName] || 0) + baseIngredientQuantity;
      }
    }

    if (!hasCraftedItemsInStep) {
      break;
    }

    let stepTitle = `Paso ${stepCount}`;

    steps.push(formatIngredients(stepCraftedIngredients, stepTitle));
    stepCount++;
    currentStepIngredients = nextStepIngredients;
  }

  return steps;
}

function formatIngredients(ingredients, stepTitle = "Step") {
  let formattedIngredients = "";
  for (const ingredient in ingredients) {
    formattedIngredients += `${ingredients[ingredient]}\t${ingredient}\n`;
  }
  return { title: stepTitle, ingredients: formattedIngredients };
}

function displaySteps(steps) {
  let outputHTML = "";
  // Invierte el array de pasos aquí
  const reversedSteps = steps.reverse();

  for (let i = 0; i < reversedSteps.length; i++) {
    const step = reversedSteps[i];
    // Actualiza el título del paso para que refleje el orden inverso
    const stepNumber = i + 1;
    outputHTML += `<div class="step">
                         <div class="step-title">Paso ${stepNumber}</div>
                         <pre>${step.ingredients}</pre>
                       </div>`;
  }
  document.getElementById("output").innerHTML = outputHTML;
}

document.addEventListener("DOMContentLoaded", initializeProductList);

document.addEventListener("click", function (event) {
  const dropdownList = document.getElementById("productDropdownList");
  const searchInput = document.getElementById("productSearch");
  if (!dropdownList.contains(event.target) && event.target !== searchInput) {
    dropdownList.classList.remove("show");
  }
});

document
  .getElementById("productSearch")
  .addEventListener("focus", showDropdown);
