package com.BTL_LTW.JanyPet.mapper.Implement;


import com.BTL_LTW.JanyPet.dto.request.PetCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.PetUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.PetResponse;
import com.BTL_LTW.JanyPet.entity.Pet;
import com.BTL_LTW.JanyPet.mapper.Interface.PetMapper;
import com.BTL_LTW.JanyPet.mapper.Interface.UserMapper;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PetMapperImpl implements PetMapper {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserRepository userRepository;

    @Override
    public PetResponse toDTO(Pet entity) {
        if (entity == null) {
            return null;
        }

        PetResponse dto = new PetResponse();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setSpecies(entity.getSpecies());
        dto.setBreed(entity.getBreed());
        dto.setWeight(entity.getWeight());
        dto.setGender(entity.getGender());


        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }

    @Override
    public List<PetResponse> toDTOList(List<Pet> entities) {
        if (entities == null) {
            return new ArrayList<>();
        }

        return entities.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Pet toEntity(PetCreationRequest creationDTO) {
        if (creationDTO == null) {
            return null;
        }

        Pet pet = new Pet();
        pet.setName(creationDTO.getName());
        pet.setSpecies(creationDTO.getSpecies());
        pet.setBreed(creationDTO.getBreed());
    ;   pet.setBirthDate(creationDTO.getBirthDate());
        pet.setGender(creationDTO.getGender());
        pet.setWeight(creationDTO.getWeight());
        pet.setVaccinated(creationDTO.getVaccinated());
        pet.setHealthNotes(creationDTO.getHealthNotes());
        if (creationDTO.getOwnerId() != null) {
            userRepository.findById(creationDTO.getOwnerId())
                    .ifPresent(pet::setOwner);
        }

        return pet;
    }

    @Override
    public void updateEntity(Pet entity, PetUpdateRequest updateDTO) {
        if (entity == null || updateDTO == null) {
            return;
        }

        // Only update fields that are not null in the DTO
        if (updateDTO.getName() != null) {
            entity.setName(updateDTO.getName());
        }

        if (updateDTO.getSpecies() != null) {
            entity.setSpecies(updateDTO.getSpecies());
        }

        if (updateDTO.getBreed() != null) {
            entity.setBreed(updateDTO.getBreed());
        }
        entity.setBirthDate(updateDTO.getBirthDate());
        entity.setGender(updateDTO.getGender());


        if (updateDTO.getWeight() != null) {
            entity.setWeight(updateDTO.getWeight());
        }
        entity.setVaccinated(updateDTO.getVaccinated());
        entity.setHealthNotes(updateDTO.getHealthNotes());


        if (updateDTO.getOwnerId() != null) {
            userRepository.findById(updateDTO.getOwnerId())
                    .ifPresent(entity::setOwner);
        }
    }
}
