package com.budgetwise.backend.service;

import com.budgetwise.backend.dto.SavingsDTO;
import com.budgetwise.backend.entity.Savings;
import com.budgetwise.backend.entity.Transaction;
import com.budgetwise.backend.entity.User;
import com.budgetwise.backend.repository.SavingsRepository;
import com.budgetwise.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SavingsService {

    private final SavingsRepository savingsRepository;
    private final TransactionRepository transactionRepository;
    private final UserService userService;

    public SavingsService(SavingsRepository savingsRepository, TransactionRepository transactionRepository,
            UserService userService) {
        this.savingsRepository = savingsRepository;
        this.transactionRepository = transactionRepository;
        this.userService = userService;
    }

    public SavingsDTO createOrUpdateSavings(String clerkId, SavingsDTO dto) {
        User user = userService.getUserByClerkId(clerkId);

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
        if (dto.getTargetAmount() != null && dto.getTargetAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Target amount cannot be negative");
        }

        Optional<Savings> existing = savingsRepository.findByUserAndMonthAndYear(user, month, year);
        Savings savings;
        if (existing.isPresent()) {
            savings = existing.get();
            savings.setTargetAmount(dto.getTargetAmount());
        } else {
            savings = new Savings();
            savings.setUser(user);
            savings.setTargetAmount(dto.getTargetAmount());
            savings.setMonth(month);
            savings.setYear(year);
        }

        Savings saved = savingsRepository.save(savings);
        return mapToDTO(saved, calculateProgressForSavings(saved));
    }

    public List<SavingsDTO> getAllSavings(String clerkId, Integer month, Integer year) {
        User user = userService.getUserByClerkId(clerkId);
        List<Savings> savingsList;

        if (month != null && year != null) {
            Optional<Savings> specificSavings = savingsRepository.findByUserAndMonthAndYear(user, month, year);
            savingsList = specificSavings.map(List::of).orElse(List.of());
        } else {
            savingsList = savingsRepository.findByUser(user);
        }

        return savingsList.stream()
                .map(s -> mapToDTO(s, calculateProgressForSavings(s)))
                .collect(Collectors.toList());
    }

    private BigDecimal calculateProgressForSavings(Savings savings) {
        try {
            LocalDate startDate = LocalDate.of(savings.getYear(), savings.getMonth(), 1);
            LocalDate endDate = startDate.with(TemporalAdjusters.lastDayOfMonth());

            List<Transaction> transactions = transactionRepository.findByUserAndDateBetween(
                    savings.getUser(), startDate, endDate);

            BigDecimal totalIncome = transactions.stream()
                    .filter(t -> t.getType() == Transaction.TransactionType.INCOME)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalExpense = transactions.stream()
                    .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            return totalIncome.subtract(totalExpense);
        } catch (Exception e) {
            System.err.println("Error calculating progress for savings: " + e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    public void deleteSavings(String clerkId, Long savingsId) {
        User user = userService.getUserByClerkId(clerkId);
        Savings savings = savingsRepository.findById(savingsId)
                .orElseThrow(() -> new RuntimeException("Savings record not found"));

        if (!savings.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this savings record");
        }

        savingsRepository.delete(savings);
    }

    private SavingsDTO mapToDTO(Savings savings, BigDecimal progressAmount) {
        SavingsDTO dto = new SavingsDTO();
        dto.setId(savings.getId());
        dto.setUserId(savings.getUser().getId());
        dto.setTargetAmount(savings.getTargetAmount());
        dto.setProgressAmount(progressAmount);
        dto.setMonth(savings.getMonth());
        dto.setYear(savings.getYear());
        return dto;
    }
}
