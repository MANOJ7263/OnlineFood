package com.onlinefood.orderservice.workflow;

import com.onlinefood.orderservice.repository.OrderRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component("processPaymentDelegate")
public class ProcessPaymentDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(ProcessPaymentDelegate.class);
    private final OrderRepository orderRepository;

    public ProcessPaymentDelegate(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long orderId = (Long) execution.getVariable("orderId");
        log.info("[Workflow] ProcessPaymentDelegate invoked for Order #{}", orderId);
        
        // Defaulting paymentSuccess to true. In a real integration, this would check transaction details.
        boolean paymentSuccess = true;
        execution.setVariable("paymentSuccess", paymentSuccess);
        
        if (paymentSuccess) {
            orderRepository.findById(orderId).ifPresent(order -> {
                order.setStatus("PAID");
                orderRepository.save(order);
                log.info("[Workflow] Order #{} status updated to PAID in DB.", orderId);
            });
        }
    }
}
