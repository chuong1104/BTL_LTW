package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.Pet;
import com.BTL_LTW.JanyPet.entity.User;
import org.hibernate.validator.constraints.NotEmpty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;
@Repository
public interface PetRepository extends JpaRepository<Pet,String> {
    List<Pet> findByOwnerId(String ownerId);

    List<Pet> findByOwner(User owner);
}
