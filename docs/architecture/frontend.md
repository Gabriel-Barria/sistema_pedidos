# Arquitectura Frontend (Next.js PWA + Admin)

**Versión**: 1.1
**Última actualización**: 2025-11-07 19:02
**Estado**: En Progreso

---

## Índice

1. [Visión General](#visión-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Arquitectura de Componentes](#arquitectura-de-componentes)
5. [Estado y Data Fetching](#estado-y-data-fetching)
6. [Routing y Layouts](#routing-y-layouts)
7. [PWA y Offline](#pwa-y-offline)
8. [Ejemplos de Código](#ejemplos-de-código)
9. [Seguridad](#seguridad)
10. [Testing](#testing)

---

## Visión General

El frontend está construido con **Next.js 14** (App Router) como:
- **PWA (Progressive Web App)** para clientes
- **Panel administrativo web** para operadores
- **SSR y CSR** híbrido según necesidades
- **TypeScript** para type safety
- **Tailwind CSS** para estilos

### Principios de Diseño

- **Mobile First**: Diseño responsive desde mobile hacia desktop
- **Accesibilidad (WCAG AA)**: Semantic HTML, ARIA labels, navegación por teclado
- **Performance**: Code splitting, lazy loading, optimización de imágenes
- **PWA**: Installable, offline-capable, push notifications
- **UX Consistente**: Sistema de diseño unificado

---

## Estructura de Carpetas

```
frontend/
├── Dockerfile
├── .dockerignore
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── public/
│   ├── icons/
│   ├── images/
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service Worker
│
└── src/
    ├── app/                   # Next.js App Router
    │   ├── layout.tsx         # Root layout
    │   ├── page.tsx           # Home page
    │   ├── loading.tsx        # Loading UI
    │   ├── error.tsx          # Error boundary
    │   ├── not-found.tsx      # 404 page
    │   │
    │   ├── (auth)/            # Auth group
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   ├── register/
    │   │   │   └── page.tsx
    │   │   └── layout.tsx
    │   │
    │   ├── (client)/          # Client app group
    │   │   ├── layout.tsx     # Client layout
    │   │   ├── catalog/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/
    │   │   │       └── page.tsx
    │   │   ├── cart/
    │   │   │   └── page.tsx
    │   │   ├── checkout/
    │   │   │   └── page.tsx
    │   │   ├── orders/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/
    │   │   │       └── page.tsx
    │   │   └── profile/
    │   │       └── page.tsx
    │   │
    │   ├── (admin)/           # Admin panel group
    │   │   ├── layout.tsx     # Admin layout with sidebar
    │   │   ├── dashboard/
    │   │   │   └── page.tsx
    │   │   ├── products/
    │   │   │   ├── page.tsx
    │   │   │   ├── new/
    │   │   │   │   └── page.tsx
    │   │   │   └── [id]/
    │   │   │       └── edit/
    │   │   │           └── page.tsx
    │   │   ├── orders/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/
    │   │   │       └── page.tsx
    │   │   ├── analytics/
    │   │   │   └── page.tsx
    │   │   └── settings/
    │   │       └── page.tsx
    │   │
    │   └── api/               # API routes (si se necesitan)
    │       └── auth/
    │           └── [...nextauth]/
    │               └── route.ts
    │
    ├── components/            # Componentes reutilizables
    │   ├── ui/                # Componentes base
    │   │   ├── Button/
    │   │   │   ├── Button.tsx
    │   │   │   ├── Button.test.tsx
    │   │   │   ├── Button.stories.tsx
    │   │   │   └── index.ts
    │   │   ├── Input/
    │   │   ├── Modal/
    │   │   ├── Card/
    │   │   ├── Badge/
    │   │   ├── Spinner/
    │   │   └── Toast/
    │   │
    │   ├── layout/            # Componentes de layout
    │   │   ├── Header/
    │   │   ├── Footer/
    │   │   ├── Sidebar/
    │   │   └── Container/
    │   │
    │   └── features/          # Componentes de features
    │       ├── ProductCard/
    │       ├── OrderCard/
    │       ├── CartItem/
    │       ├── CheckoutForm/
    │       └── OrderTimeline/
    │
    ├── modules/               # Módulos de negocio
    │   ├── auth/
    │   │   ├── components/
    │   │   │   ├── LoginForm.tsx
    │   │   │   └── RegisterForm.tsx
    │   │   ├── hooks/
    │   │   │   ├── useAuth.ts
    │   │   │   └── useSession.ts
    │   │   └── utils/
    │   │       └── auth-helpers.ts
    │   │
    │   ├── catalog/
    │   │   ├── components/
    │   │   │   ├── ProductList.tsx
    │   │   │   ├── ProductFilters.tsx
    │   │   │   └── ProductSearch.tsx
    │   │   ├── hooks/
    │   │   │   ├── useProducts.ts
    │   │   │   └── useCategories.ts
    │   │   └── types/
    │   │       └── product.types.ts
    │   │
    │   ├── orders/
    │   │   ├── components/
    │   │   │   ├── OrderList.tsx
    │   │   │   ├── OrderDetail.tsx
    │   │   │   └── OrderKanban.tsx
    │   │   └── hooks/
    │   │       ├── useOrders.ts
    │   │       └── useOrderUpdates.ts
    │   │
    │   ├── cart/
    │   │   ├── components/
    │   │   │   ├── CartSummary.tsx
    │   │   │   └── CartItemList.tsx
    │   │   ├── hooks/
    │   │   │   └── useCart.ts
    │   │   └── store/
    │   │       └── cart.store.ts
    │   │
    │   └── payments/
    │       ├── components/
    │       │   └── PaymentResult.tsx
    │       └── hooks/
    │           └── usePayment.ts
    │
    ├── lib/                   # Librerías y utilidades
    │   ├── api/
    │   │   ├── client.ts      # Axios/Fetch cliente
    │   │   ├── endpoints.ts   # URLs de endpoints
    │   │   └── types.ts       # Tipos generados de OpenAPI
    │   ├── websocket/
    │   │   └── socket-client.ts
    │   ├── validations/
    │   │   └── schemas.ts     # Zod schemas
    │   └── utils/
    │       ├── format.ts
    │       ├── date.ts
    │       └── currency.ts
    │
    ├── hooks/                 # Hooks compartidos
    │   ├── useDebounce.ts
    │   ├── useLocalStorage.ts
    │   ├── useMediaQuery.ts
    │   ├── useToast.ts
    │   └── useWebSocket.ts
    │
    ├── store/                 # Estado global
    │   ├── index.ts
    │   ├── auth.store.ts
    │   ├── cart.store.ts
    │   └── ui.store.ts
    │
    ├── types/                 # Tipos TypeScript globales
    │   ├── api.types.ts
    │   ├── models.types.ts
    │   └── index.ts
    │
    ├── styles/                # Estilos globales
    │   ├── globals.css
    │   └── variables.css
    │
    └── config/                # Configuración
        ├── constants.ts
        ├── routes.ts
        └── env.ts
```

---

## Stack Tecnológico

| Componente | Tecnología | Versión | Propósito |
|------------|-----------|---------|-----------|
| **Framework** | Next.js | 14.x | React framework con App Router |
| **React** | React | 18.x | UI library |
| **Lenguaje** | TypeScript | 5.x | Type safety |
| **Estilos** | Tailwind CSS | 3.x | Utility-first CSS |
| **UI Components** | Radix UI | 1.x | Headless components |
| **Iconos** | Lucide React | 0.x | Icon library |
| **Formularios** | React Hook Form | 7.x | Form management |
| **Validación** | Zod | 3.x | Schema validation |
| **HTTP Client** | Axios | 1.x | API requests |
| **Estado Global** | Zustand | 4.x | State management |
| **Server State** | TanStack Query | 5.x | Data fetching & caching |
| **WebSockets** | Socket.io Client | 4.x | Real-time updates |
| **Drag & Drop** | dnd-kit | 6.x | Drag and drop |
| **Charts** | Recharts | 2.x | Data visualization |
| **Testing** | Vitest + Testing Library | - | Unit & integration tests |
| **E2E Testing** | Playwright | 1.x | End-to-end tests |

---

## Arquitectura de Componentes

### Jerarquía de Componentes

```
ui/                    # Componentes base (atoms)
  Button
  Input
  Card
  Badge

layout/                # Componentes de estructura (molecules)
  Header
  Footer
  Sidebar

features/              # Componentes de características (organisms)
  ProductCard
  OrderCard
  CartSummary

modules/               # Páginas y flujos completos (templates/pages)
  catalog/
  orders/
  auth/
```

### Ejemplo de Componente Base

```typescript
// components/ui/Button/Button.tsx
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

### Ejemplo de Feature Component

```typescript
// components/features/ProductCard/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/currency';
import { Product } from '@/types/models.types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart, onToggleFavorite }: ProductCardProps) {
  const { id, name, price, images, stock, active } = product;

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/catalog/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={images[0] || '/placeholder.png'}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {!active && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              No disponible
            </Badge>
          )}
          {stock === 0 && active && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Agotado
            </Badge>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/catalog/${id}`}>
          <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(price)}
          </span>

          <div className="flex gap-2">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleFavorite(id)}
                aria-label="Agregar a favoritos"
              >
                <Heart className="h-5 w-5" />
              </Button>
            )}

            {onAddToCart && active && stock > 0 && (
              <Button
                size="icon"
                onClick={() => onAddToCart(id)}
                aria-label="Agregar al carrito"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {stock > 0 && stock < 10 && (
          <p className="mt-2 text-sm text-amber-600">
            Solo quedan {stock} unidades
          </p>
        )}
      </div>
    </Card>
  );
}
```

---

## Estado y Data Fetching

### TanStack Query para Server State

```typescript
// modules/catalog/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Product, QueryProductDto } from '@/types';

export function useProducts(query: QueryProductDto) {
  return useQuery({
    queryKey: ['products', query],
    queryFn: () => api.products.list(query),
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000, // 10 min (antes cacheTime)
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => api.products.getById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => api.products.create(data),
    onSuccess: () => {
      // Invalidar cache de listado
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

### Zustand para UI State

```typescript
// store/cart.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  quantity: number;
  variantId?: string;
  addons?: string[];
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

---

## Routing y Layouts

### App Router con Grupos

```typescript
// app/(client)/layout.tsx
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// app/(admin)/layout.tsx
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { requireAuth } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAuth(['OWNER', 'MANAGER']); // Server-side auth check

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

### Middleware para Auth

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Rutas admin requieren autenticación
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verificar rol
    const hasAdminRole = token.roles?.some((role: string) =>
      ['OWNER', 'MANAGER'].includes(role)
    );

    if (!hasAdminRole) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*'],
};
```

---

## PWA y Offline

### Manifest

```json
// public/manifest.json
{
  "name": "Sistema de Pedidos",
  "short_name": "Pedidos",
  "description": "Sistema integral de pedidos multirubro",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker (Workbox)

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.example\.com\/catalog/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'catalog-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 min
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
        },
      },
    },
  ],
});

module.exports = withPWA({
  // next config
});
```

---

## Ejemplos de Código

### Custom Hook con WebSocket

```typescript
// hooks/useOrderUpdates.ts
import { useEffect, useState } from 'react';
import { useSocketClient } from '@/lib/websocket/socket-client';
import { Order } from '@/types';

export function useOrderUpdates(orderId: string) {
  const socket = useSocketClient();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!socket || !orderId) return;

    // Subscribe to order updates
    socket.emit('subscribe', { orderId });

    socket.on('order:update', (data: Order) => {
      if (data.id === orderId) {
        setOrder(data);
      }
    });

    return () => {
      socket.emit('unsubscribe', { orderId });
      socket.off('order:update');
    };
  }, [socket, orderId]);

  return order;
}
```

### Form con React Hook Form + Zod

```typescript
// modules/catalog/components/ProductForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const productSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(100),
  sku: z.string().min(3).max(50),
  price: z.number().positive('Debe ser mayor a 0').max(999999.99),
  taxRate: z.number().min(0).max(1),
  stock: z.number().int().min(0),
  description: z.string().max(500).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

export function ProductForm({ initialData, onSubmit }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Nombre del producto
        </label>
        <Input
          id="name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Ej: Pizza Margherita"
        />
      </div>

      <div>
        <label htmlFor="sku" className="block text-sm font-medium">
          SKU
        </label>
        <Input
          id="sku"
          {...register('sku')}
          error={errors.sku?.message}
          placeholder="Ej: PIZZA-001"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium">
            Precio
          </label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            error={errors.price?.message}
            placeholder="12.99"
          />
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium">
            Stock
          </label>
          <Input
            id="stock"
            type="number"
            {...register('stock', { valueAsNumber: true })}
            error={errors.stock?.message}
            placeholder="50"
          />
        </div>
      </div>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        {initialData ? 'Actualizar' : 'Crear'} Producto
      </Button>
    </form>
  );
}
```

---

## Seguridad

### CSP Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://api.example.com wss://api.example.com;
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Sanitización de Inputs

```typescript
// lib/utils/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '');
}
```

---

## Testing

### Component Tests

```typescript
// components/ui/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveClass('disabled:opacity-50');
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');

    rerender(<Button variant="outline">Cancel</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');
  });
});
```

### E2E Tests con Playwright

```typescript
// e2e/catalog.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Catalog', () => {
  test('should display products', async ({ page }) => {
    await page.goto('/catalog');

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');

    // Check that products are visible
    const products = page.locator('[data-testid="product-card"]');
    await expect(products).toHaveCountGreaterThan(0);
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/catalog');

    // Click on a category filter
    await page.click('[data-testid="category-filter-pizzas"]');

    // Check URL updated
    await expect(page).toHaveURL(/categoryId=pizzas/);

    // Check filtered results
    const products = page.locator('[data-testid="product-card"]');
    await expect(products.first()).toBeVisible();
  });

  test('should search products', async ({ page }) => {
    await page.goto('/catalog');

    // Type in search box
    const searchInput = page.locator('[data-testid="product-search"]');
    await searchInput.fill('Margherita');

    // Wait for debounce
    await page.waitForTimeout(500);

    // Check results
    await expect(page.locator('text=Margherita')).toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    await page.goto('/catalog');

    // Click add to cart button
    await page.click('[data-testid="add-to-cart"]:first-of-type');

    // Check cart badge updated
    const cartBadge = page.locator('[data-testid="cart-count"]');
    await expect(cartBadge).toHaveText('1');
  });
});
```

---

## Changelog

### v1.1 - 2025-11-07 19:02
- Documentación expandida de frontend
- Estructura de carpetas detallada con App Router
- Ejemplos de componentes con TypeScript
- Estado con TanStack Query y Zustand
- PWA y Service Worker
- Seguridad (CSP, sanitización)
- Testing con Vitest y Playwright

### v1.0 - 2025-11-07
- Versión inicial
