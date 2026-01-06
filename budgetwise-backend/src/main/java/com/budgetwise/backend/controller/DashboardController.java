package com.budgetwise.backend.controller;

import com.budgetwise.backend.dto.DashboardDTO;
import com.budgetwise.backend.service.DashboardService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardDTO getDashboardData(@AuthenticationPrincipal Jwt jwt) {
        String clerkId = jwt.getSubject();
        return dashboardService.getDashboardData(clerkId);
    }
}
