package com.budgetwise.backend.service;

import com.budgetwise.backend.dto.TransactionDTO;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.List;

@Service
public class ExportService {

    private final TransactionService transactionService;

    public ExportService(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    public ByteArrayInputStream exportTransactionsToCSV(String clerkId) {
        List<TransactionDTO> transactions = transactionService.getAllTransactions(clerkId);
        String[] columns = { "Date", "Type", "Category", "Amount (INR)", "Original Amount", "Original Currency",
                "Description" };

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
                PrintWriter csvWriter = new PrintWriter(out)) {

            // Header
            csvWriter.println(String.join(",", columns));

            // Data
            for (TransactionDTO t : transactions) {
                csvWriter.println(
                        String.join(",",
                                t.getDate().toString(),
                                t.getType().toString(),
                                escape(t.getCategory()),
                                t.getAmount().toString(),
                                t.getOriginalAmount() != null ? t.getOriginalAmount().toString() : "",
                                escape(t.getOriginalCurrency()),
                                escape(t.getDescription())));
            }

            csvWriter.flush();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to export data to CSV: " + e.getMessage());
        }
    }

    private String escape(String data) {
        if (data == null)
            return "";
        String escapedData = data.replaceAll("\\R", " ");
        if (data.contains(",") || data.contains("\"") || data.contains("'")) {
            data = data.replace("\"", "\"\"");
            escapedData = "\"" + data + "\"";
        }
        return escapedData;
    }
}
