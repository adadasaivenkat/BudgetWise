package com.budgetwise.backend.controller;

import com.budgetwise.backend.service.AIService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/advice")
    public Map<String, String> getBudgetAdvice(@AuthenticationPrincipal Jwt jwt) {
        String clerkId = jwt.getSubject();
        String advice = aiService.getBudgetAdvice(clerkId);
        return Map.of("advice", advice);
    }
}
