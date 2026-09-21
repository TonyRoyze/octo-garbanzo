package com.reciptile.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;

import com.reciptile.api.auth.AppUser;
import com.reciptile.api.auth.AuthException;
import com.reciptile.api.auth.AuthResponse;
import com.reciptile.api.auth.BrowserLocation;
import com.reciptile.api.auth.LoginRequest;
import com.reciptile.api.auth.RegisterRequest;
import com.reciptile.api.auth.UserRole;
import com.reciptile.api.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock UserRepository users;
    @Mock PasswordEncoder passwords;
    @Mock JwtService jwt;
    @InjectMocks AuthService auth;

    @Test
    void registersCustomersWithHashedPasswords() {
        when(passwords.encode("password123")).thenReturn("hashed");
        when(users.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwt.issue(any(AppUser.class))).thenReturn("token");

        BrowserLocation location = new BrowserLocation(6.9271, 79.8612, 25.0);
        AuthResponse response = auth.registerCustomer(
                new RegisterRequest("Sam", " SAM@EXAMPLE.COM ", "password123", location));

        assertThat(response.user().email()).isEqualTo("sam@example.com");
        assertThat(response.user().role()).isEqualTo(UserRole.CUSTOMER);
        assertThat(response.user().location()).isEmpty();
        assertThat(response.user().browserLocation()).isEqualTo(location);
        assertThat(response.token()).isEqualTo("token");
    }

    @Test
    void rejectsAnInvalidPassword() {
        AppUser user = new AppUser("Admin", "admin@example.com", "LK", "hashed", UserRole.ADMIN);
        when(users.findFirstByEmailIgnoreCase("admin@example.com")).thenReturn(Optional.of(user));
        when(passwords.matches("wrong-password", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> auth.login(new LoginRequest("admin@example.com", "wrong-password")))
                .isInstanceOf(AuthException.class)
                .hasMessage("Invalid email or password");
    }
}
