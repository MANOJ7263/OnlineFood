CREATE TABLE IF NOT EXISTS kitchen_tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    item VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    estimated_time INT NOT NULL
);
