package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.common.ServiceCategory;
import com.BTL_LTW.JanyPet.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.OptionalDouble;

@Repository
public interface ServiceRepository extends JpaRepository<Service, String> {
    List<Service> findByCategory(ServiceCategory category);
    List<Service> findByActive(Boolean active);

}
