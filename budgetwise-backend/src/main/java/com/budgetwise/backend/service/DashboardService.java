package com.budgetwise.backend.service;

import com.budgetwise.backend.dto.DashboardDTO;
import com.budgetwise.backend.entity.Transaction;
import com.budgetwise.backend.entity.User;
import com.budgetwise.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final UserService userService;
    private final BudgetService budgetService;
    private final SavingsService savingsService;

    public DashboardService(TransactionRepository transactionRepository, UserService userService,
            BudgetService budgetService, SavingsService savingsService) {
        this.transactionRepository = transactionRepository;
        this.userService = userService;
        this.budgetService = budgetService;
        this.savingsService = savingsService;
    }

    public DashboardDTO getDashboardData(String clerkId) {
        User user = userService.getUserByClerkId(clerkId);
        List<Transaction> allTransactions = transactionRepository.findByUser(user);

        // All-time calculations
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        Map<String, BigDecimal> expenseByCategory = new HashMap<>();

        for (Transaction t : allTransactions) {
            if (t.getType() == Transaction.TransactionType.INCOME) {
                totalIncome = totalIncome.add(t.getAmount());
            } else {
                totalExpense = totalExpense.add(t.getAmount());
                expenseByCategory.merge(t.getCategory(), t.getAmount(), BigDecimal::add);
            }
        }

        // Monthly calculations
        java.time.LocalDate now = java.time.LocalDate.now();
        java.time.LocalDate startOfMonth = now.with(java.time.temporal.TemporalAdjusters.firstDayOfMonth());
        java.time.LocalDate endOfMonth = now.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth());

        BigDecimal monthlyIncome = BigDecimal.ZERO;
        BigDecimal monthlyExpense = BigDecimal.ZERO;
        Map<String, BigDecimal> monthlyExpenseByCategory = new HashMap<>();

        for (Transaction t : allTransactions) {
            if (!t.getDate().isBefore(startOfMonth) && !t.getDate().isAfter(endOfMonth)) {
                if (t.getType() == Transaction.TransactionType.INCOME) {
                    monthlyIncome = monthlyIncome.add(t.getAmount());
                } else {
                    monthlyExpense = monthlyExpense.add(t.getAmount());
                    monthlyExpenseByCategory.merge(t.getCategory(), t.getAmount(), BigDecimal::add);
                }
            }
        }

        DashboardDTO dto = new DashboardDTO();
        dto.setTotalIncome(totalIncome);
        dto.setTotalExpense(totalExpense);
        dto.setBalance(totalIncome.subtract(totalExpense));
        dto.setExpenseByCategory(expenseByCategory);

        dto.setMonthlyIncome(monthlyIncome);
        dto.setMonthlyExpense(monthlyExpense);
        dto.setMonthlyBalance(monthlyIncome.subtract(monthlyExpense));
        dto.setMonthlyExpenseByCategory(monthlyExpenseByCategory);

        // Include budgets
        dto.setBudgets(budgetService.getAllBudgets(clerkId, null, null, null));

        // Include monthly savings
        List<com.budgetwise.backend.dto.SavingsDTO> savingsList = savingsService.getAllSavings(clerkId,
                now.getMonthValue(), now.getYear());
        if (!savingsList.isEmpty()) {
            dto.setMonthlySavings(savingsList.get(0));
        }

        return dto;
    }
}
