package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,String> {
    boolean existsByUsername(String name);
    Optional<User> findByUsername(String name);

    @Modifying
    @Query("UPDATE User u Set u.isActive = false WHERE u.id = :userId")
    void softDeleteUser(@Param("userId") Integer userId);

    //Chi lay User dang hoat dong
    @Query("SELECT u FROM User u WHERE u.isActive = true")
    List<User> findActiveUsers();

}
