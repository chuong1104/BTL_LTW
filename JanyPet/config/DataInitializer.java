package com.BTL_LTW.JanyPet.config;

import com.BTL_LTW.JanyPet.entity.Branch;
import com.BTL_LTW.JanyPet.repository.BranchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private BranchRepository branchRepository;

    @Override
    public void run(String... args) throws Exception {
        // Initialize branches if none exist
        if (branchRepository.count() == 0) {
            // Branch 1
            Branch branch1 = new Branch();
            branch1.setName("PetShop Hà Đông");
            branch1.setAddress("96A Trần Phú");
            branch1.setDistrict("Hà Đông");
            branch1.setCity("Hà Nội");
            branch1.setPhoneNumber("0987456443");
            branchRepository.save(branch1);
            
            // Branch 2
            Branch branch2 = new Branch();
            branch2.setName("PetShop Thanh Xuân");
            branch2.setAddress("123 Khương Trung");
            branch2.setDistrict("Thanh Xuân");
            branch2.setCity("Hà Nội");
            branch2.setPhoneNumber("0987456444");
            branchRepository.save(branch2);
            
            // Branch 3
            Branch branch3 = new Branch();
            branch3.setName("PetShop Cầu Giấy");
            branch3.setAddress("56 Xuân Thuỷ");
            branch3.setDistrict("Cầu Giấy");
            branch3.setCity("Hà Nội");
            branch3.setPhoneNumber("0987456445");
            branchRepository.save(branch3);
            
            System.out.println("Branches initialized successfully!");
        }
    }
}