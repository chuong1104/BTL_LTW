package com.BTL_LTW.JanyPet.mapper.Implement;


import com.BTL_LTW.JanyPet.dto.request.BookingCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.BookingUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.BookingResponse;
import com.BTL_LTW.JanyPet.entity.Booking;
import com.BTL_LTW.JanyPet.entity.Service;
import com.BTL_LTW.JanyPet.mapper.Interface.BookingMapper;
import com.BTL_LTW.JanyPet.mapper.Interface.PetMapper;
import com.BTL_LTW.JanyPet.mapper.Interface.ServiceMapper;
import com.BTL_LTW.JanyPet.mapper.Interface.UserMapper;
import com.BTL_LTW.JanyPet.repository.PetRepository;
import com.BTL_LTW.JanyPet.repository.ServiceRepository;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class BookingMapperImpl implements BookingMapper {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PetMapper petMapper;

    @Autowired
    private ServiceMapper serviceMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Override
    public BookingResponse toDTO(Booking entity) {
        if (entity == null) {
            return null;
        }

        BookingResponse dto = new BookingResponse();
        dto.setId(entity.getId());
        dto.setBookingDate(entity.getBookingDate());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setStatus(entity.getStatus());
        dto.setNotes(entity.getNotes());

        if (entity.getUser() != null) {
            dto.setUser(userMapper.toDTO(entity.getUser()));
        }

        if (entity.getPet() != null) {
            dto.setPet(petMapper.toDTO(entity.getPet()));
        }

        if (entity.getServices() != null) {
            dto.setServices(serviceMapper.toDTOList(entity.getServices()));
        }

        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }

    @Override
    public List<BookingResponse> toDTOList(List<Booking> entities) {
        if (entities == null) {
            return new ArrayList<>();
        }

        return entities.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }


    @Override
    public Booking toEntity(BookingCreationRequest creationDTO) {
        if (creationDTO == null) {
            return null;
        }

        Booking booking = new Booking();
        booking.setBookingDate(creationDTO.getBookingDate());
        booking.setStartTime(creationDTO.getStartTime());
        booking.setEndTime(creationDTO.getEndTime());
        booking.setStatus(creationDTO.getStatus());
        booking.setNotes(creationDTO.getNotes());

        if (creationDTO.getUserId() != null) {
            userRepository.findById(creationDTO.getUserId())
                    .ifPresent(booking::setUser);
        }

        if (creationDTO.getPetId() != null) {
            petRepository.findById(creationDTO.getPetId())
                    .ifPresent(booking::setPet);
        }

        if (creationDTO.getServiceIds() != null && !creationDTO.getServiceIds().isEmpty()) {
            List<Service> services = serviceRepository.findAllById(creationDTO.getServiceIds());
            booking.setServices(services);
        }

        return booking;
    }

    @Override
    public void updateEntity(Booking entity, BookingUpdateRequest updateDTO) {
        if (entity == null || updateDTO == null) {
            return;
        }

        // Only update fields that are not null in the DTO
        if (updateDTO.getBookingDate() != null) {
            entity.setBookingDate(updateDTO.getBookingDate());
        }

        if (updateDTO.getStartTime() != null) {
            entity.setStartTime(updateDTO.getStartTime());
        }

        if (updateDTO.getEndTime() != null) {
            entity.setEndTime(updateDTO.getEndTime());
        }

        if (updateDTO.getStatus() != null) {
            entity.setStatus(updateDTO.getStatus());
        }

        if (updateDTO.getNotes() != null) {
            entity.setNotes(updateDTO.getNotes());
        }

        if (updateDTO.getUserId() != null) {
            userRepository.findById(updateDTO.getUserId())
                    .ifPresent(entity::setUser);
        }

        if (updateDTO.getPetId() != null) {
            petRepository.findById(updateDTO.getPetId())
                    .ifPresent(entity::setPet);
        }

        if (updateDTO.getServiceIds() != null && !updateDTO.getServiceIds().isEmpty()) {
            List<Service> services = serviceRepository.findAllById(updateDTO.getServiceIds());
            entity.setServices(services);
        }
    }
}
