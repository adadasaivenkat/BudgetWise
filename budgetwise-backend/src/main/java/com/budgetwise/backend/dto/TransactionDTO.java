package com.budgetwise.backend.dto;

import com.budgetwise.backend.entity.Transaction.TransactionType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionDTO {
    private Long id;
    private Long userId; // only need ID for reference in DTO
    private TransactionType type;
    private String category;
    private BigDecimal amount; // INR
    private BigDecimal originalAmount;
    private String originalCurrency;
    private BigDecimal conversionRate;
    private LocalDate date;
    private String description;
}
