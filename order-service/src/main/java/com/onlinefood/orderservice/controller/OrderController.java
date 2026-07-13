package com.onlinefood.orderservice.controller;

import com.onlinefood.orderservice.messaging.OrderProducer;
import com.onlinefood.orderservice.model.Order;
import com.onlinefood.orderservice.repository.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderProducer orderProducer;

    public OrderController(OrderRepository orderRepository, OrderProducer orderProducer) {
        this.orderRepository = orderRepository;
        this.orderProducer = orderProducer;
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody CreateOrderRequest request) {
        Order order = new Order(
                request.getCustomerName(),
                request.getItem(),
                request.getAmount(),
                "PLACED"
        );
        Order savedOrder = orderRepository.save(order);
        
        // Publish order created event to ActiveMQ
        orderProducer.sendOrderCreatedEvent(savedOrder);
        
        return ResponseEntity.ok(savedOrder);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody UpdateStatusRequest request) {
        return orderRepository.findById(id)
                .map(order -> {
                    order.setStatus(request.getStatus());
                    Order updated = orderRepository.save(order);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public static class UpdateStatusRequest {
        private String status;

        public UpdateStatusRequest() {
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    // Static DTO for creating order requests
    public static class CreateOrderRequest {
        private String customerName;
        private String item;
        private BigDecimal amount;

        public CreateOrderRequest() {
        }

        public String getCustomerName() {
            return customerName;
        }

        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }

        public String getItem() {
            return item;
        }

        public void setItem(String item) {
            this.item = item;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }
    }
}
