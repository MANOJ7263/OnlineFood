package com.onlinefood.orderservice.workflow;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component("deliveryDelegate")
public class DeliveryDelegate implements JavaDelegate {

    private static final Logger log = LoggerFactory.getLogger(DeliveryDelegate.class);

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Long orderId = (Long) execution.getVariable("orderId");
        log.info("[Workflow] DeliveryDelegate: Dispatching Order #{} for Delivery.", orderId);
    }
}
