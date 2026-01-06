package com.budgetwise.backend.service;

import com.budgetwise.backend.dto.BudgetDTO;
import com.budgetwise.backend.entity.Budget;
import com.budgetwise.backend.entity.Transaction;
import com.budgetwise.backend.entity.User;
import com.budgetwise.backend.repository.BudgetRepository;
import com.budgetwise.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final UserService userService;

    public BudgetService(BudgetRepository budgetRepository, TransactionRepository transactionRepository,
            UserService userService) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.userService = userService;
    }

    public BudgetDTO createBudget(String clerkId, BudgetDTO dto) {
        User user = userService.getUserByClerkId(clerkId);

        // Disallow budgets for income
        if ("income".equalsIgnoreCase(dto.getCategory())) {
            throw new RuntimeException("Budgets can only be created for expense categories");
        }

        // Use current month/year if not provided
        LocalDate now = LocalDate.now();
        Integer month = dto.getMonth() != null ? dto.getMonth() : now.getMonthValue();
        Integer year = dto.getYear() != null ? dto.getYear() : now.getYear();

        // Validation
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("Month must be between 1 and 12");
        }
        if (year < 2000 || year > 2100) {
            throw new IllegalArgumentException("Year must be a reasonable value between 2000 and 2100");
        }
        if (dto.getLimitAmount() != null && dto.getLimitAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Limit amount cannot be negative");
        }

        Optional<Budget> existing = budgetRepository.findByUserAndCategoryAndMonthAndYear(user, dto.getCategory(),
                month,
                year);
        Budget budget;
        if (existing.isPresent()) {
            budget = existing.get();
            budget.setLimitAmount(dto.getLimitAmount());
        } else {
            budget = new Budget();
            budget.setUser(user);
            budget.setCategory(dto.getCategory());
            budget.setLimitAmount(dto.getLimitAmount());
            budget.setMonth(month);
            budget.setYear(year);
        }

        Budget saved = budgetRepository.save(budget);
        return mapToDTO(saved, calculateSpentForBudget(saved));
    }

    public List<BudgetDTO> getAllBudgets(String clerkId, String category, Integer month, Integer year) {
        User user = userService.getUserByClerkId(clerkId);
        List<Budget> budgets;

        if (category != null && month != null && year != null) {
            Optional<Budget> specificBudget = budgetRepository.findByUserAndCategoryAndMonthAndYear(user, category,
                    month, year);
            budgets = specificBudget.map(List::of).orElse(List.of());
        } else {
            budgets = budgetRepository.findByUser(user);
        }

        return budgets.stream()
                .map(budget -> mapToDTO(budget, calculateSpentForBudget(budget)))
                .collect(Collectors.toList());
    }

    private BigDecimal calculateSpentForBudget(Budget budget) {
        try {
            if (budget.getMonth() == null || budget.getMonth() < 1 || budget.getMonth() > 12
                    || budget.getYear() == null) {
                return BigDecimal.ZERO;
            }

            LocalDate startDate = LocalDate.of(budget.getYear(), budget.getMonth(), 1);
            LocalDate endDate = startDate.with(TemporalAdjusters.lastDayOfMonth());

            List<Transaction> transactions = transactionRepository.findByUserAndDateBetween(
                    budget.getUser(), startDate, endDate);

            return transactions.stream()
                    .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                    .filter(t -> t.getCategory().equalsIgnoreCase(budget.getCategory()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } catch (Exception e) {
            System.err.println("Error calculating spent for budget: " + e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    public void deleteBudget(String clerkId, Long budgetId) {
        User user = userService.getUserByClerkId(clerkId);
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this budget");
        }

        budgetRepository.delete(budget);
    }

    private BudgetDTO mapToDTO(Budget budget, BigDecimal spentAmount) {
        BudgetDTO dto = new BudgetDTO();
        dto.setId(budget.getId());
        dto.setUserId(budget.getUser().getId());
        dto.setCategory(budget.getCategory());
        dto.setLimitAmount(budget.getLimitAmount());
        dto.setSpentAmount(spentAmount);
        dto.setMonth(budget.getMonth());
        dto.setYear(budget.getYear());
        return dto;
    }
}
