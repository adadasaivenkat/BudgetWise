package com.budgetwise.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class CurrencyService {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String API_URL = "https://open.er-api.com/v6/latest/";

    @SuppressWarnings("unchecked")
    public BigDecimal getExchangeRate(String fromCurrency, String toCurrency) {

        if (fromCurrency == null || toCurrency == null || fromCurrency.equalsIgnoreCase(toCurrency)) {
            return BigDecimal.ONE;
        }

        try {
            String url = API_URL + fromCurrency.toUpperCase();
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                return BigDecimal.ONE;
            }

            Object result = response.get("result");
            if (!"success".equalsIgnoreCase(String.valueOf(result))) {
                return BigDecimal.ONE;
            }

            Map<String, Object> rates = (Map<String, Object>) response.get("rates");

            if (rates == null || !rates.containsKey(toCurrency.toUpperCase())) {
                return BigDecimal.ONE;
            }

            Object rateObj = rates.get(toCurrency.toUpperCase());
            double rateVal;

            if (rateObj instanceof Number) {
                rateVal = ((Number) rateObj).doubleValue();
            } else {
                return BigDecimal.ONE;
            }

            return BigDecimal.valueOf(rateVal);

        } catch (Exception e) {
            System.err.println("Currency conversion failed: " + e.getMessage());
            return BigDecimal.ONE; // Safe fallback
        }
    }
}
