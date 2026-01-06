package com.budgetwise.backend.controller;

import com.budgetwise.backend.dto.BudgetDTO;
import com.budgetwise.backend.service.BudgetService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    public BudgetDTO createBudget(@AuthenticationPrincipal Jwt jwt, @RequestBody BudgetDTO dto) {
        return budgetService.createBudget(jwt.getSubject(), dto);
    }

    @PutMapping
    public BudgetDTO updateBudget(@AuthenticationPrincipal Jwt jwt, @RequestBody BudgetDTO dto) {
        return budgetService.createBudget(jwt.getSubject(), dto);
    }

    @GetMapping
    public List<BudgetDTO> getAllBudgets(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        String clerkId = jwt.getSubject();
        return budgetService.getAllBudgets(clerkId, category, month, year);
    }

    @DeleteMapping("/{id}")
    public void deleteBudget(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        String clerkId = jwt.getSubject();
        budgetService.deleteBudget(clerkId, id);
    }
}
