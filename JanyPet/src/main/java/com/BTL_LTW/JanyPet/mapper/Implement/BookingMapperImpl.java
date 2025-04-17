package com.BTL_LTW.JanyPet.mapper.Implement;

import com.BTL_LTW.JanyPet.dto.request.BookingCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.BookingUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.BookingResponse;
import com.BTL_LTW.JanyPet.dto.response.PetResponse;
import com.BTL_LTW.JanyPet.dto.response.ServiceResponse;
import com.BTL_LTW.JanyPet.dto.response.UserResponse;
import com.BTL_LTW.JanyPet.entity.Booking;
import com.BTL_LTW.JanyPet.entity.Pet;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.mapper.Interface.BookingMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class BookingMapperImpl implements BookingMapper {

    @Override
    public BookingResponse toDTO(Booking entity) {
        if (entity == null) return null;

        // Convert User to UserResponse (Customer)
        User customer = entity.getUser();
        UserResponse customerDto = customer == null ? null : new UserResponse(
                customer.getUsername(),
                customer.getRole(),
                customer.getEmail(),
                customer.getGender(),
                customer.getAddress(),
                customer.getPhoneNumber(),
                customer.getVerified()
        );

        // Convert Pet to PetResponse
        Pet pet = entity.getPet();
        PetResponse petDto = pet == null ? null : new PetResponse(
                pet.getId(),
                pet.getName(),
                pet.getSpecies(),
                pet.getBreed(),
                pet.getBirthDate(),
                pet.getGender(),
                pet.getWeight(),
                pet.getVaccinated(),
                pet.getHealthNotes(),
                pet.getOwner(),
                pet.getCreatedAt(),
                pet.getUpdatedAt()
        );

        // Convert List<Service> to List<ServiceResponse>
        List<ServiceResponse> servicesDto = entity.getServices() == null ? null :
                entity.getServices().stream().map(s -> new ServiceResponse(
                        s.getId(),
                        s.getName(),
                        s.getDescription(),
                        s.getPrice(),
                        s.getImages(),
                       s.getMaxPetsPerSlot(),
                        s.getRequiresVaccination(),
                        s.getCategory(),
                        s.getActive(),
                        s.getCreatedAt(),
                        s.getUpdatedAt()
                )).collect(Collectors.toList());

        // Convert Assigned Staff
        User staff = entity.getAssignedStaff();
        UserResponse staffDto = staff == null ? null : new UserResponse(
                staff.getUsername(),
                staff.getRole() != null ? staff.getRole() : null,
                staff.getEmail(),
                staff.getGender(),
                staff.getAddress(),
                staff.getPhoneNumber(),
                staff.getVerified()
        );

        return new BookingResponse(
                entity.getId(),
                petDto,
                customerDto,
                servicesDto,
                entity.getBookingDate(),
                entity.getStartTime(),
                entity.getEndTime(),
                entity.getStatus(),
                entity.getNotes(),
                staffDto,
                entity.getCreatedAt(),
                entity.getUpdatedAt()

        );
    }

    @Override
    public Booking toEntity(BookingCreationRequest creationDTO) {
        if (creationDTO == null) return null;

        Booking booking = new Booking();
        booking.setBookingDate(creationDTO.getBookingDate());
        booking.setStartTime(creationDTO.getStartTime());
        booking.setStatus(creationDTO.getStatus());
        booking.setNotes(creationDTO.getNotes());

        // Relationships (user, pet, services, assignedStaff, endTime) -> handled in service layer
        return booking;
    }

    @Override
    public void updateEntity (Booking entity,BookingUpdateRequest updateDTO) {
        if (entity == null || updateDTO == null) return;

        if (updateDTO.getBookingDate() != null) {
            entity.setBookingDate(updateDTO.getBookingDate());
        }
        if (updateDTO.getStartTime() != null) {
            entity.setStartTime(updateDTO.getStartTime());
        }
        if (updateDTO.getStatus() != null) {
            entity.setStatus(updateDTO.getStatus());
        }
        if (updateDTO.getNotes() != null) {
            entity.setNotes(updateDTO.getNotes());
        }

        // Relationships (petId, serviceIds, assignedStaffId) will be handled in the service layer
    }
}
