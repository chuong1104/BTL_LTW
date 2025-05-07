const InventoryHandlers = {
    // State management
    state: {
        currentBranchId: "",
        currentCategory: "",
        currentStatus: "",
        sortBy: "name-asc", // Mặc định sắp xếp theo tên từ A-Z
        inventory: [],
        currentPage: 0,
        totalPages: 1,
        pageSize: 10,
    },
    historyState: {
        currentBranchId: "",
        movementType: "",
        fromDate: "",
        toDate: "",
        currentPage: 0,
        totalPages: 1,
        movements: []
    },
    branchMapping: {
        "1": "bc194cfd-c8a2-4083-a71d-20e04c5a6049", // PetShop Hà Đông
        "2": "0c55d3ff-b015-4e5c-a666-8e0febf826af", // PetShop Thanh Xuân
        "3": "7922c7bf-6fb9-40d6-876a-89ab6c5bf9fb"  // PetShop Cầu Giấy
    },
    branchNames: {
        "bc194cfd-c8a2-4083-a71d-20e04c5a6049": "PetShop Hà Đông",
        "0c55d3ff-b015-4e5c-a666-8e0febf826af": "PetShop Thanh Xuân",
        "7922c7bf-6fb9-40d6-876a-89ab6c5bf9fb": "PetShop Cầu Giấy"
    },

    // Initialize inventory events
    async initializeInventoryEvents() {
        console.log("Initializing inventory events");

        try {
            // Khởi tạo danh sách chi nhánh cho các dropdown
            await this.initializeBranches();

            // Load initial inventory data
            this.loadInventoryData();

            // Set up filter event listeners
            document.getElementById("history-branch").addEventListener("change", (e) => {
                this.state.currentBranchId = this.branchMapping[e.target.value] || "";
                this.loadInventoryData();
            });

            document.getElementById("filter-inventory-category").addEventListener("change", (e) => {
                this.state.currentCategory = e.target.value;
                this.loadInventoryData();
            });

            document.getElementById("filter-stock-status").addEventListener("change", (e) => {
                this.state.currentStatus = e.target.value;
                this.loadInventoryData();
            });

            // Xử lý sắp xếp
            document.getElementById("sort-by").addEventListener("change", (e) => {
                this.state.sortBy = e.target.value;
                this.loadInventoryData();
            });

            // Set up inventory action buttons
            document.addEventListener("click", (e) => {
                // Import button
                if (e.target.closest(".import-btn")) {
                    const button = e.target.closest(".import-btn");
                    const productId = button.dataset.productId;
                    const productName = button.dataset.productName;
                    this.openInventoryMovementModal("import", productId, productName);
                }

                // Export button
                if (e.target.closest(".export-btn")) {
                    const button = e.target.closest(".export-btn");
                    const productId = button.dataset.productId;
                    const productName = button.dataset.productName;
                    this.openInventoryMovementModal("export", productId, productName);
                }

                // Adjust button
                if (e.target.closest(".adjust-btn")) {
                    const button = e.target.closest(".adjust-btn");
                    const productId = button.dataset.productId;
                    const productName = button.dataset.productName;
                    this.openInventoryMovementModal("adjust", productId, productName);
                }
            });

            // Bổ sung xử lý cho nút xuất báo cáo
            document.getElementById("export-inventory-btn").addEventListener("click", () => {
                this.exportInventoryReport();
            });

            // Inventory movement form handlers
            const searchProductBtn = document.getElementById("search-product-btn");
            const saveMovementBtn = document.getElementById("save-movement-btn");
            const cancelMovementBtn = document.getElementById("cancel-movement-btn");

            if (searchProductBtn) {
                searchProductBtn.addEventListener("click", () => {
                    this.loadProductDetails();
                });
            }

            if (saveMovementBtn) {
                console.log("Save button found, attaching event");
                saveMovementBtn.addEventListener("click", () => {
                    console.log("Save button clicked!");
                    this.saveInventoryMovement();
                });
            } else {
                console.error("Save button not found in DOM");
            }

            if (cancelMovementBtn) {
                cancelMovementBtn.addEventListener("click", () => {
                    this.closeInventoryMovementModal();
                });
            }

            // Đảm bảo phần chi tiết sản phẩm ban đầu ẩn đi
            const productDetailsSection = document.getElementById("product-details");
            if (productDetailsSection) {
                productDetailsSection.style.display = "none";
            }

            // History button
            document.getElementById("inventory-history-btn").addEventListener("click", () => {
                this.openInventoryHistoryModal();
            });

            // Set today's date as default in movement date field
            const dateField = document.getElementById("movement-date");
            if (dateField) {
                dateField.valueAsDate = new Date();
            }
        } catch (error) {
            console.error("Error initializing inventory events:", error);
            window.ToastService.error("Lỗi khởi tạo: " + error.message);
        }
    },

    // Hàm khởi tạo danh sách chi nhánh từ API
    async initializeBranches() {
        try {
            // Lấy danh sách chi nhánh từ API
            const response = await fetch("/api/branches");
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const branches = await response.json();

            // Cập nhật branchMapping với dữ liệu mới nhất từ API
            branches.forEach((branch, index) => {
                const displayId = (index + 1).toString(); // "1", "2", "3"...
                this.branchMapping[displayId] = branch.id;
                this.branchNames[branch.id] = branch.name;
            });

            // Cập nhật dropdown chi nhánh cho phần movement modal
            const movementBranchDropdown = document.getElementById("movement-branch");
            if (movementBranchDropdown) {
                movementBranchDropdown.innerHTML = "";
                branches.forEach((branch, index) => {
                    const option = document.createElement("option");
                    option.value = branch.id;
                    option.textContent = branch.name;
                    movementBranchDropdown.appendChild(option);
                });
            }

            console.log("Branch mapping updated:", this.branchMapping);
        } catch (error) {
            console.error("Error loading branches:", error);
            window.ToastService.error("Lỗi tải danh sách chi nhánh: " + error.message);
        }
    },

    // Load inventory data from API
    async loadInventoryData() {
        try {
            const { currentBranchId, currentCategory, currentStatus, sortBy } = this.state;
            let url = "/api/inventory";

            if (currentBranchId) {
                url = `/api/inventory/branch/${currentBranchId}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || `HTTP error! Status: ${response.status}`;
                console.error("Backend error:", errorMessage);
                window.ToastService.error(errorMessage);
                throw new Error(errorMessage);
            }

            let inventory = await response.json();

            // Apply client-side filtering
            if (currentCategory) {
                inventory = inventory.filter(item => {
                    return item.category === currentCategory;
                });
            }

            if (currentStatus) {
                inventory = inventory.filter(item => {
                    switch (currentStatus) {
                        case "in-stock": return item.status === "IN_STOCK";
                        case "low-stock": return item.status === "LOW_STOCK";
                        case "out-of-stock": return item.status === "OUT_OF_STOCK";
                        default: return true;
                    }
                });
            }

            // Apply client-side sorting
            inventory = this.sortInventory(inventory, sortBy);

            this.state.inventory = inventory;
            this.renderInventoryTable();
        } catch (error) {
            console.error("Error loading inventory data:", error);
            window.ToastService.error("Lỗi tải dữ liệu kho hàng: " + error.message);
        }
    },

    // Hàm sắp xếp dữ liệu inventory
    sortInventory(inventory, sortBy) {
        switch (sortBy) {
            case "name-asc":
                return inventory.sort((a, b) => a.productName.localeCompare(b.productName));
            case "name-desc":
                return inventory.sort((a, b) => b.productName.localeCompare(a.productName));
            case "price-asc":
                return inventory.sort((a, b) => a.price - b.price);
            case "price-desc":
                return inventory.sort((a, b) => b.price - a.price);
            default:
                return inventory;
        }
    },

    // Render inventory table
    renderInventoryTable() {
        const tableBody = document.querySelector("#inventory-table tbody");
        if (!tableBody) return;

        tableBody.innerHTML = "";

        if (this.state.inventory.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `
        <td colspan="6" class="no-data">Không tìm thấy dữ liệu kho hàng</td>
      `;
            tableBody.appendChild(row);
            return;
        }

        this.state.inventory.forEach(item => {
            const row = document.createElement("tr");

            let statusClass = "";
            let statusText = "";

            switch (item.status) {
                case "IN_STOCK":
                    statusClass = "active";
                    statusText = "Còn hàng";
                    break;
                case "LOW_STOCK":
                    statusClass = "pending";
                    statusText = "Sắp hết";
                    break;
                case "OUT_OF_STOCK":
                    statusClass = "inactive";
                    statusText = "Hết hàng";
                    break;
            }

            row.innerHTML = `
        <td>${this.branchNames[item.branchId] || "N/A"}</td>
        <td>${item.productId}</td>
        <td>${item.productName}</td>
        <td>${item.quantity}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
        <td class="actions">
          <button class="icon-btn import-btn" data-product-id="${item.productId}" data-product-name="${item.productName}">
            <i class="fas fa-arrow-down" title="Nhập kho"></i>
          </button>
          <button class="icon-btn export-btn" data-product-id="${item.productId}" data-product-name="${item.productName}" ${item.quantity <= 0 ? "disabled" : ""}>
            <i class="fas fa-arrow-up" title="Xuất kho"></i>
          </button>
          <button class="icon-btn adjust-btn" data-product-id="${item.productId}" data-product-name="${item.productName}">
            <i class="fas fa-balance-scale" title="Điều chỉnh"></i>
          </button>
        </td>
      `;

            tableBody.appendChild(row);
        });
    },

    // Xuất báo cáo inventory
    async exportInventoryReport() {
        try {
            const { currentBranchId, currentCategory, currentStatus } = this.state;
            let url = "/api/inventory/export";

            // Thêm tham số cho báo cáo
            const params = new URLSearchParams();
            if (currentBranchId) params.append("branchId", currentBranchId);
            if (currentCategory) params.append("category", currentCategory);
            if (currentStatus) params.append("status", currentStatus);

            if (params.toString()) {
                url += "?" + params.toString();
            }

            // Tải xuống file báo cáo
            window.location.href = url;
            window.ToastService.success("Đang tạo báo cáo kho hàng...");

        } catch (error) {
            console.error("Error exporting inventory report:", error);
            window.ToastService.error("Lỗi khi xuất báo cáo: " + error.message);
        }
    },

    // Load product details for inventory movement
    async loadProductDetails(productId) {
        try {
            const branchId = document.getElementById("movement-branch").value;

            if (!branchId) {
                window.ToastService.error("Vui lòng chọn chi nhánh trước");
                return;
            }

            const productIdField = document.getElementById("product-id-search");
            // If productId wasn't passed as parameter, get it from the input field
            if (!productId) {
                productId = productIdField.value;
            }

            if (!productId) {
                window.ToastService.error("Vui lòng nhập mã sản phẩm");
                return;
            }

            // Update the product ID field if it was passed as parameter
            productIdField.value = productId;

            // Try to get inventory for this product at the selected branch
            const inventoryResponse = await fetch(`/api/inventory/branch/${branchId}/product/${productId}`);

            if (inventoryResponse.ok) {
                const inventoryItem = await inventoryResponse.json();
                document.getElementById("movement-product-name").textContent = inventoryItem.productName;
                document.getElementById("current-quantity").value = inventoryItem.quantity;

                // Make sure the product details section is visible
                document.getElementById("product-details").style.display = "block";

                // Set focus on the quantity field
                document.getElementById("movement-quantity").focus();
                return;
            }

            // If inventory not found, try to get just the product details
            const productResponse = await fetch(`/api/products/${productId}`);

            if (!productResponse.ok) {
                const errorData = await productResponse.json();
                throw new Error(errorData.message || "Không tìm thấy sản phẩm");
            }

            const product = await productResponse.json();
            document.getElementById("movement-product-name").textContent = product.name;
            document.getElementById("current-quantity").value = "0";

            // Make sure the product details section is visible
            document.getElementById("product-details").style.display = "block";

            // Set focus on the quantity field
            document.getElementById("movement-quantity").focus();
        } catch (error) {
            console.error("Error in loadProductDetails:", error);
            window.ToastService.error("Lỗi tải thông tin sản phẩm: " + error.message);
        }
    },

    // Open inventory movement modal
    openInventoryMovementModal(type, productId, productName) {
        const modal = document.getElementById("inventory-movement-modal");
        const title = document.getElementById("inventory-movement-title");
        const movementType = document.getElementById("movement-type");
        const movementLabel = document.getElementById("movement-label");
        const supplierGroup = document.getElementById("supplier-group");

        // Set up modal based on movement type
        switch (type) {
            case "import":
                title.textContent = "Nhập kho";
                movementType.value = "import";
                movementLabel.textContent = "nhập";
                supplierGroup.style.display = "block";
                break;
            case "export":
                title.textContent = "Xuất kho";
                movementType.value = "export";
                movementLabel.textContent = "xuất";
                supplierGroup.style.display = "none";
                break;
            case "adjust":
                title.textContent = "Điều chỉnh kho";
                movementType.value = "adjust";
                movementLabel.textContent = "điều chỉnh";
                supplierGroup.style.display = "none";
                break;
        }

        // If productId is provided, load product details immediately
        if (productId) {
            document.getElementById("product-id-search").value = productId;
            this.loadProductDetails(productId);
        } else {
            document.getElementById("product-id-search").value = "";
            document.getElementById("product-details").style.display = "none";
        }

        // Reset form fields
        document.getElementById("movement-quantity").value = "";
        document.getElementById("movement-notes").value = "";

        // Show modal
        modal.style.display = "block";
    },

    // Close inventory movement modal
    closeInventoryMovementModal() {
        const modal = document.getElementById("inventory-movement-modal");
        modal.style.display = "none";
    },

    // Save inventory movement
    async saveInventoryMovement() {
        console.log("saveInventoryMovement called");
        try {
            const movementType = document.getElementById("movement-type").value;
            const productId = document.getElementById("product-id-search").value;
            const branchId = document.getElementById("movement-branch").value;
            const quantity = parseInt(document.getElementById("movement-quantity").value);
            const movementDate = document.getElementById("movement-date").value;
            const notes = document.getElementById("movement-notes").value;

            // Validate inputs
            if (!productId || !branchId || isNaN(quantity) || quantity <= 0 || !movementDate) {
                console.error("Validation failed:", { productId, branchId, quantity });
                window.ToastService.error("Vui lòng điền đầy đủ thông tin bắt buộc");
                return;
            }

            const requestBody = {
                productId,
                branchId,
                quantity,
                movementDate,
                notes
            };

            let url = "";
            switch (movementType) {
                case "import":
                    url = "/api/inventory/movement/import";
                    break;
                case "export":
                    url = "/api/inventory/movement/export";
                    break;
                case "adjust":
                    url = "/api/inventory/movement/adjust";
                    break;
            }

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            // Success
            window.ToastService.success(`Thao tác ${movementType === "import" ? "nhập kho" : movementType === "export" ? "xuất kho" : "điều chỉnh"} thành công`);
            this.closeInventoryMovementModal();
            this.loadInventoryData();

        } catch (error) {
            console.error("Error in saveInventoryMovement:", error);
            window.ToastService.error("Đã xảy ra lỗi: " + error.message);
        }
    },

    // Open inventory history modal
    async openInventoryHistoryModal() {
        const modal = document.getElementById("inventory-history-modal");

        // Reset filters
        document.getElementById("history-branch").value = "";
        document.getElementById("history-movement-type").value = "";
        document.getElementById("history-from-date").value = "";
        document.getElementById("history-to-date").value = "";

        // Set up event listeners
        document.getElementById("apply-history-filters").addEventListener("click", () => {
            this.loadInventoryMovements();
        });

        document.getElementById("close-history-btn").addEventListener("click", () => {
            modal.style.display = "none";
        });

        // Load initial data
        await this.loadInventoryMovements();

        // Show modal
        modal.style.display = "block";
    },

    // Load inventory movements
    async loadInventoryMovements() {
        try {
            const branchSelect = document.getElementById("history-branch");
            const branchId = this.branchMapping[branchSelect.value] || "";
            const movementType = document.getElementById("history-movement-type").value;
            const fromDate = document.getElementById("history-from-date").value;
            const toDate = document.getElementById("history-to-date").value;
            const page = this.historyState.currentPage;

            // Update history state
            this.historyState.currentBranchId = branchId;
            this.historyState.movementType = movementType;
            this.historyState.fromDate = fromDate;
            this.historyState.toDate = toDate;

            // Build URL with query parameters
            let url = `/api/inventory/movements?page=${page}&size=10`;

            if (branchId) url += `&branchId=${branchId}`;
            if (movementType) url += `&movementType=${movementType}`;
            if (fromDate) url += `&fromDate=${fromDate}`;
            if (toDate) url += `&toDate=${toDate}`;

            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            this.historyState.movements = data.content || data;
            this.historyState.totalPages = data.totalPages || 1;

            this.renderMovementHistory();
        } catch (error) {
            console.error("Error loading inventory movements:", error);
            window.ToastService.error("Lỗi tải lịch sử nhập xuất kho: " + error.message);
        }
    },

    // Render movement history
    renderMovementHistory() {
        const tableBody = document.getElementById("movement-history-table-body");
        if (!tableBody) return;

        tableBody.innerHTML = "";

        if (!this.historyState.movements || this.historyState.movements.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `
        <td colspan="8" class="no-data">Không tìm thấy lịch sử nhập xuất kho</td>
        `;
            tableBody.appendChild(row);
            return;
        }

        this.historyState.movements.forEach(movement => {
            const row = document.createElement("tr");

            let typeClass = "";
            let typeText = "";

            switch (movement.movementType) {
                case "IMPORT":
                    typeClass = "active";
                    typeText = "Nhập kho";
                    break;
                case "EXPORT":
                    typeClass = "inactive";
                    typeText = "Xuất kho";
                    break;
                case "ADJUST":
                    typeClass = "pending";
                    typeText = "Điều chỉnh";
                    break;
            }

            // Format date
            const date = new Date(movement.movementDate);
            const formattedDate = date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${this.branchNames[movement.branchId] || "N/A"}</td>
        <td>${movement.productId}</td>
        <td>${movement.productName}</td>
        <td><span class="status ${typeClass}">${typeText}</span></td>
        <td>${movement.quantity}</td>
        <td>${movement.balanceQuantity}</td>
        <td>${movement.notes || ""}</td>
        `;

            tableBody.appendChild(row);
        });

        // Render pagination if needed
        this.renderMovementPagination();
    },

    // Render pagination for movement history
    renderMovementPagination() {
        const paginationContainer = document.getElementById("movement-history-pagination");
        if (!paginationContainer) return;

        paginationContainer.innerHTML = "";

        if (this.historyState.totalPages <= 1) return;

        // Previous button
        const prevButton = document.createElement("button");
        prevButton.className = "pagination-btn";
        prevButton.innerHTML = "< Prev";
        prevButton.disabled = this.historyState.currentPage === 0;
        prevButton.addEventListener("click", () => {
            if (this.historyState.currentPage > 0) {
                this.historyState.currentPage--;
                this.loadInventoryMovements();
            }
        });

        // Next button
        const nextButton = document.createElement("button");
        nextButton.className = "pagination-btn";
        nextButton.innerHTML = "Next >";
        nextButton.disabled = this.historyState.currentPage >= this.historyState.totalPages - 1;
        nextButton.addEventListener("click", () => {
            if (this.historyState.currentPage < this.historyState.totalPages - 1) {
                this.historyState.currentPage++;
                this.loadInventoryMovements();
            }
        });

        // Add buttons to pagination container
        paginationContainer.appendChild(prevButton);

        // Page indicator
        const pageIndicator = document.createElement("span");
        pageIndicator.className = "pagination-info";
        pageIndicator.textContent = `Trang ${this.historyState.currentPage + 1} / ${this.historyState.totalPages}`;
        paginationContainer.appendChild(pageIndicator);

        paginationContainer.appendChild(nextButton);
    },

    // Save product (create or update)
    async saveProduct() {
        try {
            console.log("Saving product...");
            const productId = document.getElementById("product-id").value;
            const productName = document.getElementById("product-name").value;
            const productCategory = document.getElementById("product-category").value;
            const purchasePrice = document.getElementById("product-purchase-price").value;
            const sellingPrice = document.getElementById("product-selling-price").value;

            // Validate form
            if (!productName || !productCategory || !purchasePrice || !sellingPrice) {
                window.ToastService.error("Vui lòng điền đầy đủ thông tin bắt buộc");
                return;
            }

            // Get description from Quill editor
            let description = "";
            if (window.quill) {
                description = window.quill.root.innerHTML;
            }

            // Create product data object with stock default to 0
            const productData = {
                name: productName,
                category: productCategory,
                purchasePrice: parseFloat(purchasePrice),
                price: parseFloat(sellingPrice),
                stock: 0, // Mặc định tồn kho là 0 cho sản phẩm mới
                description: description
            };

            // Rest of your code for sending the request to the server
            let response;
            if (productId) {
                // Update existing product
                productData.id = productId;
                response = await fetch(`/api/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(productData)
                });
            } else {
                // Create new product
                response = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(productData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // Show success message
            window.ToastService.success(productId ? "Cập nhật sản phẩm thành công" : "Thêm sản phẩm mới thành công");

            // Close modal and reload products
            this.closeProductModal();
            this.loadProducts();
        } catch (error) {
            console.error("Error saving product:", error);
            window.ToastService.error("Lỗi khi lưu sản phẩm: " + error.message);
        }
    }
};

// Export the module
window.InventoryHandlers = InventoryHandlers;