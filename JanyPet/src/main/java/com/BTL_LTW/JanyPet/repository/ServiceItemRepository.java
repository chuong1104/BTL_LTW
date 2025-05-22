package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.ServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceItemRepository extends JpaRepository<ServiceItem, String> {
    List<ServiceItem> findByServiceId(String serviceId);
    
    void deleteByServiceId(String serviceId);
}