package com.BTL_LTW.JanyPet.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.core.SpringVersion;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class shoppingCart extends BaseEntity<Long> {
    @ManyToOne
    @JoinColumn(name="userId", nullable = false)
    private user user;

}
