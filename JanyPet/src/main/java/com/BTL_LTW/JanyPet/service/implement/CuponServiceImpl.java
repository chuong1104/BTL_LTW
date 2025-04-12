package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.dto.request.CuponCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.CuponUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.CuponResponse;
import com.BTL_LTW.JanyPet.entity.Cupon;
import com.BTL_LTW.JanyPet.repository.CuponRepository;

import com.BTL_LTW.JanyPet.service.Interface.CuponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CuponServiceImpl implements CuponService {

    @Autowired
    private CuponRepository cuponRepository;

    @Override
    public CuponResponse createCupon(CuponCreateRequest request) {
        Cupon cupon = new Cupon();
        cupon.setCode(request.getCode());
        cupon.setDiscountType(request.getDiscountType());
        cupon.setDiscountValue(request.getDiscountValue());
        cupon.setMinOrderAmount(request.getMinOrderAmount());
        cupon.setMaxOrderAmount(request.getMaxOrderAmount());
        cupon.setUsageLimit(request.getUsageLimit());
        cupon.setExpirationDate(request.getExpirationDate());
        cupon = cuponRepository.save(cupon);
        return mapToResponse(cupon);
    }

    @Override
    public CuponResponse updateCupon(String id, CuponUpdateRequest request) {
        Optional<Cupon> optionalCupon = cuponRepository.findById(id);
        if(optionalCupon.isEmpty()){
            throw new RuntimeException("Không tìm thấy Cupon với id: " + id);
        }
        Cupon cupon = optionalCupon.get();
        cupon.setDiscountType(request.getDiscountType());
        cupon.setDiscountValue(request.getDiscountValue());
        cupon.setMinOrderAmount(request.getMinOrderAmount());
        cupon.setMaxOrderAmount(request.getMaxOrderAmount());
        cupon.setUsageLimit(request.getUsageLimit());
        cupon.setExpirationDate(request.getExpirationDate());
        cupon = cuponRepository.save(cupon);
        return mapToResponse(cupon);
    }

    @Override
    public CuponResponse getCuponById(String id) {
        Cupon cupon = cuponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Cupon với id: " + id));
        return mapToResponse(cupon);
    }

    @Override
    public List<CuponResponse> getAllCupons() {
        return cuponRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCupon(String id) {
        if(!cuponRepository.existsById(id)){
            throw new RuntimeException("Không tìm thấy Cupon với id: " + id);
        }
        cuponRepository.deleteById(id);
    }

    private CuponResponse mapToResponse(Cupon cupon) {
        CuponResponse response = new CuponResponse();
        response.setId(cupon.getId());
        response.setCode(cupon.getCode());
        response.setDiscountType(cupon.getDiscountType());
        response.setDiscountValue(cupon.getDiscountValue());
        response.setMinOrderAmount(cupon.getMinOrderAmount());
        response.setMaxOrderAmount(cupon.getMaxOrderAmount());
        response.setUsageLimit(cupon.getUsageLimit());
        response.setExpirationDate(cupon.getExpirationDate());
        return response;
    }
}
