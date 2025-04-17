package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import com.BTL_LTW.JanyPet.service.Interface.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class UserDetailsServiceImpl implements UserDetailsService, CustomUserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user;
        // Kiểm tra xem identifier có phải email hay số điện thoại
        if (isValidEmail(identifier)) {
            user = userRepository.findByEmail(identifier)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + identifier));
        } else if (isValidPhoneNumber(identifier)) {
            user = userRepository.findByPhoneNumber(identifier)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with phone number: " + identifier));
        } else {
            throw new UsernameNotFoundException("Invalid identifier format: " + identifier);
        }

        // Return the User entity directly since it implements UserDetails
        return user;
    }

    private boolean isValidEmail(String email) {
        if(email == null) return false;
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        return Pattern.matches(emailRegex, email);
    }

    private boolean isValidPhoneNumber(String phone) {
        if(phone == null) return false;
        String phoneRegex = "^(0|84|\\+84)(\\d{9,10})$";
        return Pattern.matches(phoneRegex, phone);
    }

    @Override
    public UserDetails loadUserById(String id) throws UsernameNotFoundException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        // Return the User entity directly since it implements UserDetails
        return user;
    }
}