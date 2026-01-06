package com.budgetwise.backend.repository;

import com.budgetwise.backend.entity.Savings;
import com.budgetwise.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavingsRepository extends JpaRepository<Savings, Long> {
    List<Savings> findByUser(User user);

    Optional<Savings> findByUserAndMonthAndYear(User user, Integer month, Integer year);
}
