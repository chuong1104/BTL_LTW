package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.dto.request.PetCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.PetUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.PetResponse;
import com.BTL_LTW.JanyPet.service.Interface.PetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;

    @Autowired
    public PetController(PetService petService) {
        this.petService = petService;
    }

    // Tạo pet cho owner
    @PostMapping("/owner/{ownerId}")
    public ResponseEntity<PetResponse> createPet(
            @PathVariable("ownerId") String ownerId,
            @RequestBody PetCreationRequest request
    ) {
        PetResponse resp = petService.createPet(ownerId, request);
        return ResponseEntity.ok(resp);
    }

    // Lấy tất cả pet
    @GetMapping
    public ResponseEntity<List<PetResponse>> getAllPets() {
        List<PetResponse> list = petService.getAllPets();
        return ResponseEntity.ok(list);
    }

    // Lấy pet theo id
    @GetMapping("/{id}")
    public ResponseEntity<PetResponse> getPetById(@PathVariable("id") String id) {
        PetResponse resp = petService.getPetById(id);
        return ResponseEntity.ok(resp);
    }

    // Lấy pet theo owner
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<PetResponse>> getPetsByOwner(
            @PathVariable("ownerId") String ownerId
    ) {
        List<PetResponse> list = petService.getPetsByOwnerId(ownerId);
        return ResponseEntity.ok(list);
    }

    // Cập nhật pet
    @PutMapping("/{id}")
    public ResponseEntity<PetResponse> updatePet(
            @PathVariable("id") String id,
            @RequestBody PetUpdateRequest request
    ) {
        PetResponse resp = petService.updatePet(id, request);
        return ResponseEntity.ok(resp);
    }

    // Xóa pet
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePet(@PathVariable("id") String id) {
        petService.deletePet(id);
        return ResponseEntity.noContent().build();
    }
}
