# Variables
NAME		=	camagru

# Colors
RED 		=	\033[1;91m
YELLOW		=	\033[1;93m
GREEN		=	\033[1;92m
DEF_COLOR	=	\033[0;39m

# Commands
all:	$(NAME)

$(NAME):
	@echo "$(GREEN) Starting production in detach $(DEF_COLOR)"
	@docker compose up -d --build
	@echo "$(GREEN) Ready! $(DEF_COLOR)"

no:
	@echo "$(GREEN) Starting production without detach $(DEF_COLOR)"
	@docker compose up --build

clean:
	@docker compose down -v
	@echo "$(RED) Removed! $(DEF_COLOR)"

remove:
	@docker rm $(shell docker ps --filter status=exited -q)

fclean:
	@docker system prune

down:
	@docker compose down

up:
	@docker compose up

remove_orphans:
	@docker-compose down --remove-orphans

remove_all:
	@docker system prune -a --volumes

.PHONY:			all clean fclean no up down remove_orphans remove_all remove
