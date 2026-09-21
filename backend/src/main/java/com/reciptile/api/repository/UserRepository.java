package com.reciptile.api.repository;

import java.util.Optional;

import com.reciptile.api.auth.AppUser;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<AppUser, String> {
    Optional<AppUser> findFirstByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    Optional<AppUser> findByLocationAndEmailIgnoreCase(String location, String email);
    boolean existsByLocationAndEmailIgnoreCase(String location, String email);
}
