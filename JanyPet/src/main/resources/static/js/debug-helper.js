// Debug Helper - Adicione este arquivo ao seu projeto para ajudar a diagnosticar problemas

document.addEventListener("DOMContentLoaded", () => {
  console.log("Debug Helper loaded")

  // Verificar se o botão de adicionar produto existe
  const addProductBtn = document.getElementById("add-product-btn")
  if (addProductBtn) {
    console.log("Add product button found:", addProductBtn)

    // Adicionar um event listener direto para teste
    addProductBtn.addEventListener("click", () => {
      console.log("Add product button clicked directly from debug helper")

      // Verificar se o modal existe
      const productModal = document.getElementById("product-modal")
      if (productModal) {
        console.log("Product modal found:", productModal)
        productModal.style.display = "block"
      } else {
        console.error("Product modal not found with ID 'product-modal'")
      }
    })
  } else {
    console.error("Add product button not found with ID 'add-product-btn'")

    // Listar todos os botões na página para ajudar a identificar o correto
    console.log("All buttons on page:")
    document.querySelectorAll("button").forEach((btn, index) => {
      console.log(`Button ${index}:`, btn.outerHTML)
    })
  }

  // Verificar se o modal de produto existe
  const productModal = document.getElementById("product-modal")
  if (productModal) {
    console.log("Product modal found:", productModal)
  } else {
    console.error("Product modal not found with ID 'product-modal'")
  }

  // Verificar se o Quill está disponível
  let Quill // Declare Quill here
  if (typeof Quill !== "undefined") {
    console.log("Quill is available")
  } else {
    console.error("Quill is not defined. Make sure the Quill library is loaded.")
  }

  // Adicionar um botão de emergência para abrir o modal
  const emergencyButton = document.createElement("button")
  emergencyButton.textContent = "Abrir Modal de Produto (Emergência)"
  emergencyButton.style.position = "fixed"
  emergencyButton.style.bottom = "10px"
  emergencyButton.style.right = "10px"
  emergencyButton.style.zIndex = "9999"
  emergencyButton.style.padding = "10px"
  emergencyButton.style.backgroundColor = "#ff5722"
  emergencyButton.style.color = "white"
  emergencyButton.style.border = "none"
  emergencyButton.style.borderRadius = "4px"
  emergencyButton.style.cursor = "pointer"

  emergencyButton.addEventListener("click", () => {
    console.log("Emergency button clicked")
    const productModal = document.getElementById("product-modal")
    if (productModal) {
      productModal.style.display = "block"
    } else {
      alert("Modal de produto não encontrado!")
    }
  })

  document.body.appendChild(emergencyButton)
})

// Função para verificar IDs duplicados na página
function checkDuplicateIds() {
  const elements = document.querySelectorAll("[id]")
  const ids = {}

  elements.forEach((element) => {
    const id = element.id
    if (ids[id]) {
      console.error(`Duplicate ID found: ${id}`, element, ids[id])
    } else {
      ids[id] = element
    }
  })

  console.log("ID check complete. Any duplicates will be shown as errors above.")
}

// Executar verificação de IDs duplicados após o carregamento da página
document.addEventListener("DOMContentLoaded", () => {
  // Aguardar um pouco para garantir que todos os scripts foram carregados
  setTimeout(checkDuplicateIds, 1000)
})

// Adicionar ao objeto window para chamar do console
window.debugHelpers = {
  checkDuplicateIds,
  openProductModal: () => {
    const productModal = document.getElementById("product-modal")
    if (productModal) {
      productModal.style.display = "block"
    } else {
      console.error("Product modal not found")
    }
  },
  listAllModals: () => {
    console.log("All elements with class 'modal':")
    document.querySelectorAll(".modal").forEach((modal, index) => {
      console.log(`Modal ${index}:`, modal)
    })
  },
}
