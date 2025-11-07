# Workflow E16-E21: Frontend Features

**Duración**: 152h | **Prioridad**: P1

## Objetivo
Implementar todas las pantallas y features del frontend: catálogo, carrito, checkout, órdenes, perfil y notificaciones.

## Prerequisitos
- E15 completado (Frontend base)
- Backend completo funcionando (E01-E14)

## Documentación a Revisar
- `docs/architecture/frontend.md` (componentes, patrones, rutas)
- `docs/architecture/diagrams/component-hierarchy.md`
- `docs/architecture/diagrams/user-flows.md`
- `docs/ux/wireframes.md` (si existe)

## Entregables Incluidos

### E16: Product Catalog UI (24h)
### E17: Shopping Cart UI (20h)
### E18: Checkout Flow (28h)
### E19: Order Management UI (24h)
### E20: User Profile & Settings (20h)
### E21: Notifications UI (36h)

## Pasos

### Parte 1: Product Catalog (E16)

1. **Crear páginas de catálogo**
   - `/products` - Listado con filtros
   - `/products/[id]` - Detalle de producto
   - `/categories/[id]` - Productos por categoría

2. **Componentes de catálogo**
   - ProductCard
   - ProductGrid
   - ProductDetail
   - Filters (categoría, precio, búsqueda)
   - Variantes y addons selector

### Parte 2: Shopping Cart (E17)

3. **Crear páginas de carrito**
   - `/cart` - Vista de carrito
   - CartDrawer (sidebar)

4. **Componentes de carrito**
   - CartItem
   - CartSummary
   - QuantitySelector

### Parte 3: Checkout (E18)

5. **Crear flujo de checkout**
   - `/checkout` - Información de envío
   - `/checkout/payment` - Selección de pago
   - `/checkout/confirmation` - Confirmación

6. **Componentes de checkout**
   - AddressForm
   - PaymentMethodSelector
   - OrderSummary
   - Integración con MercadoPago/Stripe SDK

### Parte 4: Order Management (E19)

7. **Crear páginas de órdenes**
   - `/orders` - Listado de órdenes
   - `/orders/[id]` - Detalle de orden
   - Tracking en tiempo real (WebSocket)

8. **Componentes de órdenes**
   - OrderCard
   - OrderTimeline (estados)
   - OrderItems

### Parte 5: User Profile (E20)

9. **Crear páginas de perfil**
   - `/profile` - Información personal
   - `/profile/addresses` - Direcciones guardadas
   - `/profile/settings` - Configuración

10. **Componentes de perfil**
    - ProfileForm
    - AddressList
    - NotificationPreferences

### Parte 6: Notifications (E21)

11. **Implementar sistema de notificaciones**
    - Toast notifications
    - NotificationCenter (dropdown)
    - Push notifications (FCM)
    - WebSocket para real-time

12. **Componentes de notificaciones**
    - NotificationBell
    - NotificationList
    - NotificationItem
    - ToastContainer

## Validación

### Product Catalog (E16)
- [ ] Listado de productos carga y pagina
- [ ] Filtros funcionan (categoría, precio, búsqueda)
- [ ] Detalle de producto muestra variantes y addons
- [ ] Agregar al carrito funciona
- [ ] Responsive design funciona

### Shopping Cart (E17)
- [ ] Carrito muestra items correctamente
- [ ] Actualizar cantidad funciona
- [ ] Eliminar item funciona
- [ ] Subtotales se calculan en tiempo real
- [ ] CartDrawer se abre/cierra

### Checkout (E18)
- [ ] Flujo de checkout completa orden
- [ ] Validación de formularios funciona
- [ ] Integración con MercadoPago funciona
- [ ] Integración con Stripe funciona
- [ ] Confirmación muestra detalles correctos
- [ ] Redirección post-pago funciona

### Order Management (E19)
- [ ] Listado de órdenes carga
- [ ] Detalle de orden muestra items y estados
- [ ] Tracking en tiempo real funciona (WebSocket)
- [ ] Timeline de estados se actualiza

### User Profile (E20)
- [ ] Editar perfil funciona
- [ ] Agregar/editar/eliminar direcciones funciona
- [ ] Preferencias de notificaciones se guardan

### Notifications (E21)
- [ ] Toast notifications aparecen
- [ ] NotificationCenter muestra notificaciones
- [ ] Push notifications funcionan (FCM)
- [ ] WebSocket actualiza en tiempo real
- [ ] Marcar como leída funciona

## Prompt para IA

```
Ejecuta el workflow E16-E21-frontend-features siguiendo docs/workflows/E16-E21-frontend-features.md

Lee primero:
- docs/architecture/frontend.md (componentes y patrones completos)
- docs/architecture/diagrams/component-hierarchy.md
- docs/architecture/diagrams/user-flows.md

Implementa en orden:
1. E16: Product Catalog UI (listado, detalle, filtros)
2. E17: Shopping Cart UI (carrito, drawer)
3. E18: Checkout Flow (forms, pago, confirmación)
4. E19: Order Management UI (listado, detalle, tracking)
5. E20: User Profile (perfil, direcciones, settings)
6. E21: Notifications UI (toast, center, push, WebSocket)

CRÍTICO: Seguir patrones de componentes en frontend.md.
Validar flujos end-to-end antes de continuar al siguiente entregable.
```

## Siguiente
`E22-E26-devops-qa.md`
