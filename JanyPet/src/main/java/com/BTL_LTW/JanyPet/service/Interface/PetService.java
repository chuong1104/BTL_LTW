package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.dto.request.PetCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.PetUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.PetResponse;

import java.util.List;

public interface PetService {

    PetResponse createPet(String ownerId, PetCreationRequest request);

    PetResponse getPetById(String id);

    List<PetResponse> getPetsByOwnerId(String ownerId);

    List<PetResponse> getAllPets();

    PetResponse updatePet(String id, PetUpdateRequest request);

    void deletePet(String id);

//    @Transactional
//    PetResponse updatePet(Integer id, PetCreationRequest request);
//
//    @Transactional
//    void deletePet(Integer id);
}
