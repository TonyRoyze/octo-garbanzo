package com.reciptile.api.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.reciptile.api.upload.PrepareImageUploadRequest;
import com.reciptile.api.upload.PreparedImageUpload;
import com.reciptile.api.upload.UploadException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class UploadThingService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/avif");
    private static final Pattern API_KEY_PATTERN = Pattern.compile("\\\"apiKey\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"");

    private final RestClient client;
    private final String token;
    private final long maxImageBytes;

    public UploadThingService(
            @Value("${app.uploadthing.token:}") String token,
            @Value("${app.uploadthing.max-image-bytes:5242880}") long maxImageBytes) {
        this.client = RestClient.builder().baseUrl("https://api.uploadthing.com").build();
        this.token = token;
        this.maxImageBytes = maxImageBytes;
    }

    public PreparedImageUpload prepareProductImage(PrepareImageUploadRequest request) {
        if (token.isBlank()) {
            throw new UploadException("Product image uploads are not configured");
        }
        if (!ALLOWED_IMAGE_TYPES.contains(request.contentType())) {
            throw new IllegalArgumentException("Use a JPEG, PNG, WebP, or AVIF image");
        }
        if (request.fileSize() > maxImageBytes) {
            throw new IllegalArgumentException("Product images must be 5 MB or smaller");
        }

        try {
            String apiKey = extractApiKey();
            UploadThingResponse response = client.post()
                    .uri("/v7/prepareUpload")
                    .header("x-uploadthing-api-key", apiKey)
                    .header("x-uploadthing-be-adapter", "spring-boot")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "fileName", request.fileName().trim(),
                            "fileSize", request.fileSize(),
                            "fileType", request.contentType(),
                            "contentDisposition", "inline",
                            "acl", "public-read"))
                    .retrieve()
                    .body(UploadThingResponse.class);

            if (response == null || response.key() == null || response.url() == null) {
                throw new UploadException("UploadThing returned an incomplete upload response");
            }
            return new PreparedImageUpload(response.key(), response.url());
        } catch (RestClientException exception) {
            throw new UploadException("UploadThing could not prepare the image upload", exception);
        }
    }

    private String extractApiKey() {
        // Supporting a raw sk_* key is useful for older UploadThing credentials.
        if (token.startsWith("sk_")) return token;

        try {
            String decoded = new String(Base64.getDecoder().decode(token), StandardCharsets.UTF_8);
            Matcher matcher = API_KEY_PATTERN.matcher(decoded);
            if (matcher.find() && matcher.group(1).startsWith("sk_")) {
                return matcher.group(1);
            }
        } catch (IllegalArgumentException ignored) {
            // Report a configuration error below without exposing the token.
        }
        throw new UploadException("UPLOADTHING_TOKEN is not a valid UploadThing v7 token");
    }

    private record UploadThingResponse(String key, String url) {
    }
}
