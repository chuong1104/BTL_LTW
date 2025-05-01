package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.dto.request.BranchRequest;
import com.BTL_LTW.JanyPet.dto.response.BranchResponse;
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

    @GetMapping
    public ResponseEntity<List<BranchResponse>> getAllBranches() {
        List<BranchResponse> branches = branchService.getAllBranches();
        return ResponseEntity.ok(branches);
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
}