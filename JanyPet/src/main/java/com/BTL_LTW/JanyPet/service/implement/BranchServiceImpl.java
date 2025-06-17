package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.dto.request.BranchRequest;
import com.BTL_LTW.JanyPet.dto.response.BranchResponse;
import com.BTL_LTW.JanyPet.entity.Branch;
import com.BTL_LTW.JanyPet.repository.BranchRepository;
import com.BTL_LTW.JanyPet.service.Interface.BranchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BranchServiceImpl implements BranchService {

    @Autowired
    private BranchRepository branchRepository;

    @Override
    public List<BranchResponse> getAllBranches() {
        try {
            System.out.println("BranchService: Getting all branches from repository...");
            List<Branch> branches = branchRepository.findAll();
            System.out.println("BranchService: Found " + branches.size() + " branches in DB");

            List<BranchResponse> responses = branches.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
            System.out.println("BranchService: Mapped to " + responses.size() + " responses");
            return responses;
        } catch (Exception e) {
            System.err.println("BranchService error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public BranchResponse getBranchById(String id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + id));
        return mapToResponse(branch);
    }

    @Override
    public BranchResponse createBranch(BranchRequest request) {
        Branch branch = new Branch();
        mapFromRequest(branch, request);
        Branch savedBranch = branchRepository.save(branch);
        return mapToResponse(savedBranch);
    }

    @Override
    public BranchResponse updateBranch(String id, BranchRequest request) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + id));

        mapFromRequest(branch, request);
        Branch updatedBranch = branchRepository.save(branch);
        return mapToResponse(updatedBranch);
    }

    @Override
    public void deleteBranch(String id) {
        if (!branchRepository.existsById(id)) {
            throw new RuntimeException("Branch not found with id: " + id);
        }
        branchRepository.deleteById(id);
    }

    private BranchResponse mapToResponse(Branch branch) {
        BranchResponse response = new BranchResponse();
        response.setId(branch.getId());
        response.setName(branch.getName());
        response.setBranchSourceId(branch.getBranchSourceId());
        response.setAddress(branch.getAddress());
        response.setDistrict(branch.getDistrict());
        response.setCity(branch.getCity());
        response.setPhoneNumber(branch.getPhoneNumber());
        response.setCreatedAt(branch.getCreatedAt());
        response.setUpdatedAt(branch.getUpdatedAt());
        return response;
    }

    private void mapFromRequest(Branch branch, BranchRequest request) {
        branch.setName(request.getName());
        branch.setBranchSourceId(request.getBranchSourceId());
        branch.setAddress(request.getAddress());
        branch.setDistrict(request.getDistrict());
        branch.setCity(request.getCity());
        branch.setPhoneNumber(request.getPhoneNumber());
    }
}