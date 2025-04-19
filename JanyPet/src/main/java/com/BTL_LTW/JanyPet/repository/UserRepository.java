package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.common.Role;
import com.BTL_LTW.JanyPet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByPhoneNumber(String phoneNumber);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    Boolean existsByPhoneNumber(String phoneNumber);

    @Query("SELECT u FROM User u WHERE u.isDeleted = false")
    List<User> findActiveUsers();

    @Modifying
    @Query("UPDATE User u SET u.isDeleted = true WHERE u.id = :id")
    void softDeleteUser(String id);

    Optional<User> findByRefreshToken(String refreshToken);

    long countByRole(String customer);

    List<User> findByRole(String role);

    //List<User> findByRoleAndVerifiedAndActive(Role role, Boolean verified, Boolean active);

    //List<User> findByRoleAndVerified(Role role, Boolean verified);

    List<User> findByRoleAndActive(Role role, Boolean active);

   // List<User> findByVerifiedAndActive(Boolean verified, Boolean active);

    //List<User> findByVerified(Boolean verified);

    List<User> findByActive(Boolean active);
}
