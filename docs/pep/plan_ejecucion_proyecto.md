# Plan de Ejecución del Proyecto (PEP)

Generado: 2025-11-07
Versión: 1.0
Referencia PRD: `docs/prd/prd_sistema_integral_pedidos_20251107.md`

---
## 1. Resumen Ejecutivo
**Proyecto:** Sistema Integral de Pedidos Multirubro.
Plataforma completa para gestión de catálogo, pedidos, pagos, estados, notificaciones en tiempo real, panel administrativo y analítica. Arquitectura modular escalable preparada para futuras integraciones (WhatsApp, Telegram, POS, etc.). No es un MVP: cubre el ciclo completo.

**Objetivos Principales:**
- Centralizar la gestión de ventas y pedidos multirubro.
- Proveer experiencia moderna y responsiva para clientes y administradores.
- Garantizar extensibilidad mediante endpoints y arquitectura modular.
- Asegurar desempeño (p95 <= 200–500 ms según tipo), seguridad (RBAC, HMAC, JWT) y observabilidad.

**Alcance Resumido:**
- Frontend PWA + Panel Admin (Next.js).
- Backend API (NestJS, Postgres, Redis, BullMQ, S3/R2, WebSockets, FCM).
- Módulos: Auth/RBAC, Catálogo, Carrito/Checkout, Órdenes, Pagos, Notificaciones, Analítica, Webhooks.
- Multi-tenant lógico desde el inicio.

---
## 2. Estructura de Desglose del Trabajo (EDT / WBS)
Jerarquía con códigos únicos.

```
1.0 Análisis y Diseño
  1.1 Revisión PRD y Alcance
  1.2 Definición Arquitectura Lógica
  1.3 Diagramas Alto Nivel y Módulos
  1.4 Estrategia Multi-tenant y Seguridad
  1.5 Estrategia Observabilidad y SLOs
2.0 Arquitectura y Backend Base
  2.1 Repositorio y Convenciones
  2.2 Docker Compose (Postgres, Redis, API, FE)
  2.3 CI/CD Inicial (lint, build, test smoke)
  2.4 NestJS Core (/health, Swagger, Config)
  2.5 Contexto Tenant + RBAC Base
3.0 Módulo Catálogo
  3.1 Modelado DB (productos, categorías, variantes, addons)
  3.2 CRUD Backend Catálogo
  3.3 Upload Imágenes y Storage R2
  3.4 Cache Catálogo Redis
  3.5 UI Listado/Paginación
  3.6 UI Búsqueda/Filtros
  3.7 Estados Vacíos/Errores/Accesibilidad
4.0 Carrito y Checkout
  4.1 Persistencia Carrito (anon→auth)
  4.2 Pricing Engine (impuestos, cupones, propina, envío)
  4.3 Validación Zona/Horario/Stock
  4.4 API Checkout
  4.5 UI Checkout (formulario + resumen)
  4.6 Recalculo/Errores UX
5.0 Órdenes y Estados
  5.1 Modelo Estados Orden y FSM
  5.2 Auditoría y Timeline
  5.3 RBAC Acciones Críticas
  5.4 API Órdenes (CRUD + Transiciones)
  5.5 UI Admin Gestión Estados (Kanban)
6.0 Pagos
  6.1 Integración MercadoPago (checkout init)
  6.2 Webhook HMAC + Idempotencia
  6.3 Conciliación y Actualización Estado Pago
  6.4 UI Estado de Pago y Resultados
  6.5 Escenarios Error/Cancelación
7.0 Notificaciones y Tiempo Real
  7.1 Gateway WebSocket + Namespaces
  7.2 Plantillas Notificación + FCM
  7.3 Emisión Eventos (cambio estado, pago)
  7.4 Panel Admin Tiempo Real
  7.5 Latencia Verificada (<2s p95)
8.0 Analítica
  8.1 Rollup Agregaciones (ventas, top productos, clientes)
  8.2 Endpoints Métricas
  8.3 Dashboard Analítico Admin
  8.4 Validación Consistencia Datos
9.0 Integraciones y Endpoints Genéricos
  9.1 Webhooks WhatsApp/Telegram/Notifications
  9.2 Firmas HMAC y Replay Protection
  9.3 Rate Limiting / CORS Multi-tenant
10.0 Hardening y Seguridad Ampliada
  10.1 Helmet, CSP, Escaneo Dependencias
  10.2 Pruebas OWASP Básicas
  10.3 Ajustes/Post-fixes Seguridad
11.0 Pruebas y QA Final
  11.1 Suite Unit + Cobertura ≥80% Core
  11.2 Integración Critica (Catálogo→Checkout→Orden→Pago)
  11.3 Pruebas E2E Completo
  11.4 Pruebas Performance (500 rps lectura / 100 rps escritura)
  11.5 Pruebas Seguridad Fuzzing Básico
12.0 Documentación y Despliegue
  12.1 README + Runbook Operaciones
  12.2 Swagger Final + Versionado API
  12.3 Dashboards Observabilidad
  12.4 Plan Rollout y Feature Flags
  12.5 Acta Cierre y Lecciones Aprendidas
13.0 Mejora Continua
  13.1 Registro Técnico Deuda
  13.2 Backlog Futuras Mejoras (MFA, promociones avanzadas)
  13.3 Revisión Post-Implementación (30 días)
```

---
## 3. Etapas del Proyecto
### Etapa 1: Análisis y Diseño
- Objetivo: Consolidar visión técnica, riesgos y patrones antes del desarrollo.
- Entregables: 1.1–1.5.
- Pruebas: Revisión documental técnica, consistencia con PRD.
- Dependencias: Ninguna.
- Criterios de Aceptación: Documentos arquitectura y SLOs aprobados.
- Resultado Esperado: Base estable para construcción.

### Etapa 2: Arquitectura y Backend Base
- Objetivo: Tener ambiente de desarrollo operativo y núcleo API.
- Entregables: 2.1–2.5.
- Pruebas: Smoke /health, validación config, multi-tenant guard.
- Dependencias: Etapa 1.
- Criterios: CI/CD funcionando, /health y Swagger accesibles, tenant guard operativo.
- Resultado: Plataforma lista para módulos de negocio.

### Etapa 3: Catálogo
- Objetivo: Gestionar productos y mostrar catálogo en la UI.
- Entregables: 3.1–3.7.
- Pruebas: Unit servicios, integración CRUD, UI funcional, accesibilidad básica.
- Dependencias: Etapa 2.
- Criterios: CRUD completo + imágenes + cache + UI búsqueda/filtros.
- Resultado: Catálogo navegable y robusto.

### Etapa 4: Carrito y Checkout
- Objetivo: Flujo de compra con pricing engine.
- Entregables: 4.1–4.6.
- Pruebas: Unit pricing (<50ms p95), integración carrito→checkout, UX errores.
- Dependencias: Etapa 3.
- Criterios: Calculo totales exacto, validaciones zona/horario/stock.
- Resultado: Checkout listo para integrarse con pagos.

### Etapa 5: Órdenes y Estados
- Objetivo: Modelo de órdenes con estado y auditoría.
- Entregables: 5.1–5.5.
- Pruebas: FSM transiciones, auditoría diffs, UI gestión estados.
- Dependencias: Etapa 4.
- Criterios: Transiciones válidas, auditoría completa y visible.
- Resultado: Gestión operacional completa.

### Etapa 6: Pagos
- Objetivo: Procesar pagos y reflejar estado.
- Entregables: 6.1–6.5.
- Pruebas: Webhook idempotente, retorno MP, UI estados y errores.
- Dependencias: Etapa 5.
- Criterios: Pago aprobado actualiza orden, duplicados no replican.
- Resultado: Flujo compra-finanzas cerrado.

### Etapa 7: Notificaciones y Tiempo Real
- Objetivo: Eventos en vivo y push al cliente/panel.
- Entregables: 7.1–7.5.
- Pruebas: Latencia <2s p95, recepción push/WebSocket, panel tiempo real.
- Dependencias: Etapas 5–6.
- Criterios: Eventos confiables y monitoreo latencia.
- Resultado: Experiencia dinámica y reactiva.

### Etapa 8: Analítica
- Objetivo: Métricas y dashboard de negocio.
- Entregables: 8.1–8.4.
- Pruebas: Consistencia rollups (±1%), UI reportes.
- Dependencias: Etapa 7.
- Criterios: Endpoints métricas + dashboard validado.
- Resultado: Insight operable.

### Etapa 9: Integraciones y Endpoints Genéricos
- Objetivo: Preparar webhooks para terceros.
- Entregables: 9.1–9.3.
- Pruebas: Firma HMAC, replay protection, rate limiting.
- Dependencias: Etapa 6–7.
- Criterios: Endpoints listos y seguros.
- Resultado: Extensibilidad futura habilitada.

### Etapa 10: Hardening y Seguridad Ampliada
- Objetivo: Reforzar seguridad y conformidad.
- Entregables: 10.1–10.3.
- Pruebas: OWASP básico, escaneo deps, fixes.
- Dependencias: Etapa 9.
- Criterios: Riesgos críticos mitigados.
- Resultado: Plataforma endurecida.

### Etapa 11: Pruebas y QA Final
- Objetivo: Validar calidad integral y desempeño.
- Entregables: 11.1–11.5.
- Pruebas: Unit, integración, E2E, performance, fuzzing seguridad.
- Dependencias: Etapa 10.
- Criterios: SLOs y cobertura cumplidos, sin bugs críticos.
- Resultado: Producto listo para despliegue.

### Etapa 12: Documentación y Despliegue
- Objetivo: Preparar release y operación.
- Entregables: 12.1–12.5.
- Pruebas: Verificación runbook, dashboards activos.
- Dependencias: Etapa 11.
- Criterios: DoD global completado.
- Resultado: Lanzamiento estable.

### Etapa 13: Mejora Continua
- Objetivo: Post-lanzamiento y evolución.
- Entregables: 13.1–13.3.
- Pruebas: Revisión métricas adopción, backlog priorizado.
- Dependencias: Etapa 12.
- Criterios: Informe post-implementación.
- Resultado: Ciclo de optimización iniciado.

---
## 4. Entregables por Etapa (Detalle)
Formato por entregable: Código, Descripción, Objetivo, Tareas, Dependencias, Criterios Aceptación, Pruebas, Resultado.

### E1.1 Revisión PRD y Alcance
- Objetivo: Confirmar alineación negocio-técnico.
- Tareas: Lecture PRD, checklist consistencia, notas riesgos.
- Dependencias: Ninguna.
- Criterios: Documento resumen validado.
- Pruebas: Revisión cruzada vs alcance.
- Resultado: Aprobación para diseño.

### E1.2 Definición Arquitectura Lógica
- Objetivo: Seleccionar patrones y módulos.
- Tareas: Diagrama alto nivel, boundaries, elección stack final.
- Dependencias: E1.1.
- Criterios: Diagrama aprobado y sin gaps.
- Pruebas: Validación contra requisitos escalabilidad.
- Resultado: Base arquitectura.

### E1.3 Diagramas Alto Nivel y Módulos
- Objetivo: Comunicar la arquitectura y relaciones entre módulos.
- Tareas: Diagramas C4 (Context/Container), flujos clave, dependencias.
- Dependencias: E1.2.
- Criterios: Diagramas versionados en `docs/architecture/` y referenciados por el PRD.
- Pruebas: Revisión por pares, consistencia con WBS y SLOs.
- Resultado: Diagramas aprobados.

### E1.4 Estrategia Multi-tenant y Seguridad
- Objetivo: Definir aislamiento, autenticación y controles de acceso.
- Tareas: Tenant context, claves JWT RS256, RBAC roles, límites por tenant.
- Dependencias: E1.2.
- Criterios: Documento de estrategia y guardas definidos.
- Pruebas: Casos negativos de aislamiento y pruebas de roles.
- Resultado: Estrategia validada.

### E1.5 Estrategia Observabilidad y SLOs
- Objetivo: Medir salud del sistema y definir objetivos.
- Tareas: Estructura de logs, métricas Prometheus, trazas OTel, SLOs por endpoint/evento.
- Dependencias: E1.2.
- Criterios: SLOs documentados y paneles planificados.
- Pruebas: Validación de métricas mínimas con app demo.
- Resultado: Observabilidad definida.

### E2.1 Repositorio y Convenciones
- Objetivo: Establecer estándares de código y ramas.
- Tareas: Estructura monorepo/multirepo, linters, formateadores, commitlint.
- Dependencias: E1.x.
- Criterios: Convenciones en README y hooks activos.
- Pruebas: CI corre linters y falla ante incumplimientos.
- Resultado: Base de trabajo consistente.

### E2.2 Docker Compose (Postgres, Redis, API, FE)
- Objetivo: Entorno reproducible local.
- Tareas: Compose servicios, redes, volúmenes, healthchecks, perfiles.
- Dependencias: E2.1.
- Criterios: `docker compose up` levanta todo y /health OK.
- Pruebas: Smoke de API y FE.
- Resultado: Dev env listo.

### E2.3 CI/CD Inicial (lint, build, test smoke)
- Objetivo: Pipeline mínimo de calidad.
- Tareas: Workflow CI, cache deps, matrices, reporte cobertura inicial.
- Dependencias: E2.1.
- Criterios: Pipeline verde en main y PRs con checks obligatorios.
- Pruebas: PR de prueba con fallos de lint bloqueados.
- Resultado: Calidad automatizada.

### E2.4 NestJS Core (/health, Swagger, Config)
- Objetivo: Núcleo API consistente.
- Tareas: Bootstrap Nest, configuración `.env`, Swagger básico, /health con dependencias.
- Dependencias: E2.2.
- Criterios: Endpoints accesibles y documentados.
- Pruebas: Supertest /health, validación swagger.json.
- Resultado: API base funcional.

### E2.5 Contexto Tenant + RBAC Base
- Objetivo: Aislar datos por tenant y definir roles base.
- Tareas: Interceptor/guard de tenant, extracción subdominio/header, roles admin/operador/cliente.
- Dependencias: E2.4.
- Criterios: Endpoints rechazan accesos cross-tenant.
- Pruebas: Tests negativos y de roles.
- Resultado: Seguridad inicial operativa.

### E3.1 Modelado DB Catálogo
- Objetivo: Esquema de productos, categorías, variantes, addons.
- Tareas: Tablas, índices, migraciones, restricciones, seeds mínimos.
- Dependencias: E2.5.
- Criterios: Migraciones idempotentes y reversibles.
- Pruebas: Integración CRUD de ejemplo.
- Resultado: Modelo consistente.

### E3.2 CRUD Backend Catálogo
- Objetivo: Operaciones completas de catálogo.
- Tareas: DTOs validación, servicios, repos, controladores, paginación y filtros.
- Dependencias: E3.1.
- Criterios: Paginación estable y filtros combinables.
- Pruebas: Unit servicios, integración endpoints.
- Resultado: API catálogo lista.

### E3.3 Upload Imágenes y Storage R2
- Objetivo: Gestión de medios eficiente.
- Tareas: Presigned URLs, validación MIME/size, thumbnails (si aplica), CDN.
- Dependencias: E3.2.
- Criterios: Subida segura y referencias persistentes.
- Pruebas: Subida fallida por tipo/tamaño, expiración URL.
- Resultado: Medios integrados.

### E3.4 Cache Catálogo Redis
- Objetivo: Acelerar lecturas frecuentes.
- Tareas: Cache por lista/detalle, invalidación por cambios, TTL y etiquetas por tenant.
- Dependencias: E3.2.
- Criterios: Hit rate >70% en listados.
- Pruebas: Bench comparativo con/ sin cache.
- Resultado: Rendimiento mejorado.

### E3.5 UI Listado/Paginación
- Objetivo: Navegar catálogo eficientemente.
- Tareas: Paginación infinita/servidor, skeletons, loading states.
- Dependencias: E3.2.
- Criterios: UX fluida p95 < 200ms (cache caliente).
- Pruebas: E2E navegación catálogo.
- Resultado: Listado usable.

### E3.6 UI Búsqueda/Filtros
- Objetivo: Encontrar productos rápido.
- Tareas: Filtros por categoría/precio/tags, debounce, URL state.
- Dependencias: E3.5.
- Criterios: Filtros combinables y persistentes en URL.
- Pruebas: E2E filtros y back/forward.
- Resultado: Descubrimiento eficiente.

### E3.7 Estados Vacíos/Errores/Accesibilidad
- Objetivo: Robustez UX.
- Tareas: Mensajes claros, navegación alternativa, aria-labels, contraste.
- Dependencias: E3.5.
- Criterios: AA WCAG básico, sin callejones UX.
- Pruebas: Axe checks y tests de snapshots.
- Resultado: UX sólida.

### E4.1 Persistencia Carrito (anon→auth)
- Objetivo: Mantener carrito entre sesiones y al autenticarse.
- Tareas: Carrito en Redis/DB, merge estrategias, expiración.
- Dependencias: E3.x.
- Criterios: Merge sin pérdida, reglas claras en conflictos.
- Pruebas: Escenarios anon→auth, expirado, multi-device.
- Resultado: Carrito confiable.

### E4.2 Pricing Engine
- Objetivo: Cálculo de totales (impuestos, cupones, propina, envío).
- Tareas: Módulo puro, reglas configurables, redondeo estable.
- Dependencias: E4.1.
- Criterios: Determinismo y precisión centavos.
- Pruebas: Unit con tablas de prueba y casos borde.
- Resultado: Totales correctos.

### E4.3 Validación Zona/Horario/Stock
- Objetivo: Garantizar promesas cumplibles.
- Tareas: Ventanas horarias, zonas delivery, stock mínimo.
- Dependencias: E4.1.
- Criterios: Bloqueos con mensajes accionables.
- Pruebas: Negativos y límites (cambio de zona, horario cierre).
- Resultado: Checkout confiable.

### E4.4 API Checkout
- Objetivo: Endpoint idempotente de inicio de checkout.
- Tareas: Validar carrito, bloquear stock, preparar preferencia de pago.
- Dependencias: E4.2–E4.3.
- Criterios: Idempotency-Key soportado.
- Pruebas: Repetición de requests no duplica transacciones.
- Resultado: Inicio compra sólido.

### E4.5 UI Checkout (formulario + resumen)
- Objetivo: Completar datos de compra claramente.
- Tareas: Dirección, contacto, método entrega, resumen costos.
- Dependencias: E4.4.
- Criterios: Validaciones inline y accesibles.
- Pruebas: E2E flow feliz y errores comunes.
- Resultado: UX clara.

### E4.6 Recalculo/Errores UX
- Objetivo: Manejar cambios y errores en tiempo real.
- Tareas: Recalcular al editar items, manejo caídas proveedor.
- Dependencias: E4.5.
- Criterios: Mensajes guiados sin pérdida de estado.
- Pruebas: Simulación fallos intermitentes.
- Resultado: Resiliencia UX.

### E5.1 Modelo Estados Orden y FSM
- Objetivo: Transiciones controladas de órdenes.
- Tareas: Diagrama FSM, enum estados, reglas por rol.
- Dependencias: E4.4.
- Criterios: Solo transiciones válidas permitidas.
- Pruebas: Tests exhaustivos de FSM.
- Resultado: Flujo orden estable.

### E5.2 Auditoría y Timeline
- Objetivo: Trazabilidad completa.
- Tareas: Tabla audit, quién/cuándo/qué, diffs relevantes.
- Dependencias: E5.1.
- Criterios: Cada cambio registrado y visible.
- Pruebas: Integración verificando auditoría.
- Resultado: Historial confiable.

### E5.3 RBAC Acciones Críticas
- Objetivo: Proteger operaciones sensibles.
- Tareas: Guards/Decorators, permisos por rol y tenant.
- Dependencias: E2.5, E5.1.
- Criterios: Acciones críticas restringidas.
- Pruebas: Negativos por rol incorrecto.
- Resultado: Seguridad aplicada.

### E5.4 API Órdenes (CRUD + Transiciones)
- Objetivo: Exponer manejo de órdenes.
- Tareas: Listar, ver, actualizar, cambiar estado, filtros.
- Dependencias: E5.1–E5.3.
- Criterios: Validaciones consistentes y errores normalizados.
- Pruebas: Integración y contratos.
- Resultado: API completa.

### E5.5 UI Admin Gestión Estados (Kanban)
- Objetivo: Operación visual de órdenes.
- Tareas: Columnas por estado, drag & drop, filtros.
- Dependencias: E5.4.
- Criterios: Actualización en vivo y sin colisiones.
- Pruebas: E2E cambios de estado concurrentes.
- Resultado: Panel operativo.

### E6.1 Integración MercadoPago (checkout init)
- Objetivo: Iniciar pago con preferencia.
- Tareas: SDK/HTTP, credenciales por tenant, preferencia segura.
- Dependencias: E4.4.
- Criterios: Preferencia creada y URL/iframe devuelto.
- Pruebas: Sandbox happy path.
- Resultado: Inicio de pago listo.

### E6.2 Webhook HMAC + Idempotencia
- Objetivo: Procesar notificaciones de pago de forma segura.
- Tareas: Firma HMAC compartida, validación de origen, llaves rotadas.
- Dependencias: E6.1.
- Criterios: Rechazo de replays y firmas inválidas.
- Pruebas: Reenvío duplicado no duplica cambios.
- Resultado: Webhook robusto.

### E6.3 Conciliación y Actualización Estado Pago
- Objetivo: Sincronía confiable con proveedor.
- Tareas: Consultas activas, reintentos, reconciliación nocturna.
- Dependencias: E6.2.
- Criterios: Estados alineados sin inconsistencias > 5 min.
- Pruebas: Simular caídas y recuperación.
- Resultado: Estados correctos.

### E6.4 UI Estado de Pago y Resultados
- Objetivo: Informar al usuario los resultados del pago.
- Tareas: Pantallas success/pending/failure, recibos.
- Dependencias: E6.1.
- Criterios: Mensajes claros y accesibles.
- Pruebas: E2E retorno desde pasarela.
- Resultado: UX transparente.

### E6.5 Escenarios Error/Cancelación
- Objetivo: Manejo completo de fallas.
- Tareas: Cancelación voluntaria, timeouts, reintentos, soporte manual.
- Dependencias: E6.4.
- Criterios: Sin órdenes zombis; estados consistentes.
- Pruebas: Casos borde y recuperación.
- Resultado: Robustez operativa.

### E7.1 Gateway WebSocket + Namespaces
- Objetivo: Comunicación tiempo real.
- Tareas: Namespaces por tenant, auth WS, rooms por orden.
- Dependencias: E5.x.
- Criterios: Conexión segura por tenant.
- Pruebas: Conexión concurrente multi-tenant.
- Resultado: Canal en vivo.

### E7.2 Plantillas Notificación + FCM
- Objetivo: Notificaciones push estándar.
- Tareas: Plantillas parametrizables, FCM tokens, suscripciones.
- Dependencias: E7.1.
- Criterios: Entrega confiable y configurable.
- Pruebas: Envíos de prueba y métricas entrega.
- Resultado: Notificaciones listas.

### E7.3 Emisión Eventos (estado, pago)
- Objetivo: Reactividad interna y externa.
- Tareas: Eventos dominio, publish/subscribe, retriable jobs.
- Dependencias: E5.x, E6.x.
- Criterios: Eventos idempotentes con backoff.
- Pruebas: Retries controlados.
- Resultado: Sistema event-driven.

### E7.4 Panel Admin Tiempo Real
- Objetivo: Vista operativa actualizada al instante.
- Tareas: Subscripciones WS, indicadores, colas.
- Dependencias: E7.1–E7.3.
- Criterios: Latencia <2s p95 en actualizaciones.
- Pruebas: Medición con picos de eventos.
- Resultado: Operación eficiente.

### E7.5 Latencia Verificada (<2s p95)
- Objetivo: Validar SLOs realtime.
- Tareas: Bench y trazas OTel, panel métricas.
- Dependencias: E7.4.
- Criterios: p95 < 2s sostenido.
- Pruebas: Pruebas carga con K6/Artillery.
- Resultado: SLOs cumplidos.

### E8.1 Rollup Agregaciones
- Objetivo: Métricas de negocio consistentes.
- Tareas: Jobs agregación, particiones/índices, retención.
- Dependencias: E5.x, E6.x.
- Criterios: Agregaciones diarias/horarias correctas.
- Pruebas: Comparación contra dataset control.
- Resultado: Datos confiables.

### E8.2 Endpoints Métricas
- Objetivo: Exponer KPIs.
- Tareas: API segura admin, filtros por rango/tenant.
- Dependencias: E8.1.
- Criterios: Respuestas <300ms p95 con cache.
- Pruebas: Integración y performance.
- Resultado: KPIs disponibles.

### E8.3 Dashboard Analítico Admin
- Objetivo: Visualizar KPIs.
- Tareas: Gráficos, tablas, exportaciones.
- Dependencias: E8.2.
- Criterios: Lectura clara, drill-down básico.
- Pruebas: UX tests con stakeholders.
- Resultado: Insight accionable.

### E8.4 Validación Consistencia Datos
- Objetivo: Confiabilidad de métricas.
- Tareas: Reglas de reconciliación, alertas de desvío.
- Dependencias: E8.1–E8.3.
- Criterios: Desvío ≤1% vs fuente.
- Pruebas: Checks automáticos nocturnos.
- Resultado: Confianza en datos.

### E9.1 Webhooks Integraciones
- Objetivo: Preparar integración con WhatsApp/Telegram/otros.
- Tareas: Endpoints genéricos, mapeo eventos, throttling.
- Dependencias: E7.x.
- Criterios: Contratos documentados y probados.
- Pruebas: Simuladores externos.
- Resultado: Extensibilidad lista.

### E9.2 Firmas HMAC y Replay Protection
- Objetivo: Seguridad en integraciones.
- Tareas: Firmas con timestamp, ventanas de validez, nonce store.
- Dependencias: E9.1.
- Criterios: Rechazo de replays e integridad garantizada.
- Pruebas: Reenvíos y alteración de payload.
- Resultado: Webhooks seguros.

### E9.3 Rate Limiting / CORS Multi-tenant
- Objetivo: Protección de recursos por tenant.
- Tareas: Límites por clave/tenant, CORS per-domain, listas blancas.
- Dependencias: E2.5.
- Criterios: Bloqueos correctos y CORS sin fugas.
- Pruebas: Ataques de prueba y orígenes cruzados.
- Resultado: Capa defensiva eficaz.

### E10.1 Helmet, CSP, Escaneo Dependencias
- Objetivo: Endurecer superficie.
- Tareas: Headers seguridad, políticas CSP, SCA en CI.
- Dependencias: E9.x.
- Criterios: Sin vulnerabilidades críticas conocidas.
- Pruebas: Scanners y verificación headers.
- Resultado: Riesgo reducido.

### E10.2 Pruebas OWASP Básicas
- Objetivo: Detectar fallas comunes.
- Tareas: SQLi/XSS/CSRF tests, secrets en logs, auth/roles.
- Dependencias: E10.1.
- Criterios: Hallazgos críticos = 0 antes de salir.
- Pruebas: ZAP/DAST + manual.
- Resultado: Seguridad verificada.

### E10.3 Ajustes/Post-fixes Seguridad
- Objetivo: Cerrar hallazgos.
- Tareas: Parcheos, nuevas reglas, endurecer defaults.
- Dependencias: E10.2.
- Criterios: Todos los críticos resueltos.
- Pruebas: Re-test sin regresión.
- Resultado: Cierre de vulnerabilidades.

### E11.1 Suite Unit + Cobertura ≥80% Core
- Objetivo: Asegurar calidad interna.
- Tareas: Tests por módulo crítico, umbrales en CI.
- Dependencias: E2.x–E10.x.
- Criterios: ≥80% en core, reportes en CI.
- Pruebas: Ejecución completa y estable.
- Resultado: Confianza en cambios.

### E11.2 Integración Crítica End-to-End Parcial
- Objetivo: Validar cadena Catálogo→Checkout→Orden→Pago.
- Tareas: Tests de integración orquestados.
- Dependencias: E3–E6.
- Criterios: Flujo feliz estable y repetible.
- Pruebas: Datos seed y limpieza entre runs.
- Resultado: Flujo núcleo validado.

### E11.3 Pruebas E2E Completo
- Objetivo: Validar UX y flujos reales.
- Tareas: Playwright/Cypress end-to-end.
- Dependencias: E11.2.
- Criterios: Suites verdes y deterministas.
- Pruebas: CI nightly y por PR.
- Resultado: Calidad percibida.

### E11.4 Pruebas Performance
- Objetivo: Verificar SLOs de rendimiento.
- Tareas: Escenarios lectura 500 rps, escritura 100 rps, profiling.
- Dependencias: E11.3.
- Criterios: p95 dentro de objetivos documentados.
- Pruebas: Artillery/K6 con reportes.
- Resultado: Desempeño validado.

### E11.5 Pruebas Seguridad Fuzzing Básico
- Objetivo: Descubrir casos inesperados.
- Tareas: Fuzz endpoints críticos y validaciones.
- Dependencias: E11.3.
- Criterios: Sin crashes ni fugas de info.
- Pruebas: Fuzz runners en CI opcional.
- Resultado: Robustez aumentada.

### E12.1 README + Runbook Operaciones
- Objetivo: Acelerar onboarding y operación.
- Tareas: README dev/prod, runbook incidentes, playbooks.
- Dependencias: E2.x–E11.x.
- Criterios: Instrucciones claras y probadas.
- Pruebas: Reproducir setup en limpio.
- Resultado: Documentación útil.

### E12.2 Swagger Final + Versionado API
- Objetivo: Contratos claros y versionados.
- Tareas: Revisar tags, examples, políticas de deprecación.
- Dependencias: E11.x.
- Criterios: Spec válido y publicado.
- Pruebas: Validadores OpenAPI.
- Resultado: API lista para clientes.

### E12.3 Dashboards Observabilidad
- Objetivo: Monitoreo operativo.
- Tareas: Dashboards logs/métricas/trazas y alertas SLO.
- Dependencias: E1.5, E7.x, E11.x.
- Criterios: Alertas útiles, bajos falsos positivos.
- Pruebas: Firing tests y silencing controlado.
- Resultado: Operación visible.

### E12.4 Plan Rollout y Feature Flags
- Objetivo: Despliegue seguro.
- Tareas: Flags por módulo, canary/blue-green, rollback.
- Dependencias: E11.x.
- Criterios: Estrategia aprobada y ensayada.
- Pruebas: Simulacro rollback.
- Resultado: Salida controlada.

### E12.5 Acta Cierre y Lecciones Aprendidas
- Objetivo: Capturar aprendizajes y formalizar cierre.
- Tareas: Retro final, KPIs vs SLOs, backlog de mejoras.
- Dependencias: E12.4.
- Criterios: Acta firmada y publicada.
- Pruebas: Revisión por stakeholders.
- Resultado: Cierre formal.

### E13.1 Registro Técnico Deuda
- Objetivo: Hacer visible la deuda técnica.
- Tareas: Catalogar items, esfuerzo/impacto, priorización.
- Dependencias: E12.5.
- Criterios: Lista priorizada en issues.
- Pruebas: Revisión técnica.
- Resultado: Transparencia técnica.

### E13.2 Backlog Futuras Mejoras
- Objetivo: Plan de evolución.
- Tareas: MFA, promociones avanzadas, RLS Postgres, etc.
- Dependencias: E13.1.
- Criterios: Roadmap 90 días.
- Pruebas: N/A documental.
- Resultado: Ruta de valor.

### E13.3 Revisión Post-Implementación (30 días)
- Objetivo: Evaluar impacto real.
- Tareas: Medir adopción, NPS, incidentes, performance real.
- Dependencias: E12.5.
- Criterios: Informe con acciones y owners.
- Pruebas: Datos de producción anonimizados.
- Resultado: Mejora continua iniciada.

Nota: Este apartado es documento vivo; mantenerlo sincronizado con PRD/ADRs y actualizar criterios/pruebas ante cambios.

---
## 5. Cronograma General (Estimado)
| Etapa | Semanas | Dependencias | Resultado Clave |
|-------|---------|--------------|-----------------|
| 1 | 1 | - | Alineación técnica | 
| 2 | 1 | 1 | Base operativa | 
| 3 | 2 | 2 | Catálogo completo | 
| 4 | 2 | 3 | Checkout listo | 
| 5 | 2 | 4 | Órdenes + Auditoría | 
| 6 | 2 | 5 | Pagos integrados | 
| 7 | 1 | 5,6 | Realtime + Notificaciones | 
| 8 | 1 | 7 | Analítica | 
| 9 | 1 | 6,7 | Endpoints integraciones | 
| 10 | 1 | 9 | Plataforma endurecida | 
| 11 | 1 | 10 | Calidad validada | 
| 12 | 1 | 11 | Despliegue | 
| 13 | 1 (post) | 12 | Optimización | 

---
## 6. Estrategia de Pruebas
- Unitarias: Servicios, pricing engine, validadores, FSM órdenes.
- Integración: Flujos CRUD, webhook pago, notificación estado.
- E2E: Catálogo → Carrito → Checkout → Pago → Órdenes → Notificación.
- Performance: p95 latencias, throughput lectura/escritura, tiempo notificación.
- Seguridad: OWASP top 10, fuzzing básico, firma HMAC y replay.
- Herramientas: Jest, Supertest, Playwright/Cypress (E2E), Artillery/K6 (performance), ZAP/OWASP scanners (seguridad), OpenTelemetry para trazas.
- Criterios Éxito: Cobertura ≥80% core; SLOs cumplidos; 0 vulnerabilidades críticas.

---
## 7. Gestión de Cambios y Control de Avance
- Registro cambios: Issues + etiquetas (scope-change, risk, enhancement).
- Flujo si falla un entregable: corregir → re-test → nuevo gate.
- Aprobación hito: Demo + checklist Gate (tests, cobertura, docs, seguridad).
- Retroalimentación: Sesión breve por hito mayor (cada milestone).
- Versionado: SemVer interno, PRD y PEP con changelog.

---
## 8. Gestión de Riesgos
| Riesgo | Prob | Impacto | Mitigación | Señal Temprana |
|--------|------|---------|-----------|----------------|
| Duplicación webhooks | Media | Media | Idempotencia + locks Redis | Logs repetidos |
| Fuga multi-tenant | Baja | Crítica | Filtros + tests negativos | Test falla aislamiento |
| Latencia notificaciones | Media | Media | Monitoreo cola + autoscaling | p95 >2s 5min |
| Inestabilidad pasarela | Media | Alto | Retries/backoff + conciliación | Errores proveedor concentrados |
| Festivos retrasando cronograma | Media | Media | Buffer y replan semanal | Burn-down desviado |

---
## 9. Mecanismos de Comunicación
- Daily 15 min.
- Canal interno (Slack/Teams) con #backend #frontend #qa y #alerts.
- Reporte semanal: avance % por etapa y riesgos.
- Dashboard CI + métricas visible para todos.
- Acta Gate firmada por responsable y aprobador (PM/Stakeholder).

---
## 10. Conclusión
Este PEP establece un camino estructurado, medible y controlado para entregar una plataforma completa de pedidos multirubro con alta calidad técnica y funcional. Cada etapa cierra con revisiones y pruebas para asegurar estabilidad y trazabilidad. El enfoque modular y la observabilidad integrada permiten crecimiento futuro (MFA, promociones, microservicios) sin rehacer la base.

> Documento vivo: Actualizar ante cambios sustanciales y mantener sincronía con PRD y ADRs.
