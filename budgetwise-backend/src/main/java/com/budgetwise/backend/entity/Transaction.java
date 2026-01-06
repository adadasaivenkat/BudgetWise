package com.budgetwise.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type; // INCOME, EXPENSE

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private BigDecimal amount; // Stored in INR

    @Column(nullable = false)
    private BigDecimal originalAmount;

    @Column(nullable = false)
    private String originalCurrency;

    private BigDecimal conversionRate;

    @Column(nullable = false)
    private LocalDate date;

    private String description;

    public enum TransactionType {
        INCOME, EXPENSE
    }
}
