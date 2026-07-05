package com.onlinefood.orderservice.workflow;

import com.onlinefood.orderservice.repository.OrderRepository;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component("cancelOrderDelegate")
public class CancelOrderDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(CancelOrderDelegate.class);
    private final OrderRepository orderRepository;

    public CancelOrderDelegate(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long orderId = (Long) execution.getVariable("orderId");
        log.warn("[Workflow] CancelOrderDelegate: Cancelling Order #{}", orderId);

        orderRepository.findById(orderId).ifPresent(order -> {
            order.setStatus("CANCELLED");
            orderRepository.save(order);
            log.info("[Workflow] Order #{} status updated to CANCELLED in DB.", orderId);
        });
    }
}
