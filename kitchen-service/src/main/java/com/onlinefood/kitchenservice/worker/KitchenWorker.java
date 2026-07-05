package com.onlinefood.kitchenservice.worker;

import com.onlinefood.kitchenservice.model.KitchenTicket;
import com.onlinefood.kitchenservice.repository.KitchenTicketRepository;
import org.camunda.bpm.client.spring.annotation.ExternalTaskSubscription;
import org.camunda.bpm.client.task.ExternalTask;
import org.camunda.bpm.client.task.ExternalTaskHandler;
import org.camunda.bpm.client.task.ExternalTaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
@ExternalTaskSubscription("kitchen-preparation")
public class KitchenWorker implements ExternalTaskHandler {

    private static final Logger log = LoggerFactory.getLogger(KitchenWorker.class);
    private final KitchenTicketRepository kitchenTicketRepository;

    public KitchenWorker(KitchenTicketRepository kitchenTicketRepository) {
        this.kitchenTicketRepository = kitchenTicketRepository;
    }

    @Override
    public void execute(ExternalTask externalTask, ExternalTaskService externalTaskService) {
        Number orderIdNum = externalTask.getVariable("orderId");
        Long orderId = orderIdNum != null ? orderIdNum.longValue() : null;
        String item = externalTask.getVariable("item");

        log.info("[KitchenService] Order #{} - Kitchen ticket created, preparing food...", orderId);

        // Simulate preparation time
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Save kitchen ticket to DB with status READY
        KitchenTicket ticket = new KitchenTicket(orderId, item, "READY", 15); // Estimated prep: 15 minutes
        kitchenTicketRepository.save(ticket);

        log.info("[KitchenService] Order #{} - Kitchen ticket created, preparing food... READY", orderId);

        // Complete the task in Camunda
        externalTaskService.complete(externalTask);
    }
}
