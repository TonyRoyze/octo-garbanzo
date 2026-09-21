package com.reciptile.api.auth;

import com.reciptile.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final String email;
    private final String password;
    private final String location;

    public AdminSeeder(UserRepository users, PasswordEncoder passwords,
            @Value("${app.admin.email:}") String email,
            @Value("${app.admin.password:}") String password,
            @Value("${app.admin.location:}") String location) {
        this.users = users;
        this.passwords = passwords;
        this.email = email.trim().toLowerCase();
        this.password = password;
        this.location = location.trim().toUpperCase();
    }

    @Override
    public void run(String... args) {
        if (!email.isBlank() && !password.isBlank() && !location.isBlank()
                && !users.existsByLocationAndEmailIgnoreCase(location, email)) {
            users.save(new AppUser("Store admin", email, location, passwords.encode(password), UserRole.ADMIN));
        }
    }
}
