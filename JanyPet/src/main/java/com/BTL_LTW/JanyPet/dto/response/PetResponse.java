package com.BTL_LTW.JanyPet.dto.response;

import com.BTL_LTW.JanyPet.entity.User;

import java.sql.Timestamp;
import java.time.LocalDate;

public class PetResponse {

    private String id;

    private String name;

    private String species;

    private String breed;

    private LocalDate birthDate;

    private String gender;

    private Double weight;

    private Boolean vaccinated;

    private String healthNotes;

    private User owner;

    // timestamps from BaseEntity
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public PetResponse(String id, String name, String species, String breed, LocalDate birthDate, String gender, Double weight, Boolean vaccinated, String healthNotes, User owner, Timestamp createdAt, Timestamp updatedAt) {
        this.id = id;
        this.name = name;
        this.species = species;
        this.breed = breed;
        this.birthDate = birthDate;
        this.gender = gender;
        this.weight = weight;
        this.vaccinated = vaccinated;
        this.healthNotes = healthNotes;
        this.owner = owner;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public PetResponse() {

    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecies(String species) {
        return this.species;
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

    public Boolean getVaccinated() {
        return vaccinated;
    }

    public void setVaccinated(Boolean vaccinated) {
        this.vaccinated = vaccinated;
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

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
}
