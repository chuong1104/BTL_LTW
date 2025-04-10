package com.BTL_LTW.JanyPet.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;


@Entity
public class ProductDetails extends BaseEntity<String>{

  @ManyToOne
  @JoinColumn(name="productId",nullable = false)
    private Product product;


  @ManyToOne
  @JoinColumn(name="categoryId", nullable = false)
    private Category category;

  @Column(nullable = false, length = 100)
    private String attributeKey;

  @Column(nullable = false, length = 255)
    private String attributeValue;

  public Product getProduct() {
    return product;
  }

  public void setProduct(Product product) {
    this.product = product;
  }

  public Category getCategory() {
    return category;
  }

  public void setCategory(Category category) {
    this.category = category;
  }

  public String getAttributeKey() {
    return attributeKey;
  }

  public void setAttributeKey(String attributeKey) {
    this.attributeKey = attributeKey;
  }

  public String getAttributeValue() {
    return attributeValue;
  }

  public void setAttributeValue(String attributeValue) {
    this.attributeValue = attributeValue;
  }
}
