package com.budgetwise.backend.controller;

import com.budgetwise.backend.dto.UserDTO;
import com.budgetwise.backend.entity.User;
import com.budgetwise.backend.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/sync")
    public User syncUser(@AuthenticationPrincipal Jwt jwt, @RequestBody UserDTO userDTO) {
        String clerkId = jwt.getSubject();
        userDTO.setClerkId(clerkId);

        // Extract identity from JWT securely
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");

        if (email != null)
            userDTO.setEmail(email);
        if (name != null)
            userDTO.setName(name);

        return userService.syncUser(userDTO);
    }

    @GetMapping("/me")
    public User getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        String clerkId = jwt.getSubject();
        return userService.getUserByClerkId(clerkId);
    }

    @PutMapping("/profile")
    public User updateProfile(@AuthenticationPrincipal Jwt jwt, @RequestBody UserDTO userDTO) {
        String clerkId = jwt.getSubject();
        return userService.updateUserProfile(clerkId, userDTO);
    }
}
