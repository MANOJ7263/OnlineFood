package com.onlinefood.paymentservice.worker;

import com.onlinefood.paymentservice.model.Payment;
import com.onlinefood.paymentservice.repository.PaymentRepository;
import org.camunda.bpm.client.spring.annotation.ExternalTaskSubscription;
import org.camunda.bpm.client.task.ExternalTask;
import org.camunda.bpm.client.task.ExternalTaskHandler;
import org.camunda.bpm.client.task.ExternalTaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.UUID;

@Component
@ExternalTaskSubscription("payment-processing")
public class PaymentWorker implements ExternalTaskHandler {

    private static final Logger log = LoggerFactory.getLogger(PaymentWorker.class);
    private final PaymentRepository paymentRepository;

    public PaymentWorker(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Override
    public void execute(ExternalTask externalTask, ExternalTaskService externalTaskService) {
        // Extract variables safely using Number interface to prevent cast issues
        Number orderIdNum = externalTask.getVariable("orderId");
        Long orderId = orderIdNum != null ? orderIdNum.longValue() : null;

        Number amountNum = externalTask.getVariable("amount");
        BigDecimal amount = BigDecimal.valueOf(amountNum != null ? amountNum.doubleValue() : 0.0);

        log.info("[PaymentService] Order #{} - Payment processing...", orderId);

        // Mock logic: 90% success rate. Fail if amount > $500.
        boolean success = (Math.random() < 0.90) && (amount.compareTo(BigDecimal.valueOf(500.0)) <= 0);
        String status = success ? "SUCCESS" : "FAILED";
        String transactionId = UUID.randomUUID().toString();

        // Save state to DB
        Payment payment = new Payment(orderId, amount, status, transactionId);
        paymentRepository.save(payment);

        log.info("[PaymentService] Order #{} - Payment processing... {}", orderId, status);

        // Complete the task and return paymentSuccess variable to Camunda
        externalTaskService.complete(externalTask, Collections.singletonMap("paymentSuccess", success));
    }
}
