package com.BTL_LTW.JanyPet.configuration;

import com.BTL_LTW.JanyPet.common.Role;
import com.BTL_LTW.JanyPet.security.AuthEntryPointJwt;
import com.BTL_LTW.JanyPet.security.AuthTokenFilter;
import com.BTL_LTW.JanyPet.service.implement.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:8080", "http://localhost:5500", "http://127.0.0.1:5500"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .cors().and()  // Enable CORS
                .authorizeHttpRequests(authz -> authz
                        // In a real app, you'd restrict based on roles/permissions
                        .anyRequest().permitAll()
                );

        return http.build();
    }

//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//            .csrf(csrf -> csrf.disable())
//            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
//            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//            .authorizeHttpRequests(auth -> auth
//                .requestMatchers(
//                    "/login",
//                    "/** ",
//                    "/",
//                    "/index.html",
//                    "/login.html",
//                    "/register.html",
//                    "/favicon.ico",
//                    "/css/**",
//                    "/js/**",
//                    "/images/**",
//                    "/uploads/**",
//                        "/admin"
//                ).permitAll()
//                .requestMatchers(
//                    "/api/auth/**",
//                    "/api/users/register-admin",  // Add this line to allow admin registration
//                    "/api/users/init-admin",
//                    "/api/**"// Add this line for initial admin setup
//
//                ).permitAll()
//                .requestMatchers("/api/admin/**").hasRole("ADMIN")  // Spring sẽ tự thêm ROLE_
//                .requestMatchers("/api/employee/**").hasAuthority("ROLE_EMPLOYEE")
//                .requestMatchers("/api/users/**").hasAnyRole(
//                    Role.ADMIN.name(),      // Sẽ thành ROLE_ADMIN
//                    Role.EMPLOYEE.name(),   // Sẽ thành ROLE_EMPLOYEE
//                    Role.CUSTOMER.name()    // Sẽ thành ROLE_CUSTOMER
//                )
//                .anyRequest().authenticated()
//            );
//
//        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
//        http.authenticationProvider(authenticationProvider());
//
//        return http.build();
//    }
}