package com.BTL_LTW.JanyPet.mapper.Implement;

import com.BTL_LTW.JanyPet.dto.request.ServiceCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ServiceUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ServiceResponse;
import com.BTL_LTW.JanyPet.entity.Service;
import com.BTL_LTW.JanyPet.mapper.Interface.ServiceMapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ServiceMapperImpl implements ServiceMapper {

    @Override
    public ServiceResponse toDTO(Service entity) {
        if (entity == null) {
            return null;
        }

        ServiceResponse dto = new ServiceResponse();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setPrice(entity.getPrice());
        dto.setDuration(entity.getDuration());
        dto.setCategory(entity.getCategory());
        dto.setImages(entity.getImages());
        dto.setActive(entity.getActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }

    @Override
    public List<ServiceResponse> toDTOList(List<Service> entities) {
        if (entities == null) {
            return new ArrayList<>();
        }

        return entities.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Service toEntity(ServiceCreationRequest creationDTO) {
        if (creationDTO == null) {
            return null;
        }

        Service service = new Service();
        service.setName(creationDTO.getName());
        service.setDescription(creationDTO.getDescription());
        service.setPrice(creationDTO.getPrice());
        service.setDuration(creationDTO.getDuration());
        service.setCategory(creationDTO.getCategory());
        service.setImages(creationDTO.getImages());
        service.setActive(true); // Default to active when creating

        return service;
    }

    @Override
    public void updateEntity(Service entity, ServiceUpdateRequest updateDTO) {
        if (entity == null || updateDTO == null) {
            return;
        }

        // Only update fields that are not null in the DTO
        if (updateDTO.getName() != null) {
            entity.setName(updateDTO.getName());
        }

        if (updateDTO.getDescription() != null) {
            entity.setDescription(updateDTO.getDescription());
        }

        if (updateDTO.getPrice() != null) {
            entity.setPrice(updateDTO.getPrice());
        }

        if (updateDTO.getDuration() != null) {
            entity.setDuration(updateDTO.getDuration());
        }

        if (updateDTO.getCategory() != null) {
            entity.setCategory(updateDTO.getCategory());
        }

        if (updateDTO.getImages() != null) {
            entity.setImages(updateDTO.getImages());
        }

        if (updateDTO.getActive() != null) {
            entity.setActive(updateDTO.getActive());
        }
    }
}
