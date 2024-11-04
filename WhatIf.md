# Support High-Load
To support 1,000 registrations and 100,000 logins per second, the system needs to handle high loads with minimal latency.

## Token and Session Caching
Redis or Memcached are suitable for storing JWT tokens and session information, reducing the load on the main database. Redis can be deployed in a cluster, providing scalable in-memory storage and load balancing—ideal for quick access when verifying tokens.

## Task Queues for Registration
To avoid system overload during peak times, registration requests can be sent to asynchronous queues (such as RabbitMQ or Kafka) for gradual processing. This will reduce peak load and allow requests to be handled in parallel.
