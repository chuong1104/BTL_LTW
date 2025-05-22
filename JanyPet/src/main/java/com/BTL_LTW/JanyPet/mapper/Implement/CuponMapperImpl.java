package com.BTL_LTW.JanyPet.mapper.Implement;

import com.BTL_LTW.JanyPet.common.OrderStatus;
import com.BTL_LTW.JanyPet.dto.request.*;
import com.BTL_LTW.JanyPet.dto.response.CuponResponse;
import com.BTL_LTW.JanyPet.dto.response.OrderDetailResponse;
import com.BTL_LTW.JanyPet.dto.response.OrderResponse;
import com.BTL_LTW.JanyPet.dto.response.OrderSummaryResponse;
import com.BTL_LTW.JanyPet.entity.Cupon;
import com.BTL_LTW.JanyPet.entity.Order;
import com.BTL_LTW.JanyPet.entity.OrderDetail;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.mapper.Interface.CuponMapper;
import com.BTL_LTW.JanyPet.mapper.Interface.ReviewMapper;
import com.BTL_LTW.JanyPet.mapper.Interface.ServiceItemMapper;
import com.BTL_LTW.JanyPet.repository.ProductRepository;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CuponMapperImpl implements CuponMapper {

    @Override
    public CuponResponse toDTO(Cupon entity) {
        if (entity == null) {
            return null;
        }
        CuponResponse response = new CuponResponse();
        response.setId(entity.getId());
        response.setCode(entity.getCode());
        response.setDiscountType(entity.getDiscountType());
        response.setDiscountValue(entity.getDiscountValue());
        response.setMinOrderAmount(entity.getMinOrderAmount());
        response.setMaxOrderAmount(entity.getMaxOrderAmount());
        response.setUsageLimit(entity.getUsageLimit());
        response.setExpirationDate(entity.getExpirationDate());
        return response;
    }

    @Override
    public Cupon toEntity(CuponCreateRequest creationDTO) {
        if (creationDTO == null) {
            return null;
        }
        Cupon cupon = new Cupon();
        cupon.setCode(creationDTO.getCode());
        cupon.setDiscountType(creationDTO.getDiscountType());
        cupon.setDiscountValue(creationDTO.getDiscountValue());
        cupon.setMinOrderAmount(creationDTO.getMinOrderAmount());
        cupon.setMaxOrderAmount(creationDTO.getMaxOrderAmount());
        cupon.setUsageLimit(creationDTO.getUsageLimit());
        cupon.setExpirationDate(creationDTO.getExpirationDate());
        return cupon;
    }

    @Override
    public void updateEntity(Cupon entity, CuponUpdateRequest updateDTO) {
        if (entity == null || updateDTO == null) {
            return;
        }

        if (updateDTO.getDiscountType() != null) {
            entity.setDiscountType(updateDTO.getDiscountType());
        }
        if (updateDTO.getDiscountValue() != null) {
            entity.setDiscountValue(updateDTO.getDiscountValue());
        }
        if (updateDTO.getMinOrderAmount() != null) {
            entity.setMinOrderAmount(updateDTO.getMinOrderAmount());
        }
        if (updateDTO.getMaxOrderAmount() != null) {
            entity.setMaxOrderAmount(updateDTO.getMaxOrderAmount());
        }
        if (updateDTO.getUsageLimit() != null) {
            entity.setUsageLimit(updateDTO.getUsageLimit());
        }
        if (updateDTO.getExpirationDate() != null) {
            entity.setExpirationDate(updateDTO.getExpirationDate());
        }
    }
}
