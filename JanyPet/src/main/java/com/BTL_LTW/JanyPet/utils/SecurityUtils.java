package com.BTL_LTW.JanyPet.utils;

import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public class SecurityUtils {

    /**
     * Gets the current authenticated user entity
     * @param userRepository The user repository to fetch the user from
     * @return The authenticated User entity
     */
    public static User getCurrentUser(UserRepository userRepository) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UsernameNotFoundException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof User) {
            // Principal is now directly a User entity
            return (User) principal;
        } else if (principal instanceof String) {
            // Handle the case where principal is a username string
            String username = (String) principal;
            // Try to find by email first, then by phone number
            return userRepository.findByEmail(username)
                    .orElseGet(() -> userRepository.findByPhoneNumber(username)
                            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username)));
        }

        throw new UsernameNotFoundException("Unexpected principal type: " + principal.getClass());
    }
}