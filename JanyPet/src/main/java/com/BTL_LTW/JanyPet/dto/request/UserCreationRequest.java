package com.BTL_LTW.JanyPet.dto.request;


import com.BTL_LTW.JanyPet.common.Gender;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreationRequest {
    private String name;
    private String email;
    @Size(min = 6, message = "INVALID_PASSWORD")
    private String password;
    private Gender gender;
    private String address;
    private String phoneNumber;
}
