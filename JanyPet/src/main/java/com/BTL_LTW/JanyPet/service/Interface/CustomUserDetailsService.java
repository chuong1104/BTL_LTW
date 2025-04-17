package com.BTL_LTW.JanyPet.service.Interface;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public interface CustomUserDetailsService {
    UserDetails loadUserById(String id) throws UsernameNotFoundException;
}
