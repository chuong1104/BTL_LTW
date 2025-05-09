package com.BTL_LTW.JanyPet.repository.sqlserver;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class DashboardRepository {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public DashboardRepository(@Qualifier("sqlserverJdbcTemplate") JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void checkDatabaseConnection() {
        try {
            String dbName = jdbcTemplate.queryForObject("SELECT DB_NAME()", String.class);
            System.out.println("Connected to database: " + dbName);
        } catch (Exception e) {
            System.err.println("Database connection check failed: " + e.getMessage());
        }
    }

    /**
     * Lấy tổng số sản phẩm đang hoạt động
     */
    public int getTotalProducts() {
        try {
            String sql = "SELECT COUNT(*) FROM dbo.DimProduct WHERE IsCurrent = 1";
            Integer result = jdbcTemplate.queryForObject(sql, Integer.class);
            return result != null ? result : 0;
        } catch (DataAccessException e) {
            System.err.println("Error querying total products: " + e.getMessage());
            return 0;
        }
    }

    /**
     * Lấy tổng số đơn hàng online trong tháng hiện tại
     */
    public int getOnlineOrders() {
        try {
            String sql =
                    "SELECT COUNT(DISTINCT fs.SalesID) " +
                            "FROM dbo.FactSales fs " +
                            "JOIN dbo.DimSalesChannel sc ON fs.SalesChannelID = sc.SalesChannelID " +
                            "JOIN dbo.DimDate d ON fs.DateKey = d.DateKey " +
                            "WHERE sc.SalesChannelName = 'online' " +
                            "AND d.FullDate >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) " + // Đầu tháng hiện tại
                            "AND d.FullDate < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0)"; // Đầu tháng sau

            Integer result = jdbcTemplate.queryForObject(sql, Integer.class);
            return result != null ? result : 0;
        } catch (DataAccessException e) {
            System.err.println("Error querying online orders: " + e.getMessage());
            return 0;
        }
    }

    /**
     * Lấy tổng số đơn hàng offline trong tháng hiện tại
     */
    public int getOfflineOrders() {
        try {
            String sql =
                    "SELECT COUNT(DISTINCT fs.SalesID) " +
                            "FROM dbo.FactSales fs " +
                            "JOIN dbo.DimSalesChannel sc ON fs.SalesChannelID = sc.SalesChannelID " +
                            "JOIN dbo.DimDate d ON fs.DateKey = d.DateKey " +
                            "WHERE sc.SalesChannelName <> 'online' " +
                            "AND d.FullDate >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) " + // Đầu tháng hiện tại
                            "AND d.FullDate < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0)"; // Đầu tháng sau

            Integer result = jdbcTemplate.queryForObject(sql, Integer.class);
            return result != null ? result : 0;
        } catch (DataAccessException e) {
            System.err.println("Error querying offline orders: " + e.getMessage());
            return 0;
        }
    }

    /**
     * Lấy số lượng khách hàng mới trong tháng hiện tại
     */
    public int getNewCustomers() {
        try {
            String sql =
                    "SELECT COUNT(*) " +
                            "FROM dbo.DimCustomer " +
                            "WHERE CreatedAt >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) " + // Đầu tháng hiện tại
                            "AND CreatedAt < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0)"; // Đầu tháng sau

            Integer result = jdbcTemplate.queryForObject(sql, Integer.class);
            return result != null ? result : 0;
        } catch (DataAccessException e) {
            System.err.println("Error querying new customers: " + e.getMessage());
            return 0;
        }
    }

    /**
     * Lấy tổng doanh thu trong tháng hiện tại
     */
    public double getMonthlyRevenue() {
        try {
            String sql =
                    "SELECT SUM(fs.Quantity * dp.Price) " +
                            "FROM dbo.FactSales fs " +
                            "JOIN dbo.DimProduct dp ON fs.ProductID = dp.ProductID " +
                            "JOIN dbo.DimDate d ON fs.DateKey = d.DateKey " +
                            "WHERE d.FullDate >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) " + // Đầu tháng hiện tại
                            "AND d.FullDate < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0)"; // Đầu tháng sau

            Double result = jdbcTemplate.queryForObject(sql, Double.class);
            return result != null ? result : 0.0;
        } catch (DataAccessException e) {
            System.err.println("Error querying monthly revenue: " + e.getMessage());
            return 0.0;
        }
    }

    /**
     * Lấy tỷ lệ tăng trưởng số lượng sản phẩm so với tháng trước
     */
    public double getProductGrowth() {
        try {
            String sql =
                    "DECLARE @CurrentMonth INT = (SELECT COUNT(*) FROM dbo.DimProduct WHERE IsCurrent = 1); " +
                            "DECLARE @PreviousMonth INT = (SELECT COUNT(*) FROM dbo.DimProduct " +
                            "                             WHERE IsCurrent = 1 " +
                            "                             AND CreateAt < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0)); " +

                            "SELECT CASE " +
                            "         WHEN @PreviousMonth = 0 THEN 0 " + // Tránh chia cho 0
                            "         ELSE ((@CurrentMonth - @PreviousMonth) * 100.0 / @PreviousMonth) " +
                            "       END AS GrowthRate";

            Double result = jdbcTemplate.queryForObject(sql, Double.class);
            return result != null ? result : 0.0;
        } catch (DataAccessException e) {
            System.err.println("Error calculating product growth: " + e.getMessage());
            return 0.0;
        }
    }

    /**
     * Lấy tỷ lệ tăng trưởng đơn hàng online so với tháng trước
     */
    public double getOnlineOrderGrowth() {
        try {
            String sql =
                    "DECLARE @CurrentMonth INT = (SELECT COUNT(DISTINCT fs.SalesID) " +
                            "                           FROM dbo.FactSales fs " +
                            "                           JOIN dbo.DimSalesChannel sc ON fs.SalesChannelID = sc.SalesChannelID " +
                            "                           JOIN dbo.DimDate d ON fs.DateKey = d.DateKey " +
                            "                           WHERE sc.SalesChannelName = 'online' " +
                            "                           AND d.FullDate >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) " +
                            "                           AND d.FullDate < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0)); " +

                            "DECLARE @PreviousMonth INT = (SELECT COUNT(DISTINCT fs.SalesID) " +
                            "                            FROM dbo.FactSales fs " +
                            "                            JOIN dbo.DimSalesChannel sc ON fs.SalesChannelID = sc.SalesChannelID " +
                            "                            JOIN dbo.DimDate d ON fs.DateKey = d.DateKey " +
                            "                            WHERE sc.SalesChannelName = 'online' " +
                            "                            AND d.FullDate >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) - 1, 0) " +
                            "                            AND d.FullDate < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0)); " +

                            "SELECT CASE " +
                            "         WHEN @PreviousMonth = 0 THEN 0 " +
                            "         ELSE ((@CurrentMonth - @PreviousMonth) * 100.0 / @PreviousMonth) " +
                            "       END AS GrowthRate";

            Double result = jdbcTemplate.queryForObject(sql, Double.class);
            return result != null ? result : 0.0;
        } catch (DataAccessException e) {
            System.err.println("Error calculating online order growth: " + e.getMessage());
            return 0.0;
        }
    }

    /**
     * Lấy tỷ lệ tăng trưởng đơn hàng offline so với tháng trước
     */
    public double getOfflineOrderGrowth() {
        try {
            String sql =
                    "DECLARE @CurrentMonth INT = (SELECT COUNT(DISTINCT fs.SalesID) " +
                            "                           FROM dbo.FactSales fs " +
                            "                           JOIN dbo.DimSalesChannel sc ON fs.SalesChannelID = sc.SalesChannelID " +
                            "                           JOIN dbo.DimDate d ON fs.DateKey = d.DateKey " +
                            "                           WHERE sc.SalesChannelName <> 'online' " +
                            "                           AND d.FullDate >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) " +
                            "                           AND d.FullDate < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0)); " +

                            "DECLARE @PreviousMonth INT = (SELECT COUNT(DISTINCT fs.SalesID) " +
                            "                            FROM dbo.FactSales fs " +
                            "                            JOIN dbo.DimSalesChannel sc ON fs.SalesChannelID = sc.SalesChannelID " +
                            "                            JOIN dbo.DimDate d ON fs.DateKey = d.DateKey " +
                            "                            WHERE sc.SalesChannelName <> 'online' " +
                            "                            AND d.FullDate >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) - 1, 0) " +
                            "                            AND d.FullDate < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0)); " +

                            "SELECT CASE " +
                            "         WHEN @PreviousMonth = 0 THEN 0 " +
                            "         ELSE ((@CurrentMonth - @PreviousMonth) * 100.0 / @PreviousMonth) " +
                            "       END AS GrowthRate";

            Double result = jdbcTemplate.queryForObject(sql, Double.class);
            return result != null ? result : 0.0;
        } catch (DataAccessException e) {
            System.err.println("Error calculating offline order growth: " + e.getMessage());
            return 0.0;
        }
    }

    /**
     * Lấy tỷ lệ tăng trưởng khách hàng mới so với tháng trước
     */
    public double getCustomerGrowth() {
        try {
            String sql =
                    "DECLARE @CurrentMonth INT = (SELECT COUNT(*) " +
                            "                           FROM dbo.DimCustomer " +
                            "                           WHERE CreatedAt >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) " +
                            "                           AND CreatedAt < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0)); " +

                            "DECLARE @PreviousMonth INT = (SELECT COUNT(*) " +
                            "                            FROM dbo.DimCustomer " +
                            "                            WHERE CreatedAt >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) - 1, 0) " +
                            "                            AND CreatedAt < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0)); " +

                            "SELECT CASE " +
                            "         WHEN @PreviousMonth = 0 THEN 0 " +
                            "         ELSE ((@CurrentMonth - @PreviousMonth) * 100.0 / @PreviousMonth) " +
                            "       END AS GrowthRate";

            Double result = jdbcTemplate.queryForObject(sql, Double.class);
            return result != null ? result : 0.0;
        } catch (DataAccessException e) {
            System.err.println("Error calculating customer growth: " + e.getMessage());
            return 0.0;
        }
    }

    /**
     * Lấy tỷ lệ tăng trưởng doanh thu so với tháng trước
     */
    public double getRevenueGrowth() {
        try {
            String sql =
                    "DECLARE @CurrentMonth FLOAT = (SELECT SUM(fs.Quantity * dp.Price) " +
                            "                            FROM dbo.FactSales fs " +
                            "                            JOIN dbo.DimProduct dp ON fs.ProductID = dp.ProductID " +
                            "                            JOIN dbo.DimDate d ON fs.DateKey = d.DateKey " +
                            "                            WHERE d.FullDate >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) " +
                            "                            AND d.FullDate < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0)); " +

                            "DECLARE @PreviousMonth FLOAT = (SELECT SUM(fs.Quantity * dp.Price) " +
                            "                             FROM dbo.FactSales fs " +
                            "                            JOIN dbo.DimProduct dp ON fs.ProductID = dp.ProductID " +
                            "                             JOIN dbo.DimDate d ON fs.DateKey = d.DateKey " +
                            "                             WHERE d.FullDate >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) - 1, 0) " +
                            "                             AND d.FullDate < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0)); " +

                            "SELECT CASE " +
                            "         WHEN ISNULL(@PreviousMonth, 0) = 0 THEN 0 " +
                            "         ELSE ((ISNULL(@CurrentMonth, 0) - ISNULL(@PreviousMonth, 0)) * 100.0 / @PreviousMonth) " +
                            "       END AS GrowthRate";

            Double result = jdbcTemplate.queryForObject(sql, Double.class);
            return result != null ? result : 0.0;
        } catch (DataAccessException e) {
            System.err.println("Error calculating revenue growth: " + e.getMessage());
            return 0.0;
        }
    }

    /**
     * Lấy danh sách đơn hàng offline gần đây
     */
    public List<Map<String, Object>> getRecentOfflineOrders(int limit) {
        try {
            String sql =
                    "SELECT TOP " + limit + " " +
                            "    fs.SaleID AS OrderId, " +
                            "    c.CustomerName AS CustomerName, " +
                            "    p.ProductName AS ProductName, " +
                            "    fs.Quantity AS Quantity, " +
                            "    (fs.Quantity * fs.UnitPrice) AS Revenue, " +
                            "    CASE " +
                            "        WHEN fs.UpdatedAt IS NULL THEN N'Đang xử lý' " +
                            "        WHEN DATEDIFF(day, fs.CreatedAt, fs.UpdatedAt) <= 1 THEN N'Đang giao hàng' " +
                            "        ELSE N'Đã giao hàng' " +
                            "    END AS Status " +
                            "FROM dbo.FactSales fs " +
                            "JOIN dbo.DimCustomer c ON fs.CustomerID = c.CustomerID " +
                            "JOIN dbo.DimProduct p ON fs.ProductID = p.ProductID " +
                            "JOIN dbo.DimSalesChannel sc ON fs.SalesChannelID = sc.SalesChannelID " +
                            "WHERE sc.SalesChannelName <> 'online' " +
                            "ORDER BY fs.CreatedAt DESC";

            return jdbcTemplate.queryForList(sql);
        } catch (DataAccessException e) {
            System.err.println("Error querying recent offline orders: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Lấy danh sách đơn hàng online gần đây
     */
    public List<Map<String, Object>> getRecentOnlineOrders(int limit) {
        try {
            String sql =
                    "SELECT TOP " + limit + " " +
                            "    fs.SaleID AS OrderId, " +
                            "    c.CustomerName AS CustomerName, " +
                            "    p.ProductName AS ProductName, " +
                            "    fs.Quantity AS Quantity, " +
                            "    (fs.Quantity * fs.UnitPrice) AS Revenue, " +
                            "    CASE " +
                            "        WHEN fs.UpdatedAt IS NULL THEN N'Đang xử lý' " +
                            "        WHEN DATEDIFF(day, fs.CreatedAt, fs.UpdatedAt) <= 1 THEN N'Đang giao hàng' " +
                            "        ELSE N'Đã giao hàng' " +
                            "    END AS Status " +
                            "FROM dbo.FactSales fs " +
                            "JOIN dbo.DimCustomer c ON fs.CustomerID = c.CustomerID " +
                            "JOIN dbo.DimProduct p ON fs.ProductID = p.ProductID " +
                            "JOIN dbo.DimSalesChannel sc ON fs.SalesChannelID = sc.SalesChannelID " +
                            "WHERE sc.SalesChannelName = 'online' " +
                            "ORDER BY fs.CreatedAt DESC";

            return jdbcTemplate.queryForList(sql);
        } catch (DataAccessException e) {
            System.err.println("Error querying recent online orders: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Lấy tất cả thông tin dashboard trong một lần truy vấn để tối ưu hiệu suất
     */
    public Map<String, Object> getDashboardSummary() {
        try {
            String sql =
                    "SELECT " +
                            "    (SELECT COUNT(*) FROM dbo.DimProduct WHERE IsCurrent = 1) AS TotalProducts, " +

                            "    (SELECT COUNT(DISTINCT fs.SalesID) " +
                            "     FROM dbo.FactSales fs " +
                            "     JOIN dbo.DimSalesChannel sc ON fs.SalesChannelID = sc.SalesChannelID " +
                            "     JOIN dbo.DimDate d ON fs.DateKey = d.DateKey " +
                            "     WHERE sc.SalesChannelName = 'online' " +
                            "     AND d.FullDate >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) " +
                            "     AND d.FullDate < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0)) AS OnlineOrders, " +

                            "    (SELECT COUNT(DISTINCT fs.SalesID) " +
                            "     FROM dbo.FactSales fs " +
                            "     JOIN dbo.DimSalesChannel sc ON fs.SalesChannelID = sc.SalesChannelID " +
                            "     JOIN dbo.DimDate d ON fs.DateKey = d.DateKey " +
                            "     WHERE sc.SalesChannelName <> 'online' " +
                            "     AND d.FullDate >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) " +
                            "     AND d.FullDate < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0)) AS OfflineOrders, " +

                            "    (SELECT COUNT(*) " +
                            "     FROM dbo.DimCustomer " +
                            "     WHERE CreatedAt >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) " +
                            "     AND CreatedAt < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0)) AS NewCustomers, " +

                            "    (SELECT SUM(fs.Quantity * dp.Price) " +
                            "     FROM dbo.FactSales fs" +
                            "     JOIN dbo.DimProduct dp ON fs.ProductID = dp.ProductID " +

                            "     JOIN dbo.DimDate d ON fs.DateKey = d.DateKey " +
                            "     WHERE d.FullDate >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) " +
                            "     AND d.FullDate < DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0)) AS MonthlyRevenue";

            return jdbcTemplate.queryForMap(sql);
        } catch (DataAccessException e) {
            System.err.println("Error querying dashboard summary: " + e.getMessage());
            return Map.of(
                    "TotalProducts", 0,
                    "OnlineOrders", 0,
                    "OfflineOrders", 0,
                    "NewCustomers", 0,
                    "MonthlyRevenue", 0.0
            );
        }
    }
}