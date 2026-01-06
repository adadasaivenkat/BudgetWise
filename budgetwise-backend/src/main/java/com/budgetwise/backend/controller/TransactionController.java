package com.budgetwise.backend.controller;

import com.budgetwise.backend.dto.TransactionDTO;
import com.budgetwise.backend.service.TransactionService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public TransactionDTO createTransaction(@AuthenticationPrincipal Jwt jwt, @RequestBody TransactionDTO dto) {
        String clerkId = jwt.getSubject();
        return transactionService.createTransaction(clerkId, dto);
    }

    @GetMapping
    public List<TransactionDTO> getAllTransactions(@AuthenticationPrincipal Jwt jwt) {
        String clerkId = jwt.getSubject();
        return transactionService.getAllTransactions(clerkId);
    }

    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
    }
}
