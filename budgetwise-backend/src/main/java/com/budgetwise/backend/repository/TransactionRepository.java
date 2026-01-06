package com.budgetwise.backend.repository;

import com.budgetwise.backend.entity.Transaction;
import com.budgetwise.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);

    List<Transaction> findByUserId(Long userId); // helper if needed

    // Custom filtering
    List<Transaction> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate);

    List<Transaction> findByUserAndCategory(User user, String category);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user ORDER BY t.date DESC")
    List<Transaction> findAllByUserOrderByDateDesc(User user);
}
