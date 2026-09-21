package com.reciptile.api.service;

import java.util.Locale;

import com.reciptile.api.auth.AppUser;
import com.reciptile.api.auth.AuthException;
import com.reciptile.api.auth.AuthResponse;
import com.reciptile.api.auth.LoginRequest;
import com.reciptile.api.auth.RegisterRequest;
import com.reciptile.api.auth.UserRole;
import com.reciptile.api.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final JwtService jwt;

    public AuthService(UserRepository users, PasswordEncoder passwords, JwtService jwt) {
        this.users = users;
        this.passwords = passwords;
        this.jwt = jwt;
    }

    public AuthResponse registerCustomer(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (users.existsByEmailIgnoreCase(email)) throw new AuthException("An account already exists for this email");
        AppUser user = users.save(new AppUser(request.name().trim(), email, "", request.browserLocation(),
                passwords.encode(request.password()), UserRole.CUSTOMER));
        return response(user);
    }

    public AuthResponse login(LoginRequest request) {
        AppUser user = users.findFirstByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(() -> new AuthException("Invalid email or password"));
        if (!passwords.matches(request.password(), user.getPasswordHash())) {
            throw new AuthException("Invalid email or password");
        }
        return response(user);
    }

    private AuthResponse response(AppUser user) {
        return new AuthResponse(jwt.issue(user), AuthResponse.UserView.from(user));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
