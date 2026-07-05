package com.onlinefood.deliveryservice.worker;

import com.onlinefood.deliveryservice.model.Delivery;
import com.onlinefood.deliveryservice.repository.DeliveryRepository;
import org.camunda.bpm.client.spring.annotation.ExternalTaskSubscription;
import org.camunda.bpm.client.task.ExternalTask;
import org.camunda.bpm.client.task.ExternalTaskHandler;
import org.camunda.bpm.client.task.ExternalTaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;

@Component
@ExternalTaskSubscription("delivery-dispatch")
public class DeliveryWorker implements ExternalTaskHandler {

    private static final Logger log = LoggerFactory.getLogger(DeliveryWorker.class);
    private final DeliveryRepository deliveryRepository;

    private static final List<String> DRIVERS = List.of(
            "David Miller", "Sophia Martinez", "James Wilson", "Emma Anderson", "Liam Thomas"
    );
    private final Random random = new Random();

    public DeliveryWorker(DeliveryRepository deliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }

    @Override
    public void execute(ExternalTask externalTask, ExternalTaskService externalTaskService) {
        Number orderIdNum = externalTask.getVariable("orderId");
        Long orderId = orderIdNum != null ? orderIdNum.longValue() : null;

        log.info("[DeliveryService] Order #{} - Driver assigned, delivering...", orderId);

        // Assign a random driver name
        String driverName = DRIVERS.get(random.nextInt(DRIVERS.size()));

        // Save delivery state in DB with status DELIVERED
        Delivery delivery = new Delivery(orderId, driverName, "DELIVERED");
        deliveryRepository.save(delivery);

        log.info("[DeliveryService] Order #{} - Driver assigned, delivering... DELIVERED", orderId);

        // Complete the task in Camunda
        externalTaskService.complete(externalTask);
    }
}
