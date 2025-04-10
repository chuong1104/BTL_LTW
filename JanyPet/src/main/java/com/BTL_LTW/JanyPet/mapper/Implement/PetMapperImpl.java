package com.BTL_LTW.JanyPet.mapper.Implement;

import com.BTL_LTW.JanyPet.dto.request.PetCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.PetUpdateRequest;
import com.BTL_LTW.JanyPet.dto.respone.PetResponse;
import com.BTL_LTW.JanyPet.entity.Pet;
import com.BTL_LTW.JanyPet.mapper.Interface.PetMapper;
import org.springframework.stereotype.Component;

@Component
public class PetMapperImpl implements PetMapper {

    @Override
    public PetResponse toDTO(Pet entity) {
        if (entity == null) return null;

        return new PetResponse(
                entity.getId(),
                entity.getName(),
                entity.getSpecies(),
                entity.getBreed(),
                entity.getBirthDate(),
                entity.getGender(),
                entity.getWeight(),
                entity.getVaccinated(),
                entity.getHealthNotes(),
                entity.getOwner(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    @Override
    public Pet toEntity(PetCreationRequest creationDTO) {
        if (creationDTO == null) return null;

        Pet pet = new Pet();
        pet.setName(creationDTO.getName());
        pet.setSpecies(creationDTO.getSpecies());
        pet.setBreed(creationDTO.getBreed());
        pet.setBirthDate(creationDTO.getBirthDate());
        pet.setGender(creationDTO.getGender());
        pet.setWeight(creationDTO.getWeight());
        pet.setVaccinated(creationDTO.getVaccinated());
        pet.setHealthNotes(creationDTO.getHealthNotes());

        // Quan hệ với owner sẽ được set ở tầng service
        return pet;
    }

    @Override
    public void updateEntity(Pet entity, PetUpdateRequest updateDTO) {
        if (entity == null || updateDTO == null) return;

        if (updateDTO.getName() != null) entity.setName(updateDTO.getName());
        if (updateDTO.getSpecies() != null) entity.setSpecies(updateDTO.getSpecies());
        if (updateDTO.getBreed() != null) entity.setBreed(updateDTO.getBreed());
        if (updateDTO.getBirthDate() != null) entity.setBirthDate(updateDTO.getBirthDate());
        if (updateDTO.getGender() != null) entity.setGender(updateDTO.getGender());
        if (updateDTO.getWeight() != null) entity.setWeight(updateDTO.getWeight());
        if (updateDTO.getVaccinated() != null) entity.setVaccinated(updateDTO.getVaccinated());
        if (updateDTO.getHealthNotes() != null) entity.setHealthNotes(updateDTO.getHealthNotes());

        // Owner update cũng nên handle ở tầng service nếu có
    }
}
