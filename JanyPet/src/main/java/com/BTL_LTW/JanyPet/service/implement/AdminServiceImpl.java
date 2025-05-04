package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.common.BookingStatus;
import com.BTL_LTW.JanyPet.common.Role;
import com.BTL_LTW.JanyPet.dto.request.UserUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.BookingResponse;
import com.BTL_LTW.JanyPet.dto.response.DashboardStats;
import com.BTL_LTW.JanyPet.dto.response.PetResponse;
import com.BTL_LTW.JanyPet.dto.response.UserResponse;
import com.BTL_LTW.JanyPet.entity.Booking;
import com.BTL_LTW.JanyPet.entity.Pet;
import com.BTL_LTW.JanyPet.entity.Service;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.mapper.Interface.BookingMapper;
import com.BTL_LTW.JanyPet.mapper.Interface.PetMapper;
import com.BTL_LTW.JanyPet.mapper.Interface.UserMapper;
import com.BTL_LTW.JanyPet.repository.BookingRepository;
import com.BTL_LTW.JanyPet.repository.PetRepository;
import com.BTL_LTW.JanyPet.repository.ServiceRepository;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import com.BTL_LTW.JanyPet.service.Interface.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import java.math.RoundingMode;

import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
@org.springframework.stereotype.Service
public class AdminServiceImpl implements AdminService {

    @Autowired private UserRepository userRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private PetRepository petRepository;
    @Autowired private ServiceRepository serviceRepository;

    @Autowired private UserMapper userMapper;
    @Autowired private BookingMapper bookingMapper;
    @Autowired private PetMapper petMapper;

    @Override
    public DashboardStats getDashboardStats() {
        DashboardStats stats = new DashboardStats();

        // Basic counts
        stats.setTotalBookings(bookingRepository.count());
        stats.setPendingBookings(bookingRepository.countByStatus(String.valueOf(BookingStatus.PENDING)));
        stats.setTodayBookings(bookingRepository.countByBookingDate(LocalDate.now()));
        stats.setTotalCustomers(userRepository.countByRole(String.valueOf(Role.CUSTOMER)));
        stats.setTotalPets(petRepository.count());
        stats.setTotalServices(serviceRepository.count());

        // Revenue calculations
        BigDecimal totalRevenue = calculateTotalRevenue();
        BigDecimal monthlyRevenue = calculateMonthlyRevenue();
        BigDecimal weeklyRevenue = calculateWeeklyRevenue();
        BigDecimal dailyRevenue = calculateDailyRevenue();

        stats.setTotalRevenue(totalRevenue);
        stats.setMonthlyRevenue(monthlyRevenue);
        stats.setWeeklyRevenue(weeklyRevenue);
        stats.setDailyRevenue(dailyRevenue);

        // Growth rate calculation (comparing current month to previous month)
        BigDecimal previousMonthRevenue = calculatePreviousMonthRevenue();
        if (previousMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            double growthRate = monthlyRevenue.subtract(previousMonthRevenue)
                    .divide(previousMonthRevenue, 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
            stats.setGrowthRate(growthRate);
        } else {
            stats.setGrowthRate(0.0);
        }

        // Bookings by status
        Map<String, Long> bookingsByStatus = getBookingsByStatus(null, null);
        stats.setBookingsByStatus(bookingsByStatus);

        // Bookings by service
        Map<String, Long> bookingsByService = getBookingsByService(null, null);
        stats.setBookingsByService(bookingsByService);

        // Revenue by service
        Map<String, BigDecimal> revenueByService = getRevenueByServiceBigDecimal(null, null);
        stats.setRevenueByService(revenueByService);

        // Bookings by day (last 7 days)
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);
        Map<String, Long> bookingsByDay = getBookingsByDay(startDate, endDate);
        stats.setBookingsByDay(bookingsByDay);

        // Revenue by day (last 7 days)
        Map<String, BigDecimal> revenueByDay = getRevenueByDayBigDecimal(startDate, endDate);
        stats.setRevenueByDay(revenueByDay);

        return stats;
    }

    @Override
    public List<UserResponse> getAllUsers(Role role, Boolean verified, Boolean active) {
        List<User> users;

        if (role != null && active != null) {
            users = userRepository.findByRoleAndActive(role, active);
        } else if (role != null) {
            users = userRepository.findByRole(String.valueOf(role));
        } else if (active != null) {
            users = userRepository.findByActive(active);
        } else {
            users = userRepository.findAll();
        }

        return users.stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toDTO(user);
    }

    @Override
    public UserResponse updateUser(String id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if email is being changed and already exists
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        // Check if phone number is being changed and already exists
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(user.getPhoneNumber())
                && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number already in use");
        }

        userMapper.updateEntity(user, request);
        User savedUser = userRepository.save(user);
        return userMapper.toDTO(savedUser);
    }

    @Override
    public UserResponse toggleLockUser(String id, boolean locked) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent locking the last admin
        if (user.getRole() == Role.ADMIN && locked) {
            long adminCount = userRepository.countByRole(String.valueOf(Role.ADMIN));
            if (adminCount <= 1) {
                throw new AccessDeniedException("Cannot lock the last admin account");
            }
        }

        user.setLocked(locked);
        User savedUser = userRepository.save(user);
        return userMapper.toDTO(savedUser);
    }

    @Override
    @Transactional
    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent deleting the last admin
        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.countByRole(String.valueOf(Role.ADMIN));
            if (adminCount <= 1) {
                throw new AccessDeniedException("Cannot delete the last admin account");
            }
        }

        // Soft delete
        userRepository.softDeleteUser(id);
    }

    @Override
    public List<BookingResponse> getAllBookings(BookingStatus status, LocalDate startDate, LocalDate endDate) {
        List<Booking> bookings;

        if (status != null && startDate != null && endDate != null) {
            bookings = bookingRepository.findByStatusAndBookingDateBetween(String.valueOf(status), startDate, endDate);
        } else if (status != null && startDate != null) {
            bookings = bookingRepository.findByStatusAndBookingDateGreaterThanEqual(status, startDate);
        } else if (status != null && endDate != null) {
            bookings = bookingRepository.findByStatusAndBookingDateLessThanEqual(status, endDate);
        } else if (startDate != null && endDate != null) {
            bookings = bookingRepository.findByBookingDateBetween(startDate, endDate);
        } else if (status != null) {
            bookings = bookingRepository.findByStatus(String.valueOf(status));
        } else if (startDate != null) {
            bookings = bookingRepository.findByBookingDateGreaterThanEqual(startDate);
        } else if (endDate != null) {
            bookings = bookingRepository.findByBookingDateLessThanEqual(endDate);
        } else {
            bookings = bookingRepository.findAll();
        }

        return bookings.stream()
                .map(bookingMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return bookingMapper.toDTO(booking);
    }

    @Override
    public BookingResponse updateBookingStatus(String id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(status);
        Booking savedBooking = bookingRepository.save(booking);
        return bookingMapper.toDTO(savedBooking);
    }

    @Override
    public void deleteBooking(String id) {
        if (!bookingRepository.existsById(id)) {
            throw new RuntimeException("Booking not found");
        }
        bookingRepository.deleteById(id);
    }

    @Override
    public List<PetResponse> getAllPets() {
        List<Pet> pets = petRepository.findAll();
        return pets.stream()
                .map(petMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Long> getBookingsByStatus(LocalDate startDate, LocalDate endDate) {
        List<Booking> bookings;

        if (startDate != null && endDate != null) {
            bookings = bookingRepository.findByBookingDateBetween(startDate, endDate);
        } else if (startDate != null) {
            bookings = bookingRepository.findByBookingDateGreaterThanEqual(startDate);
        } else if (endDate != null) {
            bookings = bookingRepository.findByBookingDateLessThanEqual(endDate);
        } else {
            bookings = bookingRepository.findAll();
        }

        return bookings.stream()
                .collect(Collectors.groupingBy(
                        booking -> booking.getStatus().toString(),
                        Collectors.counting()
                ));
    }

    @Override
    public Map<String, Long> getBookingsByService(LocalDate startDate, LocalDate endDate) {
        List<Booking> bookings;

        if (startDate != null && endDate != null) {
            bookings = bookingRepository.findByBookingDateBetween(startDate, endDate);
        } else if (startDate != null) {
            bookings = bookingRepository.findByBookingDateGreaterThanEqual(startDate);
        } else if (endDate != null) {
            bookings = bookingRepository.findByBookingDateLessThanEqual(endDate);
        } else {
            bookings = bookingRepository.findAll();
        }

        Map<String, Long> result = new HashMap<>();

        for (Booking booking : bookings) {
            for (Service service : booking.getServices()) {
                String serviceName = service.getName();
                result.put(serviceName, result.getOrDefault(serviceName, 0L) + 1);
            }
        }

        return result;
    }

    @Override
    public Map<String, Double> getRevenueByService(LocalDate startDate, LocalDate endDate) {
        Map<String, BigDecimal> revenueMap = getRevenueByServiceBigDecimal(startDate, endDate);

        // Convert BigDecimal to Double for API compatibility
        return revenueMap.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().doubleValue()
                ));
    }

    private Map<String, BigDecimal> getRevenueByServiceBigDecimal(LocalDate startDate, LocalDate endDate) {
        List<Booking> bookings;

        if (startDate != null && endDate != null) {
            bookings = bookingRepository.findByBookingDateBetween(startDate, endDate);
        } else if (startDate != null) {
            bookings = bookingRepository.findByBookingDateGreaterThanEqual(startDate);
        } else if (endDate != null) {
            bookings = bookingRepository.findByBookingDateLessThanEqual(endDate);
        } else {
            bookings = bookingRepository.findAll();
        }

        Map<String, BigDecimal> result = new HashMap<>();

        for (Booking booking : bookings) {
            for (Service service : booking.getServices()) {
                String serviceName = service.getName();
                BigDecimal price = service.getPrice();

                result.put(serviceName, result.getOrDefault(serviceName, BigDecimal.ZERO).add(price));
            }
        }

        return result;
    }

    @Override
    public Map<String, Long> getBookingsByDay(LocalDate startDate, LocalDate endDate) {
        List<Booking> bookings;

        if (startDate == null) {
            startDate = LocalDate.now().minusDays(6);
        }

        if (endDate == null) {
            endDate = LocalDate.now();
        }

        bookings = bookingRepository.findByBookingDateBetween(startDate, endDate);

        Map<String, Long> result = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd");

        // Initialize all days in the range with zero count
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            result.put(currentDate.format(formatter), 0L);
            currentDate = currentDate.plusDays(1);
        }

        // Count bookings by day
        for (Booking booking : bookings) {
            String day = booking.getBookingDate().format(formatter);
            result.put(day, result.getOrDefault(day, 0L) + 1);
        }

        return result;
    }

    @Override
    public Map<String, Double> getRevenueByDay(LocalDate startDate, LocalDate endDate) {
        Map<String, BigDecimal> revenueMap = getRevenueByDayBigDecimal(startDate, endDate);

        // Convert BigDecimal to Double for API compatibility
        return revenueMap.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().doubleValue()
                ));
    }

    private Map<String, BigDecimal> getRevenueByDayBigDecimal(LocalDate startDate, LocalDate endDate) {
        List<Booking> bookings;

        if (startDate == null) {
            startDate = LocalDate.now().minusDays(6);
        }

        if (endDate == null) {
            endDate = LocalDate.now();
        }

        bookings = bookingRepository.findByBookingDateBetween(startDate, endDate);

        Map<String, BigDecimal> result = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd");

        // Initialize all days in the range with zero revenue
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            result.put(currentDate.format(formatter), BigDecimal.ZERO);
            currentDate = currentDate.plusDays(1);
        }

        // Calculate revenue by day
        for (Booking booking : bookings) {
            String day = booking.getBookingDate().format(formatter);
            BigDecimal bookingRevenue = calculateBookingRevenue(booking);
            result.put(day, result.getOrDefault(day, BigDecimal.ZERO).add(bookingRevenue));
        }

        return result;
    }

    // Helper methods for revenue calculations

    private BigDecimal calculateTotalRevenue() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .map(this::calculateBookingRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateMonthlyRevenue() {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        List<Booking> bookings = bookingRepository.findByBookingDateGreaterThanEqual(startOfMonth);
        return bookings.stream()
                .map(this::calculateBookingRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateWeeklyRevenue() {
        LocalDate startOfWeek = LocalDate.now().minusDays(LocalDate.now().getDayOfWeek().getValue() - 1);
        List<Booking> bookings = bookingRepository.findByBookingDateGreaterThanEqual(startOfWeek);
        return bookings.stream()
                .map(this::calculateBookingRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateDailyRevenue() {
        LocalDate today = LocalDate.now();
        List<Booking> bookings = bookingRepository.findByBookingDate(today);
        return bookings.stream()
                .map(this::calculateBookingRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculatePreviousMonthRevenue() {
        LocalDate startOfPreviousMonth = LocalDate.now().minusMonths(1).withDayOfMonth(1);
        LocalDate endOfPreviousMonth = LocalDate.now().withDayOfMonth(1).minusDays(1);
        List<Booking> bookings = bookingRepository.findByBookingDateBetween(startOfPreviousMonth, endOfPreviousMonth);
        return bookings.stream()
                .map(this::calculateBookingRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateBookingRevenue(Booking booking) {
        return booking.getServices().stream()
                .map(Service::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
