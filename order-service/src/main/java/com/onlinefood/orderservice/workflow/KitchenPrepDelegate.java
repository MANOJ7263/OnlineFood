package com.onlinefood.orderservice.workflow;

import com.onlinefood.orderservice.repository.OrderRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component("kitchenPrepDelegate")
public class KitchenPrepDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(KitchenPrepDelegate.class);
    private final OrderRepository orderRepository;

    public KitchenPrepDelegate(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long orderId = (Long) execution.getVariable("orderId");
        log.info("[Workflow] KitchenPrepDelegate: Dispatching Order #{} to Kitchen.", orderId);
        
        orderRepository.findById(orderId).ifPresent(order -> {
            order.setStatus("READY");
            orderRepository.save(order);
            log.info("[Workflow] Order #{} status updated to READY in DB.", orderId);
        });
    }
}
