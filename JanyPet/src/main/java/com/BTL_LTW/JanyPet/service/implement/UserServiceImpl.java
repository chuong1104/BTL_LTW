package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.common.Role;
import com.BTL_LTW.JanyPet.dto.request.UserCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.UserUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.UserResponse;
import com.BTL_LTW.JanyPet.entity.User;
//import com.BTL_LTW.JanyPet.mapper.Interface.UserMapper;
import com.BTL_LTW.JanyPet.mapper.Interface.UserMapper;
import com.BTL_LTW.JanyPet.mapper.Implement.UserMapperImpl;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import com.BTL_LTW.JanyPet.service.Interface.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service

public class UserServiceImpl implements UserService {


    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, UserMapperImpl userMapperImpl, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapperImpl;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User createUser(UserCreationRequest request){
        User user = userMapper.toEntity(request);
        return userRepository.save(user);
    }

    // Tra ve danh sach tat ca nguoi dung
    @Override
    public List<UserResponse> getUsers(){
        return userRepository.findActiveUsers().stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Lay ra nguoi dung dua tren id, neu khong se tra ra ngoai le
    @Override
    public UserResponse getUserById(String id){
        return userMapper.toDTO(userRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("user not found")));
    }

    // cap nhat thong tin nguoi dung qua id
    @Override
    public UserResponse updateUser(String id, UserUpdateRequest request){
        // Lay ra nguoi dung thong qua id tu phuong thuc getUser() ben tren
        User user = userRepository.findById(id).orElseThrow(()->new RuntimeException("user not found"));
        userMapper.updateEntity(user,request);
        return userMapper.toDTO(userRepository.save(user));
    }


    // Xoa nguoi dung
    @Transactional
    public void softDeleteUser(Integer Id){
        userRepository.softDeleteUser(Id);
    }

    @Override
    public User registerUser(String userName,
                             String email,
                             String phoneNumber,
                             String password,
                             Role role) {
        User u = new User();
        u.setUsername(userName);
        u.setEmail(email);
        u.setPhoneNumber(phoneNumber);
        u.setPassword(passwordEncoder.encode(password));
        u.setRole(role);
        return userRepository.save(u);
    }
    @Override
    public User findByPhoneNumber(String phoneNumber) {
        return (User) userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
