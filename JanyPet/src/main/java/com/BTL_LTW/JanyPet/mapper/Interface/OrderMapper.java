package com.BTL_LTW.JanyPet.mapper.Interface;

import com.BTL_LTW.JanyPet.dto.request.OrderCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.OrderStatusUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.OrderResponse;
import com.BTL_LTW.JanyPet.dto.response.OrderSummaryResponse;
import com.BTL_LTW.JanyPet.entity.Order;
import com.BTL_LTW.JanyPet.mapper.GenericMapper;

import java.util.List;

public interface OrderMapper extends GenericMapper<Order, OrderResponse, OrderCreateRequest, OrderStatusUpdateRequest> {
    
    // Convert entity to summary DTO (for listing purposes)
    OrderSummaryResponse toSummaryDTO(Order entity);
    
    // Convert list of entities to summary DTOs
    List<OrderSummaryResponse> toSummaryDTOList(List<Order> entities);
    
    // Convert list of entities to full DTOs 
    List<OrderResponse> toDTOList(List<Order> entities);
}