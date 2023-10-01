stage-up:
	docker compose -f docker-compose.stage.yml up -d --force-recreate --build &
	docker system prune -af

graphics:
	free-tex-packer-cli --project ./assets/graphics/assets.ftpp
	free-tex-packer-cli --project ./assets/animations/player-anims.ftpp
	sharp -i ./public/*.png -o ./public -f webp --nearLossless true
