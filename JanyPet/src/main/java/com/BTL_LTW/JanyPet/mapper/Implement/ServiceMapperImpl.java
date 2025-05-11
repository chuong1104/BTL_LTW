package com.BTL_LTW.JanyPet.mapper.Implement;

import com.BTL_LTW.JanyPet.dto.request.ServiceCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ServiceUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ServiceItemResponse;
import com.BTL_LTW.JanyPet.dto.response.ServiceResponse;
import com.BTL_LTW.JanyPet.entity.Service;
import com.BTL_LTW.JanyPet.mapper.Interface.ServiceMapper;

import org.hibernate.Hibernate;
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
        dto.setBasePrice(entity.getBasePrice());
        dto.setSmallPetPrice(entity.getSmallPetPrice());
        dto.setMediumPetPrice(entity.getMediumPetPrice());
        dto.setLargePetPrice(entity.getLargePetPrice());
        dto.setXlargePetPrice(entity.getXlargePetPrice());
        dto.setImages(entity.getImages());
        dto.setMaxPetsPerSlot(entity.getMaxPetsPerSlot());
        dto.setRequiresVaccination(entity.getRequiresVaccination());
        dto.setCategory(entity.getCategory());
        dto.setActive(entity.getActive());
        dto.setDuration(entity.getDuration());
        dto.setAvailability(entity.getAvailability());
        dto.setProcedure(entity.getProcedure());
        dto.setIsFeatured(entity.getIsFeatured());
        dto.setIsPopular(entity.getIsPopular());
        dto.setBenefits(entity.getBenefits());
        dto.setNotes(entity.getNotes());
        if (entity.getIncludedItems() != null) {
        Hibernate.initialize(entity.getIncludedItems());
        dto.setIncludedItems(new ArrayList<>(entity.getIncludedItems()));
        }
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }

    @Override
    public ServiceResponse toDTOWithItems(Service entity, List<ServiceItemResponse> items) {
        ServiceResponse dto = toDTO(entity);
        if (dto != null) {
            dto.setServiceItems(items);
        }
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
        service.setBasePrice(creationDTO.getBasePrice());
        service.setSmallPetPrice(creationDTO.getSmallPetPrice());
        service.setMediumPetPrice(creationDTO.getMediumPetPrice());
        service.setLargePetPrice(creationDTO.getLargePetPrice());
        service.setXlargePetPrice(creationDTO.getXlargePetPrice());
        service.setImages(creationDTO.getImages());
        service.setMaxPetsPerSlot(creationDTO.getMaxPetsPerSlot());
        service.setRequiresVaccination(creationDTO.getRequiresVaccination());
        service.setCategory(creationDTO.getCategory());
        service.setActive(creationDTO.getActive() != null ? creationDTO.getActive() : true);
        service.setDuration(creationDTO.getDuration());
        service.setAvailability(creationDTO.getAvailability());
        service.setProcedure(creationDTO.getProcedure());
        service.setIsFeatured(creationDTO.getIsFeatured() != null ? creationDTO.getIsFeatured() : false);
        service.setIsPopular(creationDTO.getIsPopular() != null ? creationDTO.getIsPopular() : false);
        service.setBenefits(creationDTO.getBenefits());
        service.setNotes(creationDTO.getNotes());
        service.setIncludedItems(creationDTO.getIncludedItems());

        return service;
    }

    @Override
    public void updateEntity(Service entity, ServiceUpdateRequest updateDTO) {
        if (entity == null || updateDTO == null) {
            return;
        }

        if (updateDTO.getName() != null) {
            entity.setName(updateDTO.getName());
        }
        
        if (updateDTO.getDescription() != null) {
            entity.setDescription(updateDTO.getDescription());
        }
        
        if (updateDTO.getBasePrice() != null) {
            entity.setBasePrice(updateDTO.getBasePrice());
        }
        
        if (updateDTO.getSmallPetPrice() != null) {
            entity.setSmallPetPrice(updateDTO.getSmallPetPrice());
        }
        
        if (updateDTO.getMediumPetPrice() != null) {
            entity.setMediumPetPrice(updateDTO.getMediumPetPrice());
        }
        
        if (updateDTO.getLargePetPrice() != null) {
            entity.setLargePetPrice(updateDTO.getLargePetPrice());
        }
        
        if (updateDTO.getXlargePetPrice() != null) {
            entity.setXlargePetPrice(updateDTO.getXlargePetPrice());
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
        
        if (updateDTO.getDuration() != null) {
            entity.setDuration(updateDTO.getDuration());
        }
        
        if (updateDTO.getAvailability() != null) {
            entity.setAvailability(updateDTO.getAvailability());
        }
        
        if (updateDTO.getProcedure() != null) {
            entity.setProcedure(updateDTO.getProcedure());
        }
        
        if (updateDTO.getIsFeatured() != null) {
            entity.setIsFeatured(updateDTO.getIsFeatured());
        }
        
        if (updateDTO.getIsPopular() != null) {
            entity.setIsPopular(updateDTO.getIsPopular());
        }
        
        if (updateDTO.getBenefits() != null) {
            entity.setBenefits(updateDTO.getBenefits());
        }
        

        if (updateDTO.getNotes() != null) {
            entity.setNotes(updateDTO.getNotes());
        }
        
        if (updateDTO.getIncludedItems() != null) {
            entity.setIncludedItems(updateDTO.getIncludedItems());
        }
    }
}
