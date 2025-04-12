package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.dto.request.BookingCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.BookingUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.BookingResponse;
import com.BTL_LTW.JanyPet.service.BookingService;
import com.BTL_LTW.JanyPet.service.implement.BookingServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private  final BookingServiceImpl bookingServiceImpl;


    @Autowired
    public BookingController(BookingService bookingService, BookingServiceImpl bookingServiceImpl) {
        this.bookingService = bookingService;
        this.bookingServiceImpl = bookingServiceImpl;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(@RequestBody BookingCreationRequest req) {
        BookingResponse resp = bookingService.create(req);
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingResponse> update(
            @PathVariable("id") String id,
            @RequestBody BookingUpdateRequest req
    ) {
        BookingResponse resp = bookingService.update(id, req);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getById(@PathVariable("id") String id) {
        BookingResponse resp = bookingService.getById(id);
        return ResponseEntity.ok(resp);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAll() {
        List<BookingResponse> list = bookingService.getAll();
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        bookingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
