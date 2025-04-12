package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.dto.request.PetCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.PetUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.PetResponse;
import com.BTL_LTW.JanyPet.entity.Pet;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.mapper.Interface.PetMapper;
import com.BTL_LTW.JanyPet.repository.PetRepository;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import com.BTL_LTW.JanyPet.service.Interface.PetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PetServiceImpl implements PetService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final PetMapper petMapper;

    @Autowired
    public PetServiceImpl(PetRepository petRepository,
                          UserRepository userRepository,
                          PetMapper petMapper) {
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.petMapper = petMapper;
    }


    @Override
    public PetResponse createPet(String ownerId, PetCreationRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        Pet pet = petMapper.toEntity(request);
        pet.setOwner(owner);

        return petMapper.toDTO(petRepository.save(pet));
    }

    @Override
    public PetResponse getPetById(String id) {
        return petMapper.toDTO(petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pet not found")));
    }

    @Override
    public List<PetResponse> getPetsByOwnerId(String ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        return petRepository.findByOwner(owner).stream()
                .map(petMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PetResponse> getAllPets() {
        return petRepository.findAll().stream()
                .map(petMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PetResponse updatePet(String id, PetUpdateRequest request) {
        Pet existingPet = petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        petMapper.updateEntity(existingPet, request);
        return petMapper.toDTO(petRepository.save(existingPet));
    }

    @Override
    public void deletePet(String id) {
        if (!petRepository.existsById(id)) {
            throw new RuntimeException("Pet not found");
        }
        petRepository.deleteById(id);
    }
}