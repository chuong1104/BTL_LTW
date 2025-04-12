package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.dto.request.CuponCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.CuponUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.CuponResponse;
import com.BTL_LTW.JanyPet.entity.Cupon;
import com.BTL_LTW.JanyPet.mapper.Implement.CuponMapperImpl;
import com.BTL_LTW.JanyPet.service.implement.CuponServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cupons")
public class CuponController {

    @Autowired
    private final CuponServiceImpl cuponServiceImpl;
    private final CuponMapperImpl cuponMapperImpl;

    public CuponController(CuponServiceImpl cuponServiceImpl, CuponMapperImpl cuponMapperImpl) {
        this.cuponServiceImpl = cuponServiceImpl;
        this.cuponMapperImpl = cuponMapperImpl;
    }

    // Tạo mới
    @PostMapping
    public CuponResponse createCupon(@RequestBody CuponCreateRequest request) {
        return cuponServiceImpl.createCupon(request);
    }


    // Lấy ra một danh sách coupon
    @GetMapping
    List<CuponResponse> getCupons() {
        return cuponServiceImpl.getAllCupons();
    }

    // Lấy ra một coupon dựa trên Id
    @GetMapping("/{id}")
    CuponResponse getCupon(@PathVariable("id") String id) {
        return cuponServiceImpl.getCuponById(id);
    }

    // Cập nhật thông tin
    @PutMapping("/{id}")
    public CuponResponse updateCupon(@PathVariable("id") String id, @RequestBody CuponUpdateRequest request) {
        return cuponServiceImpl.updateCupon(id, request);
    }

    // Xóa coupon
    @DeleteMapping("/{id}")
    public ResponseEntity<String> softDeleteCupon(@PathVariable String id) {
        cuponServiceImpl.deleteCupon(id);
        return ResponseEntity.ok("Cupon has been deactivated!");
    }
}