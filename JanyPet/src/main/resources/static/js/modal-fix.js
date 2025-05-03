// Modal Fix - Corrige problemas com os modais

document.addEventListener("DOMContentLoaded", () => {
    console.log("Modal Fix loaded")
  
    // Garantir que o botão de adicionar produto funcione
    const addProductBtn = document.getElementById("add-product-btn")
    if (addProductBtn) {
      addProductBtn.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log("Add product button clicked from modal-fix.js")
  
        const productModal = document.getElementById("product-modal")
        if (productModal) {
          // Resetar o formulário
          const productForm = document.getElementById("product-basic-form")
          if (productForm) productForm.reset()
  
          // Limpar o ID do produto (para modo de adição)
          const productIdInput = document.getElementById("product-id")
          if (productIdInput) productIdInput.value = ""
  
          // Atualizar o título do modal
          const modalTitle = document.getElementById("modal-title")
          if (modalTitle) modalTitle.textContent = "Thêm sản phẩm mới"
  
          // Exibir o modal
          productModal.style.display = "block"
        } else {
          console.error("Product modal not found")
          alert("Erro: Modal de produto não encontrado. Verifique o console para mais detalhes.")
        }
      })
    }
  
    // Garantir que os botões de fechar o modal funcionem
    document.querySelectorAll(".close, #cancel-btn, #delete-cancel-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".modal").forEach((modal) => {
          modal.style.display = "none"
        })
      })
    })
  
    // Fechar modais ao clicar fora deles
    window.addEventListener("click", (event) => {
      document.querySelectorAll(".modal").forEach((modal) => {
        if (event.target === modal) {
          modal.style.display = "none"
        }
      })
    })
  
    // Adicionar atalho de teclado para fechar modais (ESC)
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        document.querySelectorAll(".modal").forEach((modal) => {
          modal.style.display = "none"
        })
      }
    })
  })
  
  // Função global para abrir o modal de produto
  window.openProductModal = (productId = null) => {
    console.log("Opening product modal from global function", productId)
  
    const productModal = document.getElementById("product-modal")
    if (!productModal) {
      console.error("Product modal not found")
      return
    }
  
    // Atualizar o título do modal
    const modalTitle = document.getElementById("modal-title")
    if (modalTitle) {
      modalTitle.textContent = productId ? "Edit Product" : "Thêm sản phẩm mới"
    }
  
    // Resetar o formulário
    const productForm = document.getElementById("product-basic-form")
    if (productForm) productForm.reset()
  
    // Definir o ID do produto
    const productIdInput = document.getElementById("product-id")
    if (productIdInput) {
      productIdInput.value = productId || ""
    }
  
    // Se estiver editando, carregar os dados do produto
    if (productId) {
      // Aqui você carregaria os dados do produto
      // Esta é uma implementação simplificada
      console.log("Would load product data for ID:", productId)
    }
  
    // Exibir o modal
    productModal.style.display = "block"
  }
  