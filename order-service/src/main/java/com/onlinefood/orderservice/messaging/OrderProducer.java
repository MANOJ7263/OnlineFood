package com.onlinefood.orderservice.messaging;

import com.onlinefood.orderservice.config.JmsConfig;
import com.onlinefood.orderservice.model.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderProducer {

    private static final Logger log = LoggerFactory.getLogger(OrderProducer.class);
    private final JmsTemplate jmsTemplate;

    public OrderProducer(JmsTemplate jmsTemplate) {
        this.jmsTemplate = jmsTemplate;
    }

    public void sendOrderCreatedEvent(Order order) {
        jmsTemplate.convertAndSend(JmsConfig.ORDER_CREATED_QUEUE, order);
        log.info("[OrderService] Order #{} - Status: PLACED, Message published to ActiveMQ.", order.getId());
    }
}
