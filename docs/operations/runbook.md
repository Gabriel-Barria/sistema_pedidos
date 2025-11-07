# Runbook Operacional

**Versión**: 1.0
**Última actualización**: 2025-11-07 19:25
**Estado**: En Progreso

---

## Índice

1. [Comandos Comunes](#comandos-comunes)
2. [Troubleshooting](#troubleshooting)
3. [Incidentes Comunes](#incidentes-comunes)
4. [Procedimientos de Emergencia](#procedimientos-de-emergencia)
5. [Backups y Recuperación](#backups-y-recuperación)
6. [Contactos](#contactos)

---

## Comandos Comunes

### Inicio del Sistema

```bash
# Iniciar todos los servicios
make up

# Iniciar en background
make up-detached

# Ver logs en tiempo real
make logs

# Ver logs de un servicio específico
docker-compose logs -f api
docker-compose logs -f postgres
```

### Verificación de Salud

```bash
# Health check de todos los servicios
make health-check

# Health check individual
curl http://localhost:3000/health
curl http://localhost:3000/health/db
curl http://localhost:3000/health/redis

# Ver métricas
curl http://localhost:3000/metrics
```

### Gestión de Base de Datos

```bash
# Ejecutar migraciones
make migrate

# Rollback última migración
npx prisma migrate resolve --rolled-back <migration_name>

# Backup manual
make db-backup

# Restaurar desde backup
make db-restore BACKUP_FILE=backup_2025_11_07.sql
```

### Gestión de Caché

```bash
# Acceso a Redis CLI
make redis-cli

# Limpiar caché completo
docker-compose exec redis redis-cli FLUSHALL

# Limpiar caché de un tenant
docker-compose exec redis redis-cli --scan --pattern "tenant:abc123:*" | xargs redis-cli DEL
```

---

## Troubleshooting

### API no responde

```bash
# 1. Verificar que el contenedor esté corriendo
docker-compose ps

# 2. Ver logs del contenedor
docker-compose logs api --tail=100

# 3. Verificar health endpoint
curl -v http://localhost:3000/health

# 4. Reiniciar servicio
docker-compose restart api
```

### Errores de Conexión a DB

```bash
# 1. Verificar que Postgres esté corriendo
docker-compose ps postgres

# 2. Ver logs de Postgres
docker-compose logs postgres --tail=50

# 3. Verificar conexiones activas
docker-compose exec postgres psql -U pedidos -c "
  SELECT pid, usename, state
  FROM pg_stat_activity
  WHERE datname = 'pedidos';"
```

### Redis Desconectado

```bash
# 1. Verificar estado
docker-compose ps redis

# 2. Verificar conectividad
docker-compose exec redis redis-cli PING
# Debe responder: PONG

# 3. Reiniciar
docker-compose restart redis
```

---

## Incidentes Comunes

### Incidente: Pagos no procesándose

**Síntomas:**
- Webhooks llegando pero órdenes no se actualizan
- Cola `payments` con muchos jobs fallidos

**Resolución:**
```bash
# 1. Ver logs de webhooks
docker-compose logs api | grep "webhook" | tail -50

# 2. Ver jobs fallidos
curl http://localhost:3000/admin/queues/payments

# 3. Reintentar jobs via Bull Board UI
```

### Incidente: Sistema Lento

**Síntomas:**
- Alta latencia en requests
- Usuarios reportan lentitud

**Resolución:**
```bash
# 1. Ver métricas de latencia
curl http://localhost:3000/metrics | grep http_request_duration

# 2. Verificar slow queries
docker-compose exec postgres psql -U pedidos -c "
  SELECT query, mean_exec_time
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC
  LIMIT 10;"

# 3. Ver hit rate de caché
curl http://localhost:3000/metrics | grep cache_hit_rate
```

---

## Procedimientos de Emergencia

### Rollback de Deploy

```bash
# 1. Identificar versión anterior
git log --oneline -10

# 2. Revertir código
git revert <commit_hash>

# 3. Rebuild y redeploy
make build
make deploy

# 4. Verificar health
make health-check
```

### Desactivar Tenant Problemático

```bash
# 1. Desactivar en DB
docker-compose exec postgres psql -U pedidos -c "
  UPDATE tenants SET active = false WHERE id = 'abc123';"

# 2. Limpiar caché del tenant
docker-compose exec redis redis-cli --scan --pattern "tenant:abc123:*" | xargs redis-cli DEL
```

---

## Backups y Recuperación

### Backup Automático

```bash
# Cronjob configurado (ejecuta diario a las 2 AM)
0 2 * * * /path/to/scripts/backup-db.sh
```

### Restaurar desde Backup

```bash
# 1. Detener aplicación
docker-compose stop api

# 2. Restaurar backup
gunzip -c /backups/pedidos_20251107.sql.gz | \
  docker-compose exec -T postgres psql -U pedidos pedidos

# 3. Reiniciar aplicación
docker-compose start api
```

---

## Contactos

### Equipo de Desarrollo

| Rol | Nombre | Contacto | Horario |
|-----|--------|----------|---------|
| Tech Lead | [Nombre] | email@example.com | 9-18 |
| Backend Dev | [Nombre] | email@example.com | 9-18 |
| DevOps | [Nombre] | email@example.com | On-call |

### Escalamiento de Incidentes

```
Severidad 1 (Crítico):
  1. Contactar DevOps on-call
  2. Notificar Tech Lead
  3. Si no responde en 15min, contactar CTO

Severidad 2 (Alto):
  1. Crear ticket
  2. Notificar Tech Lead
  3. Iniciar investigación
```

---

## Changelog

### v1.0 - 2025-11-07 19:25
- Runbook operacional inicial
- Comandos comunes, troubleshooting, procedimientos de emergencia
