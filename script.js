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
let ocultarCompletadosActivo = false; // Variable de estado para ocultar/mostrar completados, inicializada a false (mostrar)

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

    // Contenedor para los botones +/-
    const quantityButtons = document.createElement("div");
    quantityButtons.classList.add("quantity-buttons");

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

    quantityButtons.appendChild(decreaseButton);
    quantityButtons.appendChild(increaseButton);

    listItem.appendChild(productNameSpan);
    listItem.appendChild(quantityButtons); // Añade el contenedor de botones al listItem
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
  const reversedSteps = steps.reverse();

  outputHTML += `<div id="output-header">`; // Nuevo contenedor para el encabezado (botón)
  outputHTML += `   <div id="toggleCompletedSteps-container">`; // Contenedor para el botón "Ocultar Completados"
  outputHTML += `       <button id="toggleCompletedSteps">Ocultar Completados</button>`; // Botón "Ocultar Completados"
  outputHTML += `   </div>`; // Cierre del contenedor del botón
  outputHTML += `</div>`; // Cierre del contenedor del encabezado

  outputHTML += `<div id="steps-container">`; // Contenedor para los pasos

  for (let i = 0; i < reversedSteps.length; i++) {
    const step = reversedSteps[i];
    const stepNumber = i + 1;
    outputHTML += `<div class="step" id="step-${stepNumber}">
                       <div class="step-title">Paso ${stepNumber}</div>
                       <ul class="ingredients-list">`; // Cambiado a ul para mejor estructura

    const ingredientsArray = step.ingredients.trim().split("\n"); // Divide ingredientes en líneas

    ingredientsArray.forEach((ingredientLine) => {
      if (ingredientLine) {
        // Asegura que la línea no esté vacía
        const parts = ingredientLine.split("\t"); // Asume que la cantidad y el nombre están separados por tabulación
        const quantityNeeded = parseInt(parts[0]); // Extrae cantidad necesaria
        const ingredientName = parts[1]; // Extrae nombre del ingrediente

        if (ingredientName) {
          // Asegura que haya un nombre de ingrediente
          outputHTML += `<li class="ingredient-item" data-ingredient="${ingredientName}" data-quantity-needed="${quantityNeeded}">
                                   <span class="ingredient-name">${quantityNeeded} ${ingredientName}</span>
                                   <input type="number" class="quantity-input" placeholder="0" min="0" max="${quantityNeeded}">
                                 </li>`;
        }
      }
    });

    outputHTML += `</ul></div>`; // Cierre de ul e ingredient-list
  }
  outputHTML += `</div>`; // Cierre del contenedor de pasos

  document.getElementById("output").innerHTML = outputHTML;

  // Event listener para el botón "Ocultar Completados" DESPUÉS de que se ha añadido al DOM
  document
    .getElementById("toggleCompletedSteps")
    .addEventListener("click", toggleCompletedSteps);

  // Event listeners para los campos de entrada DESPUÉS de que se han añadido al DOM
  const inputFields = document.querySelectorAll(".quantity-input");
  inputFields.forEach((input) => {
    input.addEventListener("change", handleQuantityInput);
  });
  aplicarEstadoOcultarCompletados();
}

function toggleCompletedSteps() {
  ocultarCompletadosActivo = !ocultarCompletadosActivo; // Cambia el estado global

  aplicarEstadoOcultarCompletados(); // Aplica el estado actual
}

function aplicarEstadoOcultarCompletados() {
  const ingredientesCompletados = document.querySelectorAll(
    ".ingredient-item.completed"
  );
  const button = document.getElementById("toggleCompletedSteps");

  if (ocultarCompletadosActivo) {
    // Si ocultarCompletadosActivo es true, Ocultar completados
    button.textContent = "Mostrar Completados"; // Actualiza el texto del botón para reflejar la acción de "mostrar"
    ingredientesCompletados.forEach((item) => {
      item.classList.add("hidden");
    });
  } else {
    // Si ocultarCompletadosActivo es false, Mostrar completados
    button.textContent = "Ocultar Completados"; // Actualiza el texto del botón para reflejar la acción de "ocultar"
    ingredientesCompletados.forEach((item) => {
      item.classList.remove("hidden");
    });
  }
}

function handleQuantityInput(event) {
  const inputField = event.target;
  const enteredQuantity = parseInt(inputField.value);
  const ingredientItem = inputField.closest(".ingredient-item"); // Encuentra el <li> padre
  const quantityNeeded = parseInt(ingredientItem.dataset.quantityNeeded); // Obtiene la cantidad necesaria del data-attribute

  if (enteredQuantity === quantityNeeded) {
    ingredientItem.classList.add("completed"); // Marca el ingrediente como completado
    if (ocultarCompletadosActivo) {
      //  <--  Verifica si "ocultar completados" está activo
      ingredientItem.classList.add("hidden"); //  <--  Oculta el nuevo ingrediente completado si está activo
    }
    // ELIMINADA la línea inputField.disabled = true; // Deshabilita el campo de entrada
  } else if (enteredQuantity > quantityNeeded) {
    inputField.value = quantityNeeded; // Corrige si se introduce un valor mayor al máximo
  } else {
    ingredientItem.classList.remove("completed"); // Desmarca si se corrige la cantidad
    // ELIMINADA la línea inputField.disabled = false; // Habilita el campo de entrada nuevamente (innecesario ahora)
  }
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
