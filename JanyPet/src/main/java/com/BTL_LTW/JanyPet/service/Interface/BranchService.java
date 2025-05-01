package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.dto.request.BranchRequest;
import com.BTL_LTW.JanyPet.dto.response.BranchResponse;

import java.util.List;

public interface BranchService {
    List<BranchResponse> getAllBranches();
    BranchResponse getBranchById(String id);
    BranchResponse createBranch(BranchRequest request);
    BranchResponse updateBranch(String id, BranchRequest request);
    void deleteBranch(String id);
}