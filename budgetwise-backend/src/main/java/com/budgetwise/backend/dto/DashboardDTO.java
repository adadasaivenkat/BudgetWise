package com.budgetwise.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class DashboardDTO {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private Map<String, BigDecimal> expenseByCategory;

    // Monthly scoped data
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpense;
    private BigDecimal monthlyBalance;
    private Map<String, BigDecimal> monthlyExpenseByCategory;
    private java.util.List<BudgetDTO> budgets;
    private SavingsDTO monthlySavings;
}
