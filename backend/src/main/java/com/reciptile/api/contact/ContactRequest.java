package com.reciptile.api.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactRequest(
        @NotBlank @Size(max = 120) String name,
        @Email @Size(max = 180) String email,
        @Size(max = 40) String phone,
        @Size(max = 500) String address,
        @Size(max = 1000) String notes) {}
