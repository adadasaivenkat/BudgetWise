package com.budgetwise.backend.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String clerkId;
    private String name;
    private String email;

}
