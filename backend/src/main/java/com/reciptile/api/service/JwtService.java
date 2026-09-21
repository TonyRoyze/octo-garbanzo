package com.reciptile.api.service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import com.reciptile.api.auth.AppUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final JwtEncoder encoder;
    private final Duration lifetime;

    public JwtService(JwtEncoder encoder, @Value("${app.jwt.hours:8}") long hours) {
        this.encoder = encoder;
        this.lifetime = Duration.ofHours(hours);
    }

    public String issue(AppUser user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("reciptile-api")
                .issuedAt(now)
                .expiresAt(now.plus(lifetime))
                .subject(user.getId())
                .claim("name", user.getName())
                .claim("email", user.getEmail())
                .claim("location", user.getLocation())
                .claim("roles", List.of(user.getRole().name()))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
