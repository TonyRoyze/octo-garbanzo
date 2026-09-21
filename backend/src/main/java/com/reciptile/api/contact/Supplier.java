package com.reciptile.api.contact;

import java.time.Instant;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "suppliers")
public class Supplier {
    @Id private String id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String notes;
    @CreatedDate private Instant createdAt;
    @LastModifiedDate private Instant updatedAt;

    public Supplier() {}
    public Supplier(String name, String email, String phone, String address, String notes) {
        this.name = name; this.email = email; this.phone = phone; this.address = address; this.notes = notes;
    }
    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setName(String value) { name = value; }
    public void setEmail(String value) { email = value; }
    public void setPhone(String value) { phone = value; }
    public void setAddress(String value) { address = value; }
    public void setNotes(String value) { notes = value; }
}
