package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.BTL_LTW.JanyPet.entity.Order;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    Optional<Payment> findByOrder(Order order);

    Optional<Payment> findByTransactionId(String transactionId);
}