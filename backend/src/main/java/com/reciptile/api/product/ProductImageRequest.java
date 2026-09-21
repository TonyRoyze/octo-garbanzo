package com.reciptile.api.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProductImageRequest(
        @NotBlank @Size(max = 300) String key,
        @NotBlank @Size(max = 2048) @Pattern(regexp = "^https://.+", message = "must be an HTTPS URL") String url,
        @Size(max = 160) String alt) {
}
