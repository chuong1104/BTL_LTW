package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.common.BookingStatus;
import com.BTL_LTW.JanyPet.dto.request.BookingCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.BookingUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.BookingResponse;
import com.BTL_LTW.JanyPet.entity.Booking;
import com.BTL_LTW.JanyPet.entity.Pet;
import com.BTL_LTW.JanyPet.entity.Service;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.exception.ResourceNotFoundException;
import com.BTL_LTW.JanyPet.mapper.Interface.BookingMapper;
import com.BTL_LTW.JanyPet.repository.BookingRepository;
import com.BTL_LTW.JanyPet.repository.PetRepository;
import com.BTL_LTW.JanyPet.repository.ServiceRepository;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import com.BTL_LTW.JanyPet.service.Interface.BookingService;

// Ensure the BookingService interface is present in the 'com.BTL_LTW.JanyPet.service' package.
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Component
public class BookingServiceImpl implements BookingService {


    @Autowired private BookingRepository bookingRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private PetRepository petRepo;
    @Autowired private ServiceRepository serviceRepo;
    @Autowired private BookingMapper mapper;

    @Override
    @Transactional 
    public BookingResponse create(BookingCreationRequest req) {
        Booking booking = mapper.toEntity(req);

        // --- resolve User ---
        User customer = userRepo.findById(String.valueOf(req.getUserId()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        booking.setUser(customer);

        // --- resolve Pet ---
        Pet pet = petRepo.findById(String.valueOf(req.getPetId()))
                .orElseThrow(() -> new IllegalArgumentException("Pet not found"));
        booking.setPet(pet);

        // --- resolve Services ---
        List<Service> services = serviceRepo.findAllById(req.getServiceIds());
        if (services.isEmpty()) {
            throw new IllegalArgumentException("No valid services found");
        }
        booking.setServices(services);

        // --- optional Staff ---
        if (req.getStaffId() != null) {
            User staff = userRepo.findById(req.getStaffId())
                    .orElseThrow(() -> new IllegalArgumentException("Staff not found"));
            booking.setAssignedStaff(staff);
        }

        // --- compute endTime (+30' mỗi service) ---
        if (req.getStartTime() != null) {
            booking.setStartTime(req.getStartTime());
            long totalMinutes = services.size() * 30L;
            booking.setEndTime(req.getStartTime().plusMinutes(totalMinutes));
        }

        Booking saved = bookingRepo.save(booking);
        return mapper.toDTO(saved);
    }

    @Override
    @Transactional
    public BookingResponse update(String id, BookingUpdateRequest req) {
        Booking booking = bookingRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        mapper.updateEntity(booking, req);

        if (req.getPetId() != null) {
            Pet pet = petRepo.findById(String.valueOf(req.getPetId()))
                    .orElseThrow(() -> new IllegalArgumentException("Pet not found"));
            booking.setPet(pet);
        }

        if (req.getServiceIds() != null) {
            List<Service> services = serviceRepo.findAllById(req.getServiceIds());
            if (services.isEmpty()) {
                throw new IllegalArgumentException("No valid services found");
            }
            booking.setServices(services);
        }

        if (req.getStaffId() != null) {
            User staff = userRepo.findById(req.getStaffId())
                    .orElseThrow(() -> new IllegalArgumentException("Staff not found"));
            booking.setAssignedStaff(staff);
        }

        // recalc endTime
        if (booking.getStartTime() != null && booking.getServices() != null) {
            long minutes = booking.getServices().size() * 30L;
            booking.setEndTime(booking.getStartTime().plusMinutes(minutes));
        }

        Booking saved = bookingRepo.save(booking);
        return mapper.toDTO(saved);
    }

    @Transactional(readOnly = true)
    @Override
    public BookingResponse getById(String id) {
        Booking booking = bookingRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        return mapper.toDTO(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAll() {
        return bookingRepo.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByUserId(String userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
       
        return bookingRepo.findByUser(user).stream()
                .map(mapper::toDTO) 
                .collect(Collectors.toList());
    }
    @Override
    public void delete(String id) {
        if (!bookingRepo.existsById(id)) {
            throw new IllegalArgumentException("Booking not found");
        }
        bookingRepo.deleteById(id);
    }
    public BookingResponse findById(String id) {

    Booking booking = bookingRepo.findBookingWithServices(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

    return mapper.toDTO(booking);
}
    @Override
    @Transactional
    public BookingResponse updateStatus(String id, BookingUpdateRequest newStatus) {
        Booking booking = bookingRepo.findByIdWithAllDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        booking.setStatus(newStatus.getStatus());

        Booking updatedBooking = bookingRepo.save(booking);
        return mapper.toDTO(updatedBooking);
    }
}
