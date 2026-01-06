package com.budgetwise.backend.service;

import com.budgetwise.backend.dto.DashboardDTO;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.errors.ApiException;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class AIService {

    private final DashboardService dashboardService;
    private final Client client;

    public AIService(DashboardService dashboardService,
            @org.springframework.beans.factory.annotation.Value("${gemini.api.key}") String apiKey) {
        this.dashboardService = dashboardService;
        this.client = new Client.Builder().apiKey(apiKey).build();
    }

    public String getBudgetAdvice(String clerkId) {
        DashboardDTO dashboardData = dashboardService.getDashboardData(clerkId);

        // Format budgets for prompt
        String budgetsText = dashboardData.getBudgets().stream()
                .map(b -> String.format("- %s: spent ₹%s / limit ₹%s", b.getCategory(), b.getSpentAmount(),
                        b.getLimitAmount()))
                .collect(Collectors.joining("\n"));

        // Format savings for prompt
        String savingsText = "No savings target set for this month.";
        if (dashboardData.getMonthlySavings() != null) {
            com.budgetwise.backend.dto.SavingsDTO s = dashboardData.getMonthlySavings();
            java.math.BigDecimal target = s.getTargetAmount();
            java.math.BigDecimal progress = s.getProgressAmount();
            java.math.BigDecimal diff = target.subtract(progress);
            String status = diff.signum() <= 0 ? "Ahead/Achieved" : "Behind by ₹" + diff;

            savingsText = String.format("Monthly Savings:\n- Target: ₹%s\n- Current Progress: ₹%s\n- Status: %s",
                    target, progress, status);
        }

        // Construct prompt with monthly context
        String prompt = String.format(
                "I am a user of a budget app. Here is my financial summary for the current month:\n" +
                        "Monthly Income: ₹%s\n" +
                        "Monthly Expenses: ₹%s\n" +
                        "Monthly Balance: ₹%s\n" +
                        "Budgets vs Spent:\n%s\n\n" +
                        "%s\n\n" +
                        "Please provide brief, actionable budget advice and insights based on this monthly data. " +
                        "Focus on controlling spending this month, improving savings, and avoiding exceeding budgets. "
                        +
                        "Please also consider the user's savings goals and progress when giving advice. " +
                        "All monetary values must be shown in INR and formatted using the ₹ symbol. " +
                        "Avoid using $, USD, or other currencies in responses. " +
                        "Keep the advice under 200 words.",
                dashboardData.getMonthlyIncome(),
                dashboardData.getMonthlyExpense(),
                dashboardData.getMonthlyBalance(),
                budgetsText,
                savingsText);

        try {
            GenerateContentResponse response = client.models.generateContent(
                    "gemini-2.5-flash",
                    prompt,
                    null);
            return response.text();
        } catch (ApiException e) {
            if (e.code() == 429) {
                return "Our AI advisor is currently busy (Quota Exceeded). Please try again later.";
            }
            e.printStackTrace();
            return "Unable to generate advice at this time due to an API error.";

        } catch (Exception e) {
            e.printStackTrace();
            return "An unexpected error occurred while fetching advice.";
        }
    }
}
