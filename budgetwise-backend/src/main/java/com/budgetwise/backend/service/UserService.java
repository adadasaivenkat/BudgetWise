package com.budgetwise.backend.service;

import com.budgetwise.backend.dto.UserDTO;
import com.budgetwise.backend.entity.User;
import com.budgetwise.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User syncUser(UserDTO userDTO) {
        // Validation check for identity fields
        if (userDTO.getEmail() == null || userDTO.getName() == null) {
            System.err
                    .println("Warning: syncUser called with incomplete identity for clerkId: " + userDTO.getClerkId());
        }

        User user = getOrCreateUser(userDTO.getClerkId(), userDTO.getEmail(), userDTO.getName());

        boolean changed = false;
        if (userDTO.getEmail() != null && !userDTO.getEmail().equals(user.getEmail())) {
            user.setEmail(userDTO.getEmail());
            changed = true;
        }
        if (userDTO.getName() != null && !userDTO.getName().equals(user.getName())) {
            user.setName(userDTO.getName());
            changed = true;
        }

        return changed ? userRepository.save(user) : user;
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public User updateUserProfile(String clerkId, UserDTO userDTO) {
        // Update profile usually doesn't create users, but we use getOrCreateUser for
        // safety
        // However, if we don't have email/name from JWT here, creation might fail.
        // Defensively extracting identity for this case too.
        String email = null;
        String name = null;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            email = jwt.getClaimAsString("email");
            name = jwt.getClaimAsString("name");
        }

        User user = getOrCreateUser(clerkId, email, name);

        if (userDTO.getName() != null)
            user.setName(userDTO.getName());

        return userRepository.save(user);
    }

    public User getUserByClerkId(String clerkId) {
        // Defensively extract identity from JWT token claims to prevent NULL constraint
        // crashes during creation
        String email = null;
        String name = null;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            email = jwt.getClaimAsString("email");
            name = jwt.getClaimAsString("name");
        }

        return getOrCreateUser(clerkId, email, name);
    }

    public User getOrCreateUser(String clerkId, String email, String name) {
        return userRepository.findByClerkId(clerkId)
                .orElseGet(() -> {
                    if (email == null || name == null) {
                        throw new IllegalArgumentException(
                                "Email and name must be provided (extracted from JWT) for new user creation: "
                                        + clerkId);
                    }
                    try {
                        User newUser = new User();
                        newUser.setClerkId(clerkId);
                        newUser.setEmail(email);
                        newUser.setName(name);
                        System.out.println("Creating new user with identity: " + email + " (" + name + ")");
                        return userRepository.save(newUser);
                    } catch (org.springframework.dao.DataIntegrityViolationException e) {
                        // Handle race condition: user was created by another thread
                        return userRepository.findByClerkId(clerkId)
                                .orElseThrow(() -> new RuntimeException(
                                        "Unexpected error retrieving user after integrity violation"));
                    }
                });
    }
}
