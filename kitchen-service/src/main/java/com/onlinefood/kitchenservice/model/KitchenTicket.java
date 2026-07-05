package com.onlinefood.kitchenservice.model;

import jakarta.persistence.*;

@Entity
@Table(name = "kitchen_tickets")
public class KitchenTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "item", nullable = false)
    private String item;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "estimated_time", nullable = false)
    private Integer estimatedTime;

    public KitchenTicket() {
    }

    public KitchenTicket(Long orderId, String item, String status, Integer estimatedTime) {
        this.orderId = orderId;
        this.item = item;
        this.status = status;
        this.estimatedTime = estimatedTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getItem() {
        return item;
    }

    public void setItem(String item) {
        this.item = item;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getEstimatedTime() {
        return estimatedTime;
    }

    public void setEstimatedTime(Integer estimatedTime) {
        this.estimatedTime = estimatedTime;
    }
}
