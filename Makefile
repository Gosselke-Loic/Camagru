# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: lgosselk <lgosselk@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/02/11 15:30:05 by lgosselk          #+#    #+#              #
#    Updated: 2025/02/11 15:38:12 by lgosselk         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

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

fclean:
	@docker system prune

down:
	@docker compose -f down

up:
	@docker compose -f up

.PHONY:			all clean fclean no up down