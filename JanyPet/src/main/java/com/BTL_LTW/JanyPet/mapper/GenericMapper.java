package com.BTL_LTW.JanyPet.mapper;

import org.springframework.stereotype.Component;


public interface GenericMapper<E, D, C, U> {
    D toDTO(E entity);
    E toEntity(C creationDTO);
    default void updateEntity(E entity, U updateDTO){};
}
/*
E (Entity)
D (DTO)
C (Create DTO): Đại diện cho DTO khi tạo mới - VD: UserCreationRequest
U (Update DTO): Đại diện cho DTO khi cập nhật - VD: UserUpdateRequest

D toDTO(E entity): chuyển Entity thành DTO để gửi dữ liệu ra Api
E toEntity(C creationDTO): chuyển DTO -> Entity để lưu vào Database

void updateEntity(E entity, U updateDTO): cập nhật dữ liệu từ Update DTO và Entity (không null)
dùng trong trường hợp cập nhật một Entity có sẵn trong DB

*/