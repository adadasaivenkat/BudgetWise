package com.budgetwise.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SavingsDTO {
    private Long id;
    private Long userId;
    private BigDecimal targetAmount;
    private BigDecimal progressAmount;
    private Integer month;
    private Integer year;
}
