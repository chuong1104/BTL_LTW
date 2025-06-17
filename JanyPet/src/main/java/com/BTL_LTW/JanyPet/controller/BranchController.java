package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.dto.request.BranchRequest;
import com.BTL_LTW.JanyPet.dto.response.BranchResponse;
import com.BTL_LTW.JanyPet.entity.Branch;
import com.BTL_LTW.JanyPet.repository.BranchRepository;
import com.BTL_LTW.JanyPet.service.Interface.BranchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    @Autowired
    private BranchService branchService;

    @Autowired
    private BranchRepository branchRepository;

    @GetMapping
    public ResponseEntity<List<BranchResponse>> getAllBranches() {
        try {
            System.out.println("Getting all branches...");
            List<BranchResponse> branches = branchService.getAllBranches();
            System.out.println("Found " + branches.size() + " branches");
            return ResponseEntity.ok(branches);
        } catch (Exception e) {
            System.err.println("Error getting branches: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<BranchResponse> getBranchById(@PathVariable String id) {
        BranchResponse branch = branchService.getBranchById(id);
        return ResponseEntity.ok(branch);
    }

    @PostMapping
    public ResponseEntity<BranchResponse> createBranch(@RequestBody BranchRequest request) {
        BranchResponse createdBranch = branchService.createBranch(request);
        return new ResponseEntity<>(createdBranch, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BranchResponse> updateBranch(
            @PathVariable String id,
            @RequestBody BranchRequest request) {
        BranchResponse updatedBranch = branchService.updateBranch(id, request);
        return ResponseEntity.ok(updatedBranch);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBranch(@PathVariable String id) {
        branchService.deleteBranch(id);
        return ResponseEntity.noContent().build();
    }

    // Test endpoint để debug
    @GetMapping("/test")
    public ResponseEntity<String> testBranches() {
        try {
            System.out.println("Testing branch repository...");
            List<Branch> branches = branchRepository.findAll();
            System.out.println("Repository returned: " + branches.size() + " branches");

            StringBuilder result = new StringBuilder("Found " + branches.size() + " branches:\n");
            for (Branch branch : branches) {
                result.append("- ID: ").append(branch.getId())
                        .append(", Name: ").append(branch.getName())
                        .append(", City: ").append(branch.getCity())
                        .append("\n");
            }

            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            return ResponseEntity.ok("Error: " + e.getMessage());
        }
    }
}