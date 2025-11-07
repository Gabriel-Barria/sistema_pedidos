# Workflow E15: Frontend Base

**Duración**: 32h | **Prioridad**: P0

## Objetivo
Crear estructura base del frontend con Next.js 14, App Router, autenticación y estado global.

## Prerequisitos
- E03 completado (backend Auth funcionando)
- Backend corriendo en http://localhost:3000

## Documentación a Revisar
- `docs/architecture/frontend.md` (estructura, patrones, App Router)
- `docs/architecture/diagrams/component-hierarchy.md`
- `docs/project_plan/project_plan.md` (Entregable 15)
- `docs/instrucciones_generales.md` (convenciones de código)

## Pasos

1. **Inicializar proyecto Next.js 14**
   - Setup con App Router
   - Configurar TypeScript strict mode
   - Configurar Tailwind CSS

2. **Crear estructura de carpetas**
   - `/app` (rutas)
   - `/components` (ui, features, layouts)
   - `/lib` (utils, api client, hooks)
   - `/contexts` (estado global)
   - `/types` (interfaces)

3. **Implementar autenticación**
   - Context de Auth
   - Login/Register pages
   - Middleware de Next.js para rutas protegidas
   - JWT storage (httpOnly cookies)

4. **Configurar API client**
   - Axios instance con interceptors
   - Refresh token automático
   - Error handling global

5. **Setup de herramientas**
   - ESLint + Prettier
   - next.config.js (env vars, headers)
   - Layout raíz con providers

6. **Testing setup**
   - Jest + React Testing Library
   - Vitest (alternativa)
   - Scripts en package.json

## Validación

- [ ] `npm run dev` inicia aplicación en http://localhost:3001
- [ ] Login funciona y almacena JWT
- [ ] Refresh token automático funciona
- [ ] Rutas protegidas redirigen a /login
- [ ] Context de Auth provee usuario actual
- [ ] API client intercepta errores 401
- [ ] Tailwind CSS aplica estilos
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run test` ejecuta tests
- [ ] Estructura de carpetas según frontend.md

## Prompt para IA

```
Ejecuta el workflow E15-frontend-base siguiendo docs/workflows/E15-frontend-base.md

Lee primero:
- docs/architecture/frontend.md (estructura completa y patrones)
- docs/architecture/diagrams/component-hierarchy.md

Implementa:
1. Proyecto Next.js 14 con App Router
2. Estructura de carpetas modular
3. Autenticación con Context API
4. API client con Axios
5. Middleware para rutas protegidas
6. Testing setup completo

Valida que login funcione y rutas protegidas redirijan.
```

## Siguiente
`E16-product-catalog-ui.md` (agrupado en E16-E21-frontend-features.md)
