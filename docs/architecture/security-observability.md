# Seguridad y Observabilidad

## Seguridad
- JWT RS256, refresh rotativos.
- RBAC por scopes; auditoría de cambios.
- HMAC en webhooks + protección replay (nonce + timestamp).
- Rate limit (sliding window) por IP y por usuario.
- CORS por dominio del tenant.

## Amenazas y Mitigaciones (resumen)
- Escalada de privilegios → RBAC granular + tests.
- Inyección → validación y consultas parametrizadas.
- Duplicación webhooks → idempotencia + locks.
- Scraping catálogo → rate limit + ETag.
- Fuga multi-tenant → filtros estrictos + tests automatizados.

## Observabilidad
- Logs estructurados con traceId y tenantId.
- Métricas Prometheus: latencia, throughput, errores, colas.
- Tracing OTel exportable a Jaeger/Tempo.
- Dashboards API/Pagos/Notificaciones.
- Alertas por p95>1s, error rate>1%, backlog cola, CPU/Mem.
