/**
 * Dashboard Handlers - Manages dashboard statistics and data loading
 */
const DashboardHandlers = {
      // Initialize dashboard data loading
    initializeDashboard() {
        console.log("Initializing dashboard handlers");
        this.loadDashboardStats();
        this.initBranchRevenueSelector();
        this.initPowerBICharts();
    },

    // Load all dashboard statistics
    async loadDashboardStats() {
        try {
            await Promise.all([
                this.loadBranchCount(),
                this.loadEmployeeCount(), 
                this.loadProductCount(),
                this.loadBranchOptions()
            ]);
        } catch (error) {
            console.error("Error loading dashboard stats:", error);
        }
    },

    // Load total number of branches
    async loadBranchCount() {
        try {
            const response = await fetch('/api/branches');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const branches = await response.json();
            const activeBranches = branches.filter(branch => branch.isActive !== false);
            
            const totalBranchesElement = document.getElementById('total-branches');
            if (totalBranchesElement) {
                totalBranchesElement.textContent = activeBranches.length;
            }
        } catch (error) {
            console.error("Error loading branch count:", error);
            const totalBranchesElement = document.getElementById('total-branches');
            if (totalBranchesElement) {
                totalBranchesElement.textContent = "N/A";
            }
        }
    },

    // Load total number of employees
    async loadEmployeeCount() {
        try {
            const response = await fetch('/api/staffs');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const employees = await response.json();
            const activeEmployees = employees.filter(employee => employee.isActive !== false);
            
            const totalEmployeesElement = document.getElementById('total-employees');
            if (totalEmployeesElement) {
                totalEmployeesElement.textContent = activeEmployees.length;
            }
        } catch (error) {
            console.error("Error loading employee count:", error);
            const totalEmployeesElement = document.getElementById('total-employees');
            if (totalEmployeesElement) {
                totalEmployeesElement.textContent = "N/A";
            }
        }
    },

    // Load total number of products
    async loadProductCount() {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            let productCount = 0;
            
            // Handle different response formats
            if (Array.isArray(result)) {
                productCount = result.length;
            } else if (result.content && Array.isArray(result.content)) {
                productCount = result.content.length;
            } else if (result.totalElements !== undefined) {
                productCount = result.totalElements;
            }
            
            const totalProductsElement = document.getElementById('total-products');
            if (totalProductsElement) {
                totalProductsElement.textContent = productCount;
            }
        } catch (error) {
            console.error("Error loading product count:", error);
            const totalProductsElement = document.getElementById('total-products');
            if (totalProductsElement) {
                totalProductsElement.textContent = "N/A";
            }
        }
    },

    // Load branch options for revenue selector
    async loadBranchOptions() {
        try {
            const response = await fetch('/api/branches');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const branches = await response.json();
            const branchSelect = document.getElementById('branch-revenue-select');
            
            if (branchSelect) {
                // Clear existing options except the first one
                const firstOption = branchSelect.options[0];
                branchSelect.innerHTML = '';
                branchSelect.appendChild(firstOption);
                
                // Add branch options
                branches.forEach(branch => {
                    if (branch.isActive !== false) {
                        const option = document.createElement('option');
                        option.value = branch.id;
                        option.textContent = branch.name;
                        branchSelect.appendChild(option);
                    }
                });
            }
        } catch (error) {
            console.error("Error loading branch options:", error);
        }
    },

    // Initialize branch revenue selector event listener
    initBranchRevenueSelector() {
        const branchSelect = document.getElementById('branch-revenue-select');
        if (branchSelect) {
            branchSelect.addEventListener('change', (e) => {
                const branchId = e.target.value;
                if (branchId) {
                    this.loadBranchRevenue(branchId);
                } else {
                    // Reset revenue display
                    const revenueElement = document.getElementById('branch-revenue');
                    if (revenueElement) {
                        revenueElement.textContent = "0đ";
                    }
                }
            });
        }
    },

    // Load revenue for specific branch
    async loadBranchRevenue(branchId) {
        try {
            // Get current month's start and end dates
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            
            const startDate = startOfMonth.toISOString().split('T')[0];
            const endDate = endOfMonth.toISOString().split('T')[0];
            
            // Fetch orders for the branch within the current month
            const response = await fetch(`/api/orders?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}&status=COMPLETED`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            let totalRevenue = 0;
            
            // Calculate total revenue
            if (result.content && Array.isArray(result.content)) {
                totalRevenue = result.content.reduce((sum, order) => {
                    return sum + (order.totalAmount || 0);
                }, 0);
            }
            
            // Format and display revenue
            const revenueElement = document.getElementById('branch-revenue');
            if (revenueElement) {
                revenueElement.textContent = this.formatCurrency(totalRevenue);
            }
            
        } catch (error) {
            console.error("Error loading branch revenue:", error);
            const revenueElement = document.getElementById('branch-revenue');
            if (revenueElement) {
                revenueElement.textContent = "N/A";
            }
        }
    },    // Helper: Format currency
    formatCurrency(amount) {
        if (amount == null || isNaN(amount)) return '0đ';
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND',
            maximumFractionDigits: 0 
        }).format(amount).replace('₫', 'đ');
    },

    // Initialize PowerBI Charts
    initPowerBICharts() {
        this.initRevenueCostChart();
        this.initOrderRatioChart();
        this.initCategoryRevenueChart();
        this.initInventoryRatioChart();
        this.loadBranchOptionsForCharts();
    },

    // Load branch options for all chart selectors
    async loadBranchOptionsForCharts() {
        try {
            const response = await fetch('/api/branches');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const branches = await response.json();
            const selectors = [
                'revenue-cost-branch-select',
                'order-ratio-branch-select', 
                'inventory-ratio-branch-select'
            ];
            
            selectors.forEach(selectorId => {
                const select = document.getElementById(selectorId);
                if (select) {
                    // Clear existing options except the first one
                    const firstOption = select.options[0];
                    select.innerHTML = '';
                    select.appendChild(firstOption);
                    
                    // Add branch options
                    branches.forEach(branch => {
                        if (branch.isActive !== false) {
                            const option = document.createElement('option');
                            option.value = branch.id;
                            option.textContent = branch.name;
                            select.appendChild(option);
                        }
                    });
                }
            });
        } catch (error) {
            console.error("Error loading branch options for charts:", error);
        }
    },

    // Initialize Revenue & Cost Chart
    initRevenueCostChart() {
        const branchSelect = document.getElementById('revenue-cost-branch-select');
        if (branchSelect) {
            branchSelect.addEventListener('change', (e) => {
                const branchId = e.target.value;
                this.updateRevenueCostChart(branchId);
            });
        }
    },

    // Initialize Order Ratio Chart
    initOrderRatioChart() {
        const branchSelect = document.getElementById('order-ratio-branch-select');
        const viewSelect = document.getElementById('order-ratio-view-select');
        
        if (branchSelect) {
            branchSelect.addEventListener('change', (e) => {
                const branchId = e.target.value;
                const viewType = viewSelect ? viewSelect.value : 'pie';
                this.updateOrderRatioChart(branchId, viewType);
            });
        }
        
        if (viewSelect) {
            viewSelect.addEventListener('change', (e) => {
                const viewType = e.target.value;
                const branchId = branchSelect ? branchSelect.value : '';
                this.updateOrderRatioChart(branchId, viewType);
            });
        }
    },

    // Initialize Category Revenue Chart
    initCategoryRevenueChart() {
        const periodSelect = document.getElementById('category-revenue-period-select');
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                const period = e.target.value;
                this.updateCategoryRevenueChart(period);
            });
        }
        // Load initial chart
        this.updateCategoryRevenueChart('current-month');
    },

    // Initialize Inventory Ratio Chart
    initInventoryRatioChart() {
        const branchSelect = document.getElementById('inventory-ratio-branch-select');
        const periodSelect = document.getElementById('inventory-ratio-period-select');
        
        if (branchSelect) {
            branchSelect.addEventListener('change', (e) => {
                const branchId = e.target.value;
                const period = periodSelect ? periodSelect.value : '6-months';
                this.updateInventoryRatioChart(branchId, period);
            });
        }
        
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                const period = e.target.value;
                const branchId = branchSelect ? branchSelect.value : '';
                this.updateInventoryRatioChart(branchId, period);
            });
        }
    },

    // Update Revenue & Cost Chart
    updateRevenueCostChart(branchId) {
        console.log(`Updating Revenue & Cost Chart for branch: ${branchId}`);
        const container = document.getElementById('revenue-cost-chart');
        if (container) {
            const iframe = container.querySelector('iframe');
            if (iframe && branchId) {
                // Replace with actual PowerBI embed URL
                // iframe.src = `YOUR_POWERBI_REVENUE_COST_CHART_URL&filter=branch_id=${branchId}`;
                console.log(`Would load PowerBI chart for branch ${branchId}`);
            }
        }
    },

    // Update Order Ratio Chart
    updateOrderRatioChart(branchId, viewType) {
        console.log(`Updating Order Ratio Chart for branch: ${branchId}, view: ${viewType}`);
        const container = document.getElementById('order-ratio-chart');
        if (container) {
            const iframe = container.querySelector('iframe');
            if (iframe && branchId) {
                // Replace with actual PowerBI embed URL
                // iframe.src = `YOUR_POWERBI_ORDER_RATIO_CHART_URL&filter=branch_id=${branchId}&view=${viewType}`;
                console.log(`Would load PowerBI ${viewType} chart for branch ${branchId}`);
            }
        }
    },

    // Update Category Revenue Chart
    updateCategoryRevenueChart(period) {
        console.log(`Updating Category Revenue Chart for period: ${period}`);
        const container = document.getElementById('category-revenue-chart');
        if (container) {
            const iframe = container.querySelector('iframe');
            if (iframe) {
                // Replace with actual PowerBI embed URL
                // iframe.src = `YOUR_POWERBI_CATEGORY_REVENUE_CHART_URL&filter=period=${period}`;
                console.log(`Would load PowerBI category revenue chart for ${period}`);
            }
        }
    },

    // Update Inventory Ratio Chart
    updateInventoryRatioChart(branchId, period) {
        console.log(`Updating Inventory Ratio Chart for branch: ${branchId}, period: ${period}`);
        const container = document.getElementById('inventory-ratio-chart');
        if (container) {
            const iframe = container.querySelector('iframe');
            if (iframe && branchId) {
                // Replace with actual PowerBI embed URL
                // iframe.src = `YOUR_POWERBI_INVENTORY_RATIO_CHART_URL&filter=branch_id=${branchId}&period=${period}`;
                console.log(`Would load PowerBI inventory ratio chart for branch ${branchId}, period ${period}`);
            }
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure other handlers are initialized first
    setTimeout(() => {
        DashboardHandlers.initializeDashboard();
    }, 500);
});
