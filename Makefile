.PHONY: start stop restart

# Start all services
start:
	docker compose up -d

# Stop all services
stop:
	docker compose down

# Restart all services (calls stop then start)
restart: stop start
