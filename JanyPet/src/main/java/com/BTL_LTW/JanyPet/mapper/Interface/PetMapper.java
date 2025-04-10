package com.BTL_LTW.JanyPet.mapper.Interface;

import com.BTL_LTW.JanyPet.dto.request.PetCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.PetUpdateRequest;
import com.BTL_LTW.JanyPet.dto.request.UserCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.UserUpdateRequest;
import com.BTL_LTW.JanyPet.dto.respone.PetResponse;
import com.BTL_LTW.JanyPet.dto.respone.UserResponse;
import com.BTL_LTW.JanyPet.entity.Pet;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.mapper.GenericMapper;

public interface PetMapper extends GenericMapper<Pet, PetResponse, PetCreationRequest, PetUpdateRequest> {

}
