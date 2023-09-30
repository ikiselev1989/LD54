stage-up:
	docker compose -f docker-compose.stage.yml up -d --force-recreate --build &
	docker system prune -af
