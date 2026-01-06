package com.budgetwise.backend.repository;

import com.budgetwise.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByClerkId(String clerkId);

    Optional<User> findByEmail(String email);

    boolean existsByClerkId(String clerkId);
}
