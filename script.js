// --- Declaraciones de variables globales y constantes ---
let craftingData = {}; // craftingData ahora se declara vacía globalmente
const animalFeeds = [
  // Constante array con nombres de alimentos para animales
  "Chicken Feed",
  "Cow Feed",
  "Pig Feed",
  "Sheep Feed",
  "Goat Feed",
];
let requestedProducts = {}; // Objeto para almacenar productos solicitados y sus cantidades
let availableProductsList = []; // Array para almacenar la lista de productos disponibles
let ocultarCompletadosActivo = false; // Variable de estado para ocultar/mostrar completados, inicializada a false (mostrar)

// --- Función: loadCraftingData ---
// Carga los datos de crafting desde el archivo JSON 'crafting_data.json'
async function loadCraftingData() {
  try {
    const response = await fetch("crafting_data.json"); // Busca el archivo JSON usando fetch API
    if (!response.ok) {
      // Verifica si la respuesta HTTP indica un error
      throw new Error(`HTTP error! status: ${response.status}`); // Lanza un error si la respuesta no es exitosa
    }
    craftingData = await response.json(); // Parsea la respuesta JSON y la asigna a la variable craftingData
    availableProductsList = Object.keys(craftingData).sort(); // Obtiene las claves de craftingData (nombres de productos) y las ordena alfabéticamente, inicializando availableProductsList
    populateDropdown(availableProductsList); // Llama a la función populateDropdown para llenar el dropdown con la lista de productos disponibles
  } catch (error) {
    // Captura cualquier error ocurrido durante la carga o parseo del JSON
    console.error("Could not load crafting data:", error); // Imprime el error en la consola para debugging
    document.getElementById("output").innerHTML = // Modifica el contenido HTML del elemento con ID 'output'
      "<p>No se pudieron cargar los datos de productos. Por favor, revisa la consola para más detalles.</p>"; // Muestra un mensaje de error en la página web
  }
}

// --- Función: initializeProductList ---
// Inicializa la lista de productos cargando los datos de crafting al inicio
function initializeProductList() {
  loadCraftingData().then(() => { // Asegura que craftingData esté cargado antes de restaurar requestedProducts
      const storedRequestedProducts = loadDataFromLocalStorage('requestedProducts'); // Carga requestedProducts desde localStorage
      if (storedRequestedProducts) { // Si hay productos guardados en localStorage
          requestedProducts = storedRequestedProducts; // Restaura requestedProducts con los datos guardados
          updateRequestedProductDisplay(); // Actualiza la visualización con la lista cargada
          calculateIngredientsFromDynamicList(); // Recalcula los ingredientes basados en la lista cargada
      }
      const storedOcultarCompletadosActivo = loadDataFromLocalStorage('ocultarCompletadosActivo'); // Carga la preferencia desde localStorage
        if (storedOcultarCompletadosActivo !== null) { // Si la preferencia está guardada
            ocultarCompletadosActivo = storedOcultarCompletadosActivo; // Restaura el valor de ocultarCompletadosActivo
        }
        aplicarEstadoOcultarCompletados(); // Aplica el estado inicial de ocultar/mostrar completados
  });
}

// --- Función: populateDropdown ---
// Popula la lista dropdown en el HTML con la lista de productos proporcionada
function populateDropdown(products) {
  const dropdownList = document.getElementById("productDropdownList"); // Obtiene el elemento HTML del dropdown por su ID
  dropdownList.innerHTML = ""; // Limpia el contenido HTML actual del dropdown (para actualizar la lista)

  products.forEach((productName) => { // Itera sobre cada nombre de producto en el array 'products'
      const dropdownItem = document.createElement("div"); // Crea un nuevo elemento div para cada producto del dropdown
      dropdownItem.classList.add("dropdown-item"); // Añade la clase 'dropdown-item' al div para estilos CSS
      dropdownItem.textContent = productName; // Establece el texto del div como el nombre del producto
      dropdownItem.addEventListener("click", () => { // Añade un event listener para el evento 'click' en cada item del dropdown
          addProductToList(productName); // Llama a la función addProductToList con el nombre del producto al hacer click
          document.getElementById("productSearch").value = ""; // Limpia el valor del input de búsqueda de productos
          dropdownList.classList.remove("show"); // Remueve la clase 'show' del dropdown para ocultarlo después de la selección
      });
      dropdownList.appendChild(dropdownItem); // Añade el div del item del dropdown al dropdown list en el HTML
  });
}

// --- Función: filterDropdown ---
// Filtra los productos del dropdown basado en el texto de búsqueda del usuario
function filterDropdown() {
  const searchInput = document.getElementById("productSearch"); // Obtiene el elemento HTML del input de búsqueda por su ID
  const filterValue = searchInput.value.toLowerCase(); // Obtiene el valor del input de búsqueda y lo convierte a minúsculas
  const filteredProducts = availableProductsList.filter((product) => // Filtra la lista de productos disponibles
      product.toLowerCase().includes(filterValue) // Filtra los productos cuyo nombre (en minúsculas) incluye el valor de búsqueda (en minúsculas)
  );
  populateDropdown(filteredProducts); // Llama a populateDropdown para actualizar el dropdown con los productos filtrados
  document.getElementById("productDropdownList").classList.add("show"); // Añade la clase 'show' al dropdown para mostrarlo
}

// --- Función: showDropdown ---
// Muestra el dropdown list completo sin filtrar
function showDropdown() {
  const dropdownList = document.getElementById("productDropdownList"); // Obtiene el elemento HTML del dropdown por su ID
  populateDropdown(availableProductsList); // Llama a populateDropdown para llenar el dropdown con la lista completa de productos disponibles
  dropdownList.classList.add("show"); // Añade la clase 'show' al dropdown para mostrarlo
}

// --- Función: addProductToList ---
// Añade un producto a la lista de productos solicitados o incrementa su cantidad si ya existe
function addProductToList(productName) {
  if (requestedProducts[productName]) { // Verifica si el producto ya existe en el objeto requestedProducts
      requestedProducts[productName]++; // Incrementa la cantidad del producto si ya existe
  } else {
      requestedProducts[productName] = 1; // Inicializa la cantidad del producto a 1 si no existe
  }
  saveDataToLocalStorage('requestedProducts', requestedProducts); // Guarda requestedProducts en localStorage
  updateRequestedProductDisplay(); // Llama a updateRequestedProductDisplay para actualizar la visualización de la lista de productos solicitados
}

// --- Función: updateRequestedProductDisplay ---
// Actualiza la visualización HTML de la lista de productos solicitados
function updateRequestedProductDisplay() {
  const requestedListDiv = document.getElementById("requestedProductsList"); // Obtiene el elemento HTML donde se mostrará la lista de productos solicitados
  requestedListDiv.innerHTML = ""; // Limpia el contenido HTML actual de la lista de productos solicitados

  for (const productName in requestedProducts) { // Itera sobre cada producto en el objeto requestedProducts
      const quantity = requestedProducts[productName]; // Obtiene la cantidad del producto
      const listItem = document.createElement("div"); // Crea un nuevo div para cada item de producto solicitado
      listItem.classList.add("requested-item"); // Añade la clase 'requested-item' para estilos CSS

      const productNameSpan = document.createElement("span"); // Crea un elemento span para el nombre y cantidad del producto
      productNameSpan.textContent = `${quantity} ${productName} `; // Establece el texto del span con la cantidad y nombre del producto

      // Contenedor para los botones +/-
      const quantityButtons = document.createElement("div"); // Crea un div para contener los botones de cantidad
      quantityButtons.classList.add("quantity-buttons"); // Añade la clase 'quantity-buttons' para estilos CSS

      const decreaseButton = document.createElement("button"); // Crea un botón para decrementar la cantidad
      decreaseButton.textContent = "-"; // Establece el texto del botón como '-'
      decreaseButton.addEventListener("click", () => // Añade un event listener para el evento 'click' en el botón de decrementar
          changeQuantity(productName, -1) // Llama a la función changeQuantity con el nombre del producto y -1 para decrementar
      );

      const increaseButton = document.createElement("button"); // Crea un botón para incrementar la cantidad
      increaseButton.textContent = "+"; // Establece el texto del botón como '+'
      increaseButton.addEventListener("click", () => // Añade un event listener para el evento 'click' en el botón de incrementar
          changeQuantity(productName, 1) // Llama a la función changeQuantity con el nombre del producto y 1 para incrementar
      );

      quantityButtons.appendChild(decreaseButton); // Añade el botón de decrementar al contenedor de botones
      quantityButtons.appendChild(increaseButton); // Añade el botón de incrementar al contenedor de botones

      listItem.appendChild(productNameSpan); // Añade el span del nombre del producto al item de lista
      listItem.appendChild(quantityButtons); // Añade el contenedor de botones al item de lista
      requestedListDiv.appendChild(listItem); // Añade el item de lista al div de la lista de productos solicitados en el HTML
  }
}

// --- Función: changeQuantity ---
// Cambia la cantidad de un producto solicitado y actualiza la visualización
function changeQuantity(productName, change) {
  requestedProducts[productName] += change; // Modifica la cantidad del producto sumando el valor de 'change'
  if (requestedProducts[productName] <= 0) { // Si la cantidad del producto es menor o igual a 0 después del cambio
      delete requestedProducts[productName]; // Elimina el producto del objeto requestedProducts
  }
  saveDataToLocalStorage('requestedProducts', requestedProducts); // Guarda requestedProducts en localStorage
  updateRequestedProductDisplay(); // Llama a updateRequestedProductDisplay para actualizar la visualización de la lista de productos solicitados
}

// --- Función: calculateIngredientsFromDynamicList ---
// Calcula los ingredientes necesarios para los productos solicitados y muestra los pasos
function calculateIngredientsFromDynamicList() {
  if (Object.keys(requestedProducts).length === 0) { // Verifica si el objeto requestedProducts está vacío (no hay productos solicitados)
      document.getElementById("output").innerHTML = // Modifica el contenido HTML del elemento con ID 'output'
          "<p>Por favor, añade productos a tu lista.</p>"; // Muestra un mensaje pidiendo al usuario que añada productos
      return; // Sale de la función si no hay productos solicitados
  }

  const steps = calculateSteps(requestedProducts); // Llama a la función calculateSteps para obtener los pasos de crafting
  displaySteps(steps); // Llama a la función displaySteps para mostrar los pasos en la página web
}

// --- Función: calculateSteps ---
// Calcula los pasos de crafting recursivamente para los productos solicitados
function calculateSteps(requestedProducts) {
  let currentStepIngredients = { ...requestedProducts }; // Crea una copia del objeto requestedProducts para el paso actual
  let steps = []; // Array para almacenar los pasos de crafting
  let stepCount = 1; // Inicializa el contador de pasos
  let topLevelProducts = { ...requestedProducts }; // Copia de los productos solicitados inicialmente (no utilizada en la lógica actual)
  let baseIngredients = {}; // Objeto para almacenar los ingredientes base (sin receta)

  while (true) { // Bucle infinito que se rompe cuando no hay más productos que craftear en un paso
      let nextStepIngredients = {}; // Objeto para almacenar los ingredientes necesarios para el siguiente paso
      let stepCraftedIngredients = {}; // Objeto para almacenar los ingredientes crafteados en este paso
      let stepCraftedProductNames = []; // Array para almacenar los nombres de los productos crafteados en este paso
      let hasCraftedItemsInStep = false; // Bandera para indicar si hay items crafteados en este paso

      for (const productName in currentStepIngredients) { // Itera sobre cada producto en los ingredientes del paso actual
          let quantity = currentStepIngredients[productName]; // Obtiene la cantidad del producto
          let recipe = craftingData[productName]; // Busca la receta del producto en craftingData

          if (recipe && Object.keys(recipe).length > 0) { // Verifica si existe una receta para el producto y si no está vacía
              hasCraftedItemsInStep = true; // Marca que hay items crafteados en este paso
              stepCraftedProductNames.push(productName); // Añade el nombre del producto a la lista de productos crafteados en este paso
              for (const ingredient in recipe) { // Itera sobre cada ingrediente en la receta del producto
                  let ingredientQuantity = recipe[ingredient] * quantity; // Calcula la cantidad de ingrediente necesaria (cantidad de receta * cantidad de producto)
                  if (animalFeeds.includes(ingredient)) { // Verifica si el ingrediente es un alimento para animales (de la constante animalFeeds)
                      ingredientQuantity = Math.ceil(ingredientQuantity); // Redondea la cantidad de alimento para animales hacia arriba
                  }
                  stepCraftedIngredients[ingredient] = // Acumula la cantidad de ingrediente para este paso
                      (stepCraftedIngredients[ingredient] || 0) + ingredientQuantity; // Suma la cantidad actual a la cantidad acumulada (o inicializa a la cantidad si no existe)
                  nextStepIngredients[ingredient] = // Acumula la cantidad de ingrediente para el siguiente paso
                      (nextStepIngredients[ingredient] || 0) + ingredientQuantity; // Suma la cantidad actual a la cantidad acumulada para el siguiente paso
              }
          } else { // Si no hay receta para el producto (es un ingrediente base)
              let baseIngredientQuantity = quantity; // La cantidad de ingrediente base es la cantidad solicitada
              baseIngredientQuantity = Math.ceil(baseIngredientQuantity); // Redondea la cantidad del ingrediente base hacia arriba
              baseIngredients[productName] = // Acumula la cantidad del ingrediente base
                  (baseIngredients[productName] || 0) + baseIngredientQuantity; // Suma la cantidad actual a la cantidad acumulada (o inicializa si no existe)
          }
      }

      if (!hasCraftedItemsInStep) { // Si no hubo items crafteados en este paso, significa que ya llegamos a los ingredientes base
          break; // Sale del bucle while
      }

      let stepTitle = `Paso ${stepCount}`; // Crea el título del paso

      steps.push(formatIngredients(stepCraftedIngredients, stepTitle)); // Formatea los ingredientes crafteados en este paso y los añade al array de pasos
      stepCount++; // Incrementa el contador de pasos
      currentStepIngredients = nextStepIngredients; // El siguiente paso usa los ingredientes calculados para el paso actual
  }

  return steps; // Retorna el array de pasos calculados
}

// --- Función: formatIngredients ---
// Formatea un objeto de ingredientes en un string para mostrar en la UI
function formatIngredients(ingredients, stepTitle = "Step") {
  let formattedIngredients = ""; // Inicializa un string vacío para almacenar los ingredientes formateados
  for (const ingredient in ingredients) { // Itera sobre cada ingrediente en el objeto 'ingredients'
      formattedIngredients += `${ingredients[ingredient]}\t${ingredient}\n`; // Añade al string formateado la cantidad, tabulador y nombre del ingrediente, seguido de un salto de línea
  }
  return { title: stepTitle, ingredients: formattedIngredients }; // Retorna un objeto con el título del paso y el string de ingredientes formateado
}

// --- Función: displaySteps ---
// Muestra los pasos de crafting en la página web
function displaySteps(steps) {
  let outputHTML = ""; // Inicializa un string vacío para construir el HTML de salida
  const reversedSteps = steps.reverse(); // Invierte el array de pasos para mostrar el último paso primero

  outputHTML += `<div id="output-header">`; // Nuevo contenedor para el encabezado (botón)
  outputHTML += `     <div id="toggleCompletedSteps-container">`; // Contenedor para el botón "Ocultar Completados"
  outputHTML += `         <button id="toggleCompletedSteps">Ocultar Completados</button>`; // Botón "Ocultar Completados"
  outputHTML += `     </div>`; // Cierre del contenedor del botón
  outputHTML += `</div>`; // Cierre del contenedor del encabezado

  outputHTML += `<div id="steps-container">`; // Contenedor para los pasos

  for (let i = 0; i < reversedSteps.length; i++) { // Itera sobre cada paso en el array reversedSteps
      const step = reversedSteps[i]; // Obtiene el paso actual
      const stepNumber = i + 1; // Calcula el número del paso (basado en el índice)
      outputHTML += `<div class="step" id="step-${stepNumber}">
                       <div class="step-title">Paso ${stepNumber}</div>
                       <ul class="ingredients-list">`; // Cambiado a ul para mejor estructura

      const ingredientsArray = step.ingredients.trim().split('\n'); // Divide el string de ingredientes del paso en un array de líneas

      ingredientsArray.forEach((ingredientLine) => { // Itera sobre cada línea de ingrediente
          if (ingredientLine) { // Asegura que la línea no esté vacía
              const parts = ingredientLine.split('\t'); // Divide la línea de ingrediente en cantidad y nombre usando el tabulador como separador
              const quantityNeeded = parseInt(parts[0]); // Extrae la cantidad necesaria y la convierte a número entero
              const ingredientName = parts[1]; // Extrae el nombre del ingrediente

              if (ingredientName) { // Asegura que haya un nombre de ingrediente
                  outputHTML += `<li class="ingredient-item" data-ingredient="${ingredientName}" data-quantity-needed="${quantityNeeded}">
                                       <span class="ingredient-name">${quantityNeeded} ${ingredientName}</span>
                                       <input type="number" class="quantity-input" placeholder="0" min="0" max="${quantityNeeded}">
                                   </li>`; // Añade un elemento li para cada ingrediente con su nombre, cantidad necesaria y un input numérico
              }
          }
      });

      outputHTML += `</ul></div>`; // Cierre de ul e ingredient-list
  }
  outputHTML += `</div>`; // Cierre del contenedor de pasos

  document.getElementById("output").innerHTML = outputHTML; // Establece el HTML del elemento 'output' con el HTML construido

  // --- Event listener para el botón "Ocultar Completados" ---
  // Añade funcionalidad al botón "Ocultar Completados" para cambiar la visibilidad de los pasos completados
  document
      .getElementById("toggleCompletedSteps") // Obtiene el elemento del botón por su ID
      .addEventListener("click", toggleCompletedSteps); // Añade event listener para el evento 'click' para llamar a la función toggleCompletedSteps

  // --- Event listeners para los campos de entrada de cantidad ---
  // Añade funcionalidad a cada campo de entrada de cantidad para marcar ingredientes como completados
  const inputFields = document.querySelectorAll(".quantity-input"); // Selecciona todos los elementos input con la clase 'quantity-input'
  inputFields.forEach((input) => { // Itera sobre cada input field
      input.addEventListener("change", handleQuantityInput); // Añade event listener para el evento 'change' para llamar a la función handleQuantityInput al cambiar el valor
  });

  inputFields.forEach((input) => {
    const ingredientItem = input.closest(".ingredient-item");
    const ingredientName = ingredientItem.dataset.ingredient; // Obtiene el nombre del ingrediente
    const stepNumberElement = input.closest(".step"); // Encuentra el elemento padre .step
    const stepNumber = stepNumberElement ? stepNumberElement.id.split('-')[1] : 'unknown'; // Extrae el número de paso del ID

    const localStorageKeyQuantity = `step-${stepNumber}-ingredient-${ingredientName}-quantity`; // Clave para la cantidad guardada
    const localStorageKeyCompleted = `step-${stepNumber}-ingredient-${ingredientName}-completed`; // Clave para el estado "completado"

    const storedQuantity = loadDataFromLocalStorage(localStorageKeyQuantity); // Carga la cantidad guardada desde localStorage
    const storedCompleted = loadDataFromLocalStorage(localStorageKeyCompleted); // Carga el estado "completado" desde localStorage


    if (storedQuantity !== null) { // Si hay una cantidad guardada
        input.value = storedQuantity; // Restaura el valor del input con la cantidad guardada
    }
    if (storedCompleted === true) { // Si el estado "completado" es true
        ingredientItem.classList.add("completed"); // Añade la clase "completed" al item
    }
});

  aplicarEstadoOcultarCompletados(); // Aplica el estado inicial de ocultar/mostrar completados al cargar los pasos
}

// --- Función: toggleCompletedSteps ---
// Cambia el estado de 'ocultarCompletadosActivo' y aplica el estado visual
function toggleCompletedSteps() {
  ocultarCompletadosActivo = !ocultarCompletadosActivo; // Invierte el valor de la variable global ocultarCompletadosActivo (true a false, o false a true)
  saveDataToLocalStorage('ocultarCompletadosActivo', ocultarCompletadosActivo); // Guarda el estado de ocultarCompletadosActivo
  aplicarEstadoOcultarCompletados(); // Llama a la función aplicarEstadoOcultarCompletados para actualizar la visualización basada en el nuevo estado
}

// --- Función: aplicarEstadoOcultarCompletados ---
// Aplica el estado de ocultar/mostrar ingredientes completados visualmente
function aplicarEstadoOcultarCompletados() {
  const ingredientesCompletados = document.querySelectorAll(".ingredient-item.completed");// Selecciona todos los elementos con clase 'ingredient-item' y 'completed'
  const button = document.getElementById("toggleCompletedSteps"); // Obtiene el elemento del botón "Ocultar Completados" por su ID

  if (ocultarCompletadosActivo) { // Verifica si la variable ocultarCompletadosActivo es true (modo "Ocultar Completados" activado)
      // Si ocultarCompletadosActivo es true, Ocultar completados
      button.textContent = "Mostrar Completados"; // Cambia el texto del botón a "Mostrar Completados" para indicar la acción al hacer click
      ingredientesCompletados.forEach((item) => { // Itera sobre cada ingrediente completado
          item.classList.add("hidden"); // Añade la clase 'hidden' para ocultar visualmente el ingrediente completado
      });
  } else { // Si ocultarCompletadosActivo es false (modo "Mostrar Completados" activado)
      // Si ocultarCompletadosActivo es false, Mostrar completados
      button.textContent = "Ocultar Completados"; // Cambia el texto del botón a "Ocultar Completados" para indicar la acción al hacer click
      ingredientesCompletados.forEach((item) => { // Itera sobre cada ingrediente completado
          item.classList.remove("hidden"); // Remueve la clase 'hidden' para mostrar visualmente el ingrediente completado
      });
  }
}

// --- Función: handleQuantityInput ---
// Maneja el evento 'change' en los inputs de cantidad de ingredientes
function handleQuantityInput(event) {
  const inputField = event.target; // Obtiene el elemento input que disparó el evento
  const enteredQuantity = parseInt(inputField.value); // Obtiene el valor del input y lo convierte a número entero
  const ingredientItem = inputField.closest(".ingredient-item"); // Encuentra el elemento padre <li> con la clase 'ingredient-item'
  const quantityNeeded = parseInt(ingredientItem.dataset.quantityNeeded); // Obtiene la cantidad necesaria del atributo 'data-quantity-needed' del elemento <li>
  const ingredientName = ingredientItem.dataset.ingredient; // Obtiene el nombre del ingrediente
  const stepNumberElement = inputField.closest(".step"); // Encuentra el elemento padre .step
  const stepNumber = stepNumberElement ? stepNumberElement.id.split('-')[1] : 'unknown'; // Extrae el número de paso del ID

  const localStorageKeyQuantity = `step-${stepNumber}-ingredient-${ingredientName}-quantity`; // Clave para guardar la cantidad
  const localStorageKeyCompleted = `step-${stepNumber}-ingredient-${ingredientName}-completed`; // Clave para guardar el estado "completado"

  saveDataToLocalStorage(localStorageKeyQuantity, enteredQuantity); // Guarda la cantidad en localStorage

  if (enteredQuantity === quantityNeeded) { // Verifica si la cantidad introducida es igual a la cantidad necesaria
      ingredientItem.classList.add("completed"); // Añade la clase 'completed' al item de ingrediente para marcarlo como completado visualmente
      saveDataToLocalStorage(localStorageKeyCompleted, true); // Guarda el estado "completado" en localStorage
      if (ocultarCompletadosActivo) { //  <--  Verifica si "ocultar completados" está activo
          ingredientItem.classList.add("hidden"); //  <--  Oculta el nuevo ingrediente completado si está activo
      }
      // ELIMINADA la línea inputField.disabled = true; // Deshabilita el campo de entrada (innecesario ahora)
  } else if (enteredQuantity > quantityNeeded) { // Si la cantidad introducida es mayor que la necesaria
      inputField.value = quantityNeeded; // Corrige el valor del input a la cantidad necesaria (máximo permitido)
      saveDataToLocalStorage(localStorageKeyQuantity, quantityNeeded); // Asegura guardar la cantidad corregida
  } else { // Si la cantidad introducida es menor que la necesaria
      ingredientItem.classList.remove("completed"); // Remueve la clase 'completed' para desmarcar el ingrediente como no completado
      saveDataToLocalStorage(localStorageKeyCompleted, false); // Guarda el estado "no completado"
      ingredientItem.classList.remove('hidden'); // Asegura que se muestre si se desmarca y estaba oculto
      // ELIMINADA la línea inputField.disabled = false; // Habilita el campo de entrada nuevamente (innecesario ahora)
  }
}

// --- Función auxiliar: saveDataToLocalStorage ---
// Guarda un valor en localStorage bajo una clave específica
function saveDataToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value)); // Convierte el valor a JSON string y lo guarda
}

// --- Función auxiliar: loadDataFromLocalStorage ---
// Carga un valor desde localStorage usando una clave específica
function loadDataFromLocalStorage(key) {
  const storedValue = localStorage.getItem(key); // Obtiene el valor de localStorage usando la clave
  return storedValue ? JSON.parse(storedValue) : null; // Si existe valor, lo parsea de JSON a objeto; si no, retorna null
}

// --- Event Listener: DOMContentLoaded ---
// Asegura que el script se ejecute solo después de que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", initializeProductList); // Añade event listener para el evento 'DOMContentLoaded' para llamar a initializeProductList cuando el DOM esté listo

// --- Event Listener: click en document ---
// Oculta el dropdown list cuando se hace click fuera del dropdown o del input de búsqueda
document.addEventListener("click", function (event) { // Añade event listener para el evento 'click' en todo el documento
    const dropdownList = document.getElementById("productDropdownList"); // Obtiene el elemento HTML del dropdown por su ID
    const searchInput = document.getElementById("productSearch"); // Obtiene el elemento HTML del input de búsqueda por su ID
    if (!dropdownList.contains(event.target) && event.target !== searchInput) { // Verifica si el elemento clickeado NO está dentro del dropdown list Y NO es el input de búsqueda
        dropdownList.classList.remove("show"); // Remueve la clase 'show' del dropdown para ocultarlo
    }
});

// --- Event Listener: focus en productSearch ---
// Muestra el dropdown list cuando el input de búsqueda de productos recibe el foco
document
    .getElementById("productSearch") // Obtiene el elemento del input de búsqueda por su ID
    .addEventListener("focus", showDropdown); // Añade event listener para el evento 'focus' para llamar a la función showDropdown cuando el input recibe el foco