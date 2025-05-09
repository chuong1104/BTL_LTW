package com.BTL_LTW.JanyPet.repository.sqlserver;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class DashboardRepository {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public DashboardRepository(@Qualifier("sqlserverJdbcTemplate") JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public int getTotalProducts() {
        try {
            Integer result = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) AS TotalProducts FROM DimProduct WHERE IsCurrent = 1",
                    Integer.class
            );
            return result != null ? result : 0;
        } catch (EmptyResultDataAccessException e) {
            return 0;
        }
    }

    public int getOnlineOrders() {
        try {
            Integer result = jdbcTemplate.queryForObject(
                    "SELECT COUNT(DISTINCT fs.SalesID) AS OnlineOrders " +
                            "FROM FactSales fs " +
                            "JOIN DimSalesChannel dsc ON fs.SalesChannelID = dsc.SalesChannelID " +
                            "JOIN DimDate dd ON fs.DateKey = dd.DateKey " +
                            "WHERE dsc.SalesChannelName = 'Online' " +
                            "AND dd.FullDate >= DATEADD(MONTH, -1, GETDATE())",
                    Integer.class
            );
            return result != null ? result : 0;
        } catch (EmptyResultDataAccessException e) {
            return 0;
        }
    }


    public double getMonthlyRevenue() {
        try {
            Double result = jdbcTemplate.queryForObject(
                    "SELECT SUM(fsu.UnitPrice * fs.Quantity) AS MonthlyRevenue " +
                            "FROM FactServiceUsage fsu, FactSales fs " +
                            "JOIN DimDate dd ON fsu.DateKey = dd.DateKey " +
                            "WHERE dd.FullDate >= DATEADD(MONTH, -1, GETDATE()) " +
                            "AND dd.FullDate < GETDATE()",
                    Double.class
            );
            return result != null ? result : 0.0;
        } catch (EmptyResultDataAccessException e) {
            return 0.0;
        }
    }

    public double getProductGrowth() {
        try {
            Double result = jdbcTemplate.queryForObject(
                    "WITH CurrentMonth AS ( " +
                            "    SELECT COUNT(*) AS Count " +
                            "    FROM DimProduct " +
                            "    WHERE IsCurrent= 1 " +
                            "), PreviousMonth AS ( " +
                            "    SELECT COUNT(*) AS Count " +
                            "    FROM DimProduct " +
                            "    WHERE IsCurrent = 1 AND CreateAt < DATEADD(MONTH, -1, GETDATE()) " +
                            ") " +
                            "SELECT ((CAST(CurrentMonth.Count AS FLOAT) - PreviousMonth.Count) / " +
                            "IIF(PreviousMonth.Count = 0, 1, PreviousMonth.Count)) * 100 " +
                            "FROM CurrentMonth, PreviousMonth",
                    Double.class
            );
            return result != null ? result : 0.0;
        } catch (EmptyResultDataAccessException e) {
            return 0.0;
        }
    }
}