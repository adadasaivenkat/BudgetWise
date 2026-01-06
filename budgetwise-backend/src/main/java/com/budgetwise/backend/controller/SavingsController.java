package com.budgetwise.backend.controller;

import com.budgetwise.backend.dto.SavingsDTO;
import com.budgetwise.backend.service.SavingsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/savings")
public class SavingsController {

    private final SavingsService savingsService;

    public SavingsController(SavingsService savingsService) {
        this.savingsService = savingsService;
    }

    @PostMapping
    public SavingsDTO createSavings(@AuthenticationPrincipal Jwt jwt, @RequestBody SavingsDTO dto) {
        return savingsService.createOrUpdateSavings(jwt.getSubject(), dto);
    }

    @PutMapping
    public SavingsDTO updateSavings(@AuthenticationPrincipal Jwt jwt, @RequestBody SavingsDTO dto) {
        return savingsService.createOrUpdateSavings(jwt.getSubject(), dto);
    }

    @GetMapping
    public List<SavingsDTO> getAllSavings(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        return savingsService.getAllSavings(jwt.getSubject(), month, year);
    }

    @DeleteMapping("/{id}")
    public void deleteSavings(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        savingsService.deleteSavings(jwt.getSubject(), id);
    }
}
