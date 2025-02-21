package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.user;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<user,String> {
    boolean existsByUsername(String name);
    Optional<user> findByUsername(String name);
}
