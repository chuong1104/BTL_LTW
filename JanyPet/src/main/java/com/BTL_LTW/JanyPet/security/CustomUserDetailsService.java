package com.BTL_LTW.JanyPet.security;

import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrPhone) throws UsernameNotFoundException {
        // Try to find user by email first
        Optional<User> userByEmail = userRepository.findByEmail(usernameOrPhone);
        if (userByEmail.isPresent()) {
            return userByEmail.get(); // Return User directly as it implements UserDetails
        }

        // If not found by email, try by phone number
        Optional<User> userByPhone = userRepository.findByPhoneNumber(usernameOrPhone);
        if (userByPhone.isPresent()) {
            return userByPhone.get(); // Return User directly as it implements UserDetails
        }

        // If not found by either, throw exception
        throw new UsernameNotFoundException("Không tìm thấy người dùng với email hoặc số điện thoại: " + usernameOrPhone);
    }
}