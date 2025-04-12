package com.BTL_LTW.JanyPet.mapper.Implement;

import com.BTL_LTW.JanyPet.dto.request.ServiceCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ServiceUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ServiceResponse;
import com.BTL_LTW.JanyPet.entity.Service;
import com.BTL_LTW.JanyPet.mapper.Interface.ServiceMapper;
import org.springframework.stereotype.Component;

@Component
public class ServiceMapperImpl implements ServiceMapper {

    @Override
    public ServiceResponse toDTO(Service entity) {
        if (entity == null) return null;

        return new ServiceResponse(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getPrice(),
                entity.getImages(),
                entity.getMaxPetsPerSlot(),
                entity.getRequiresVaccination(),
                entity.getCategory(),
                entity.getActive(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    @Override
    public Service toEntity(ServiceCreationRequest creationDTO) {
        if (creationDTO == null) return null;

        Service service = new Service();
        service.setName(creationDTO.getName());
        service.setDescription(creationDTO.getDescription());
        service.setPrice(creationDTO.getPrice());
        service.setImages(creationDTO.getImages());
        service.setMaxPetsPerSlot(creationDTO.getMaxPetsPerSlot());
        service.setRequiresVaccination(creationDTO.getRequiresVaccination());
        service.setCategory(creationDTO.getCategory());
        service.setActive(creationDTO.getActive());

        return service;
    }

    @Override
    public void updateEntity(Service entity, ServiceUpdateRequest updateDTO) {
        if (entity == null || updateDTO == null) return;

        if (updateDTO.getName() != null) {
            entity.setName(updateDTO.getName());
        }
        if (updateDTO.getDescription() != null) {
            entity.setDescription(updateDTO.getDescription());
        }
        if (updateDTO.getPrice() != null) {
            entity.setPrice(updateDTO.getPrice());
        }
        if (updateDTO.getImages() != null) {
            entity.setImages(updateDTO.getImages());
        }
        if (updateDTO.getMaxPetsPerSlot() != null) {
            entity.setMaxPetsPerSlot(updateDTO.getMaxPetsPerSlot());
        }
        if (updateDTO.getRequiresVaccination() != null) {
            entity.setRequiresVaccination(updateDTO.getRequiresVaccination());
        }
        if (updateDTO.getCategory() != null) {
            entity.setCategory(updateDTO.getCategory());
        }
        if (updateDTO.getActive() != null) {
            entity.setActive(updateDTO.getActive());
        }
    }
}
