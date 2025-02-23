package com.BTL_LTW.JanyPet.controller;


import com.BTL_LTW.JanyPet.dto.request.UserCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.UserUpdateRequest;
import com.BTL_LTW.JanyPet.dto.respone.UserResponse;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.mapper.Implement.UserMapperImpl;
import com.BTL_LTW.JanyPet.service.implement.UserServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController  {

    @Autowired
    private final UserServiceImpl userServiceImpl;
    private final UserMapperImpl userMapperImpl;

    public UserController(UserServiceImpl userServiceImpl, UserMapperImpl userMapperImpl) {
        this.userServiceImpl = userServiceImpl;
        this.userMapperImpl = userMapperImpl;
    }



    // tao moi
    @PostMapping
    User createUser(@RequestBody UserCreationRequest request){
        return userServiceImpl.createUser(request);
    }

    // lay ra mot danh sach nguoi dung
    @GetMapping
    List<UserResponse> getUsers(){
        return userServiceImpl.getUsers();
    }

    // Lay ra mot nguoi dung dua tren Id
    @GetMapping("/{id}")
    UserResponse getUser(@PathVariable("id") String id){
        return userServiceImpl.getUser(id);
    }

    // Cap nhat thong tin
    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable("id") String id, @RequestBody UserUpdateRequest request){
        return userServiceImpl.updateUser(id,request);
    }

    // Xoa nguoi dung
    @DeleteMapping("/{id}")
    public ResponseEntity<String> softDeleteUser(@PathVariable Integer id) {
        userServiceImpl.softDeleteUser(id);
        return ResponseEntity.ok("User has been deactivated!");
    }


}
