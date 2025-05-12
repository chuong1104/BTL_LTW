package com.BTL_LTW.JanyPet.dto.response;

import java.util.List;

public class ListResponse<T> {
    private List<T> items;
    private long totalItems;
    private int totalPages;
    private int currentPage;
    
    public ListResponse(List<T> items, long totalItems, int totalPages, int currentPage) {
        this.items = items;
        this.totalItems = totalItems;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
    }
    
    // Getters and setters
    public List<T> getItems() {
        return items;
    }

    public void setItems(List<T> items) {
        this.items = items;
    }

    public long getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(long totalItems) {
        this.totalItems = totalItems;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }
}