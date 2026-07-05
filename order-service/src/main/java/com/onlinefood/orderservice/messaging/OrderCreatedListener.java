package com.onlinefood.orderservice.messaging;

import com.onlinefood.orderservice.model.Order;
import org.camunda.bpm.engine.RuntimeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class OrderCreatedListener {

    private static final Logger log = LoggerFactory.getLogger(OrderCreatedListener.class);
    private final RuntimeService runtimeService;

    public OrderCreatedListener(RuntimeService runtimeService) {
        this.runtimeService = runtimeService;
    }

    @JmsListener(destination = "order.created")
    public void onOrderCreated(Order order) {
        log.info("[OrderService] Received order.created event for Order #{}", order.getId());

        // Configure variables to pass into the Camunda process
        Map<String, Object> variables = new HashMap<>();
        variables.put("orderId", order.getId());
        variables.put("customerName", order.getCustomerName());
        variables.put("item", order.getItem());
        variables.put("amount", order.getAmount());
        variables.put("initialStatus", order.getStatus());

        // Start the process instance by its process definition key
        runtimeService.startProcessInstanceByKey(
                "OrderProcessingProcess",
                String.valueOf(order.getId()), // Business Key
                variables
        );

        log.info("[OrderService] Started Camunda process instance for Order #{}", order.getId());
    }
}
