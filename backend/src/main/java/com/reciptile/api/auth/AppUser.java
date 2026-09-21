package com.reciptile.api.auth;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@CompoundIndex(name = "location_email_unique", def = "{'location': 1, 'email': 1}", unique = true)
public class AppUser {
    @Id
    private String id;
    private String name;
    private String email;
    private String location;
    private BrowserLocation browserLocation;
    private String passwordHash;
    private UserRole role;
    @CreatedDate
    private Instant createdAt;

    public AppUser() {}

    public AppUser(String name, String email, String location, String passwordHash, UserRole role) {
        this(name, email, location, null, passwordHash, role);
    }

    public AppUser(String name, String email, String location, BrowserLocation browserLocation,
            String passwordHash, UserRole role) {
        this.name = name;
        this.email = email;
        this.location = location;
        this.browserLocation = browserLocation;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getLocation() { return location; }
    public BrowserLocation getBrowserLocation() { return browserLocation; }
    public String getPasswordHash() { return passwordHash; }
    public UserRole getRole() { return role; }
    public Instant getCreatedAt() { return createdAt; }
}
