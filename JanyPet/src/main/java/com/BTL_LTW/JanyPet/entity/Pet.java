package com.BTL_LTW.JanyPet.entity;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.*;

@Entity
public class Pet extends BaseEntity<String>{
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String species;

    private String breed;

    private LocalDate birthDate;

    private String gender;

    private Double weight;

    private Boolean vaccinated = false;

    private String healthNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL)
    private Set<Booking> bookings = new HashSet<>();


    public Boolean getVaccinated() {
        return vaccinated;
    }

    public void setVaccinated(Boolean vaccinated) {
        this.vaccinated = vaccinated;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecies() {
        return species;
    }

    public void setSpecies(String species) {
        this.species = species;
    }

    public String getBreed() {
        return breed;
    }

    public void setBreed(String breed) {
        this.breed = breed;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }




    public String getHealthNotes() {
        return healthNotes;
    }

    public void setHealthNotes(String healthNotes) {
        this.healthNotes = healthNotes;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public Set<Booking> getBookings() {
        return bookings;
    }

    public void setBookings(Set<Booking> bookings) {
        this.bookings = bookings;
    }

    public Pet( String name, String species, String breed, LocalDate birthDate, String gender, Double weight, Boolean vaccinated, String healthNotes, User owner, Set<Booking> bookings) {

        this.name = name;
        this.species = species;
        this.breed = breed;
        this.birthDate = birthDate;
        this.gender = gender;
        this.weight = weight;
        this.vaccinated = vaccinated;
        this.healthNotes = healthNotes;
        this.owner = owner;
        this.bookings = bookings;
    }

    public Pet() {
    }

    public void getSpecies(String species) {
    }
}
