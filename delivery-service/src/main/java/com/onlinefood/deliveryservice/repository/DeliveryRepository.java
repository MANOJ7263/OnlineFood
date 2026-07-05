package com.onlinefood.deliveryservice.repository;

import com.onlinefood.deliveryservice.model.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
}
