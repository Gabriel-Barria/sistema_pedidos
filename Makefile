# ============================================
# Makefile - Sistema Integral de Pedidos
# ============================================

.PHONY: help up down restart logs ps clean health-check \
        db-shell db-migrate db-rollback db-seed db-reset \
        redis-cli test test-unit test-e2e lint format \
        install build dev prod

# Variables
COMPOSE = docker-compose
COMPOSE_FILE = docker-compose.yml

# Colores para output
GREEN = \033[0;32m
YELLOW = \033[0;33m
RED = \033[0;31m
NC = \033[0m # No Color

# ============================================
# HELP
# ============================================

help: ## Muestra esta ayuda
	@echo "$(GREEN)Sistema Integral de Pedidos - Comandos Disponibles$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

# ============================================
# DOCKER COMPOSE
# ============================================

up: ## Inicia todos los servicios
	@echo "$(GREEN)Iniciando servicios...$(NC)"
	$(COMPOSE) up -d
	@echo "$(GREEN)Servicios iniciados correctamente$(NC)"
	@make health-check

down: ## Detiene todos los servicios
	@echo "$(YELLOW)Deteniendo servicios...$(NC)"
	$(COMPOSE) down
	@echo "$(GREEN)Servicios detenidos$(NC)"

restart: ## Reinicia todos los servicios
	@make down
	@make up

logs: ## Muestra logs de todos los servicios
	$(COMPOSE) logs -f

logs-api: ## Muestra logs del API (cuando exista)
	@echo "$(YELLOW)API backend aún no implementado$(NC)"

logs-db: ## Muestra logs de PostgreSQL
	$(COMPOSE) logs -f postgres

logs-redis: ## Muestra logs de Redis
	$(COMPOSE) logs -f redis

ps: ## Lista los servicios corriendo
	$(COMPOSE) ps

clean: ## Limpia contenedores, volúmenes e imágenes
	@echo "$(RED)⚠️  CUIDADO: Esto eliminará todos los datos$(NC)"
	@read -p "¿Estás seguro? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(COMPOSE) down -v --remove-orphans; \
		echo "$(GREEN)Limpieza completada$(NC)"; \
	fi

# ============================================
# HEALTH CHECKS
# ============================================

health-check: ## Verifica el estado de los servicios
	@echo "$(GREEN)Verificando servicios...$(NC)"
	@sleep 3
	@$(COMPOSE) ps
	@echo ""
	@echo "$(GREEN)URLs de servicios:$(NC)"
	@echo "  - PostgreSQL:        localhost:5432"
	@echo "  - Redis:             localhost:6379"
	@echo "  - PgAdmin:           http://localhost:5050"
	@echo "  - Redis Commander:   http://localhost:8081"

# ============================================
# DATABASE (PostgreSQL)
# ============================================

db-shell: ## Abre shell de PostgreSQL
	@echo "$(GREEN)Conectando a PostgreSQL...$(NC)"
	$(COMPOSE) exec postgres psql -U pedidos -d pedidos

db-migrate: ## Ejecuta migraciones (requiere backend)
	@echo "$(YELLOW)Migraciones pendientes de implementación en E02$(NC)"

db-rollback: ## Rollback de última migración
	@echo "$(YELLOW)Rollback pendiente de implementación en E02$(NC)"

db-seed: ## Seed de datos de prueba
	@echo "$(YELLOW)Seed pendiente de implementación en E02$(NC)"

db-reset: ## Resetea la base de datos
	@echo "$(RED)⚠️  Esto eliminará todos los datos$(NC)"
	@read -p "¿Continuar? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(COMPOSE) exec postgres psql -U pedidos -c "DROP DATABASE IF EXISTS pedidos;"; \
		$(COMPOSE) exec postgres psql -U pedidos -c "CREATE DATABASE pedidos;"; \
		echo "$(GREEN)Base de datos reseteada$(NC)"; \
	fi

# ============================================
# REDIS
# ============================================

redis-cli: ## Abre CLI de Redis
	@echo "$(GREEN)Conectando a Redis...$(NC)"
	$(COMPOSE) exec redis redis-cli -a dev_redis_password

redis-flush: ## Limpia toda la cache de Redis
	@echo "$(RED)⚠️  Esto eliminará toda la cache$(NC)"
	@read -p "¿Continuar? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(COMPOSE) exec redis redis-cli -a dev_redis_password FLUSHALL; \
		echo "$(GREEN)Cache limpiada$(NC)"; \
	fi

# ============================================
# TESTING (se implementarán en E02)
# ============================================

test: ## Ejecuta todos los tests
	@echo "$(YELLOW)Tests pendientes de implementación en E02$(NC)"

test-unit: ## Ejecuta tests unitarios
	@echo "$(YELLOW)Tests unitarios pendientes de implementación en E02$(NC)"

test-e2e: ## Ejecuta tests E2E
	@echo "$(YELLOW)Tests E2E pendientes de implementación en E22$(NC)"

test-infra: ## Test de infraestructura (Docker)
	@echo "$(GREEN)Testing infraestructura...$(NC)"
	@$(COMPOSE) ps | grep -q "Up" && echo "$(GREEN)✓ Servicios corriendo$(NC)" || echo "$(RED)✗ Servicios no corriendo$(NC)"

# ============================================
# LINTING Y FORMATTING (se implementarán en E02)
# ============================================

lint: ## Ejecuta linting
	@echo "$(YELLOW)Linting pendiente de implementación en E02$(NC)"

format: ## Formatea código
	@echo "$(YELLOW)Formatting pendiente de implementación en E02$(NC)"

# ============================================
# DESARROLLO (se implementarán en E02)
# ============================================

install: ## Instala dependencias
	@echo "$(YELLOW)Instalación pendiente de implementación en E02$(NC)"

build: ## Build del proyecto
	@echo "$(YELLOW)Build pendiente de implementación en E02$(NC)"

dev: ## Inicia en modo desarrollo
	@echo "$(YELLOW)Modo desarrollo pendiente de implementación en E02$(NC)"

prod: ## Inicia en modo producción
	@echo "$(YELLOW)Modo producción pendiente de implementación en E26$(NC)"

# ============================================
# UTILIDADES
# ============================================

.DEFAULT_GOAL := help
