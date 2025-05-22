package com.BTL_LTW.JanyPet.mapper.Implement;

import com.BTL_LTW.JanyPet.dto.request.ServiceItemRequest;
import com.BTL_LTW.JanyPet.dto.response.ServiceItemResponse;
import com.BTL_LTW.JanyPet.entity.Service;
import com.BTL_LTW.JanyPet.entity.ServiceItem;
import com.BTL_LTW.JanyPet.mapper.Interface.ServiceItemMapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ServiceItemMapperImpl implements ServiceItemMapper {

    @Override
    public ServiceItemResponse toDTO(ServiceItem entity) {
        if (entity == null) {
            return null;
        }

        ServiceItemResponse dto = new ServiceItemResponse();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setSmallPetPrice(entity.getSmallPetPrice());
        dto.setMediumPetPrice(entity.getMediumPetPrice());
        dto.setLargePetPrice(entity.getLargePetPrice());
        dto.setXlargePetPrice(entity.getXlargePetPrice());
        dto.setDuration(entity.getDuration());

        return dto;
    }

    @Override
    public List<ServiceItemResponse> toDTOList(List<ServiceItem> entities) {
        if (entities == null) {
            return new ArrayList<>();
        }

        return entities.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceItem toEntity(ServiceItemRequest request, Service service) {
        if (request == null) {
            return null;
        }

        ServiceItem item = new ServiceItem();
        item.setName(request.getName());
        item.setService(service);
        item.setSmallPetPrice(request.getSmallPetPrice());
        item.setMediumPetPrice(request.getMediumPetPrice());
        item.setLargePetPrice(request.getLargePetPrice());
        item.setXlargePetPrice(request.getXlargePetPrice());
        item.setDuration(request.getDuration());

        return item;
    }

    @Override
    public List<ServiceItem> toEntityList(List<ServiceItemRequest> requests, Service service) {
        if (requests == null) {
            return new ArrayList<>();
        }

        return requests.stream()
                .map(request -> toEntity(request, service))
                .collect(Collectors.toList());
    }
}