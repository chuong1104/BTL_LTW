package com.BTL_LTW.JanyPet.mapper.Interface;

import com.BTL_LTW.JanyPet.dto.request.OrderItemRequest;
import com.BTL_LTW.JanyPet.dto.request.ServiceItemRequest;
import com.BTL_LTW.JanyPet.dto.response.OrderDetailResponse;
import com.BTL_LTW.JanyPet.dto.response.ServiceItemResponse;
import com.BTL_LTW.JanyPet.entity.OrderDetail;
import com.BTL_LTW.JanyPet.entity.Service;
import com.BTL_LTW.JanyPet.entity.ServiceItem;
import com.BTL_LTW.JanyPet.mapper.GenericMapper;

import java.util.List;

public interface ServiceItemMapper {
    ServiceItemResponse toDTO(ServiceItem entity);
    
    List<ServiceItemResponse> toDTOList(List<ServiceItem> entities);
    
    ServiceItem toEntity(ServiceItemRequest request, Service service);
    
    List<ServiceItem> toEntityList(List<ServiceItemRequest> requests, Service service);

//    interface OrderDetailMapper extends GenericMapper<OrderDetail, OrderDetailResponse, OrderItemRequest, Void> {
//        // Không cần các phương thức bổ sung
//    }
}