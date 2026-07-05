package com.onlinefood.orderservice.workflow;

import com.onlinefood.orderservice.repository.OrderRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component("completeOrderDelegate")
public class CompleteOrderDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(CompleteOrderDelegate.class);
    private final OrderRepository orderRepository;

    public CompleteOrderDelegate(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long orderId = (Long) execution.getVariable("orderId");
        log.info("[Workflow] CompleteOrderDelegate: Finalizing Order #{}", orderId);

        orderRepository.findById(orderId).ifPresent(order -> {
            order.setStatus("DELIVERED");
            orderRepository.save(order);
            log.info("[Workflow] Order #{} status updated to DELIVERED in DB.", orderId);
        });
    }
}
