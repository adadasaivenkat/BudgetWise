package com.budgetwise.backend.service;

import com.budgetwise.backend.dto.TransactionDTO;
import com.budgetwise.backend.entity.Transaction;
import com.budgetwise.backend.entity.User;
import com.budgetwise.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserService userService;
    private final CurrencyService currencyService;

    public TransactionService(TransactionRepository transactionRepository, UserService userService,
            CurrencyService currencyService) {
        this.transactionRepository = transactionRepository;
        this.userService = userService;
        this.currencyService = currencyService;
    }

    public TransactionDTO createTransaction(String clerkId, TransactionDTO dto) {
        User user = userService.getUserByClerkId(clerkId);

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setType(dto.getType());
        transaction.setCategory(dto.getCategory());

        // Set defaults if original values are missing
        if (dto.getOriginalAmount() == null) {
            transaction.setOriginalAmount(dto.getAmount());
        } else {
            transaction.setOriginalAmount(dto.getOriginalAmount());
        }

        if (dto.getOriginalCurrency() == null) {
            transaction.setOriginalCurrency("INR");
        } else {
            transaction.setOriginalCurrency(dto.getOriginalCurrency());
        }

        // Handle currency conversion
        BigDecimal amountToConvert = transaction.getOriginalAmount();
        String currencyToConvert = transaction.getOriginalCurrency();

        // Fetch rate
        BigDecimal rate = currencyService.getExchangeRate(currencyToConvert, "INR");
        if (rate == null) {
            // Fallback
            rate = getFallbackExchangeRate(currencyToConvert);
        }
        transaction.setConversionRate(rate);
        transaction.setAmount(amountToConvert.multiply(rate));

        transaction.setDate(dto.getDate());
        transaction.setDescription(dto.getDescription());

        Transaction saved = transactionRepository.save(transaction);
        return mapToDTO(saved);
    }

    private BigDecimal getFallbackExchangeRate(String currency) {
        if (currency == null || currency.equalsIgnoreCase("INR"))
            return BigDecimal.ONE;
        switch (currency.toUpperCase()) {
            case "USD":
                return new BigDecimal("85.0");
            case "EUR":
                return new BigDecimal("92.0");
            case "GBP":
                return new BigDecimal("108.0");
            default:
                return BigDecimal.ONE;
        }
    }

    public List<TransactionDTO> getAllTransactions(String clerkId) {
        User user = userService.getUserByClerkId(clerkId);
        return transactionRepository.findAllByUserOrderByDateDesc(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }

    private TransactionDTO mapToDTO(Transaction transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setUserId(transaction.getUser().getId());
        dto.setType(transaction.getType());
        dto.setCategory(transaction.getCategory());
        dto.setAmount(transaction.getAmount());
        dto.setOriginalAmount(transaction.getOriginalAmount());
        dto.setOriginalCurrency(transaction.getOriginalCurrency());
        dto.setConversionRate(transaction.getConversionRate());
        dto.setDate(transaction.getDate());
        dto.setDescription(transaction.getDescription());
        return dto;
    }
}
