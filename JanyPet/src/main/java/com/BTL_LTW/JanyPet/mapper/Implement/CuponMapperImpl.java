package com.BTL_LTW.JanyPet.mapper.Implement;

import com.BTL_LTW.JanyPet.dto.request.CuponCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.CuponUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.CuponResponse;
import com.BTL_LTW.JanyPet.entity.Cupon;
import com.BTL_LTW.JanyPet.mapper.Interface.CuponMapper;
import org.springframework.stereotype.Component;

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
