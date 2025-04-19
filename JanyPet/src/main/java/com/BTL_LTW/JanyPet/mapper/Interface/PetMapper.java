package com.BTL_LTW.JanyPet.mapper.Interface;

import com.BTL_LTW.JanyPet.dto.request.PetCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.PetUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.PetResponse;
import com.BTL_LTW.JanyPet.entity.Pet;
import com.BTL_LTW.JanyPet.mapper.GenericMapper;

import java.util.List;

public interface PetMapper extends GenericMapper<Pet, PetResponse, PetCreationRequest, PetUpdateRequest> {
    // Additional methods specific to Pet mapping
    List<PetResponse> toDTOList(List<Pet> entities);
}
