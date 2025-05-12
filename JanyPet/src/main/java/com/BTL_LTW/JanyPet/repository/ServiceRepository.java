package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.common.ServiceCategory;
import com.BTL_LTW.JanyPet.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, String> {
    List<Service> findByCategory(ServiceCategory category);
    
    List<Service> findByIsFeaturedTrue();
    
    List<Service> findByIsPopularTrue();
    
    List<Service> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);
    
    @Query("SELECT s FROM Service s WHERE s.category = com.BTL_LTW.JanyPet.common.ServiceCategory.PACKAGE")
    List<Service> findAllPackages();
    
    @Query("SELECT s FROM Service s JOIN FETCH s.bookings WHERE s.id = :id")
    Service findByIdWithBookings(String id);
    
}
