# Express + TypeScript starter

API reutilizable con Express 5, TypeScript estricto, Sequelize 6, MySQL 8+, Zod 4 y ESLint 10. Feature `products` completa con persistencia real y migraciones versionadas mediante Umzug.

## Inicio

Requiere Node 22.13+ de la rama 22 o Node 24+, npm y MySQL 8+. Crea primero la base y un usuario local desde una sesión administrativa de MySQL (cambia la contraseña):

```sql
CREATE DATABASE express_starter CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'starter'@'localhost' IDENTIFIED BY 'change_me';
GRANT ALL PRIVILEGES ON express_starter.* TO 'starter'@'localhost';
```

Desde esta carpeta:

```sh
npm install
node -e "require('node:fs').copyFileSync('.env.example', '.env')"
# Edita .env con tus credenciales MySQL antes de continuar
npm run db:migrate
npm run dev
```

API: http://127.0.0.1:3000/api/products · Salud: http://127.0.0.1:3000/health

Configura `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD` en `.env`. No sobrescribas un `.env` existente al actualizar. `PORT`, `HOST` y `NODE_ENV` configuran HTTP. En contenedores usa `HOST=0.0.0.0`. El servidor autentica la conexión antes de escuchar y cierra el pool al apagarse. La base debe existir; las migraciones crean sus tablas. No se usa `sync({ alter: true })` ni se ejecutan migraciones automáticamente al arrancar.

```sh
npm run check       # tipos + lint + pruebas HTTP/MySQL + compilación
npm test
npm run lint:fix
npm run build
npm run db:migrate:prod  # migraciones compiladas para despliegue
npm start           # ejecuta dist/server.js tras build
```

El lock está incluido; usa `npm ci` en CI para una instalación exacta. `npm run dev` reinicia automáticamente al editar código.

## Arquitectura

```text
src/
  app.ts                         configura Express sin escuchar un puerto
  server.ts                      arranque y cierre por señales
  config/env.ts                  entorno y defaults
  config/database.ts             conexión Sequelize MySQL y pool
  database/migrator.ts            registro de migraciones y SequelizeMeta
  database/migrate.ts             CLI up/down/status
  database/migrations/001-create-products.ts
  shared/errors/app-error.ts     errores esperados
  shared/middleware/
    validate.ts                  valida body/query/params con Zod
    error-handler.ts             respuesta JSON centralizada
  features/products/
    product.routes.ts            rutas e instanciación de dependencias
    product.controller.ts        HTTP y datos ya validados
    product.schema.ts            reglas y tipos inferidos
    product.service.ts           casos de uso y errores de negocio
    product.repository.ts        consultas y transacciones Sequelize
    product.model.ts             modelo Sequelize y tipos Product
 tests/products.test.ts          pruebas HTTP con Supertest
 examples/products.http          peticiones editables
```

Flujo: ruta → validación → Controller → Service → Repository → Product.
El middleware coloca los datos transformados en `res.locals.validated`: en Express 5 `req.query` es de solo lectura. Los controladores async propagan sus errores a Express 5, sin wrappers extra. `createApp(database)` recibe una conexión Sequelize. Los modelos se asocian a esa conexión y los datos se comparten entre procesos que usan la misma base.

**Persistencia:** MySQL conserva los productos entre reinicios. El modelo Sequelize usa UUID, timestamps UTC, enteros para precios y stock, y texto utf8mb4. El Repository concentra las consultas; PATCH usa una transacción con bloqueo de fila para actualizar de forma coherente. No cambió el contrato HTTP.

## Migraciones

```sh
npm run db:status
npm run db:migrate
npm run db:rollback   # revierte la última migración; la inicial elimina products y sus datos
```

Umzug registra las migraciones aplicadas en `SequelizeMeta`. Agrega una migración TS con `up`/`down` y regístrala en `src/database/migrator.ts`. No edites migraciones ya desplegadas. En producción aplica las migraciones una sola vez desde el proceso de despliegue, antes de iniciar las réplicas. MySQL no revierte automáticamente todo el DDL ante un error; respalda tus datos antes de cambios destructivos.

## Pruebas con MySQL real

`npm test` crea una base temporal con nombre aleatorio `starter_test_<uuid>`, aplica migraciones, ejecuta el CRUD y elimina únicamente esa base al terminar. Nunca limpia `DB_NAME`. Requiere una instancia **local/de pruebas** y un usuario con permisos para crear/eliminar bases de prueba; el usuario de aplicación del ejemplo anterior solo tiene permisos sobre `express_starter`, por lo que para las pruebas debes proporcionar otra cuenta. No uses credenciales de producción.

Puedes sobreescribir las variables DB_USER/DB_PASSWORD/DB_PORT en la terminal para las pruebas; dotenv respeta las variables ya definidas. Las pruebas verifican validación, CRUD, paginación, persistencia desde otra conexión y rollback/reaplicación de migraciones. Si se interrumpe el proceso abruptamente puede quedar una base temporal que puedes eliminar identificándola por su prefijo.

Las comprobaciones sin servidor MySQL son `npm run typecheck`, `npm run lint` y `npm run build`.

## Contrato de products

| Campo | Regla |
|---|---|
| id | UUID generado por el servidor |
| name | string de 1–120 caracteres, se recortan espacios |
| description | string de hasta 2000 caracteres o null; default null |
| price_cents | entero de 0 a 2147483647, obligatorio al crear |
| stock | entero de 0 a 2147483647; default 0 |
| created_at / updated_at | timestamps ISO generados por servidor |

Precios en centavos: `2599` representa `25.99` en la moneda que definas. En JSON los números deben ser números, no strings. Los campos desconocidos se rechazan. PATCH exige al menos un campo y conserva los demás; `description: null` elimina la descripción.

| Método | Ruta | Resultado |
|---|---|---|
| GET | /api/products?page=1&per_page=20 | 200, listado con data y meta |
| GET | /api/products/:id | 200, data |
| POST | /api/products | 201, data y Location |
| PATCH | /api/products/:id | 200, data |
| DELETE | /api/products/:id | 204, sin cuerpo |

`page` inicia en 1; `per_page` permite 1–100, default 20. El orden es por fecha de creación e ID para desempatar. Un listado vacío devuelve `data: []`. La actualización es parcial con PATCH; PUT no se implementa.

```json
{"data":[],"meta":{"page":1,"per_page":20,"total":0,"last_page":1}}
```

## Ejemplos

En bash/macOS/Linux (en Windows usa `examples/products.http` o `curl.exe` con el escapado propio de tu terminal):

```sh
curl 'http://127.0.0.1:3000/api/products?page=1&per_page=10'
curl -i -X POST http://127.0.0.1:3000/api/products -H 'Content-Type: application/json' -d '{"name":"Teclado","price_cents":2599,"stock":3}'
# Sustituye UUID por el id devuelto por POST:
curl http://127.0.0.1:3000/api/products/UUID
curl -X PATCH http://127.0.0.1:3000/api/products/UUID -H 'Content-Type: application/json' -d '{"stock":0}'
curl -i -X DELETE http://127.0.0.1:3000/api/products/UUID
```

Errores usan `{"error":{"code":"NOT_FOUND","message":"Product not found"}}`.
Validación: 422 `VALIDATION_ERROR`, con `details: [{source,path,message}]`. ID mal formado: 422; ID válido inexistente: 404. JSON o URL mal formados: 400; cuerpo mayor a 100 KB: 413; codificación no soportada: 415. Fallos inesperados: 500 genérico, detalle solo en logs.

## Duplicar una feature

1. Copia `src/features/products` a `src/features/categories`.
2. Renombra archivos y símbolos `Product/product/products` a `Category/category/categories`, incluidos imports y el Location del controlador.
3. Cambia los atributos del modelo Sequelize y los schemas Zod de creación, actualización, params y listado. Crea y registra una migración para la tabla nueva.
4. Ajusta el Repository a los campos nuevos y agrega reglas de negocio al Service.
5. Mantén el Controller limitado a HTTP; usa siempre los valores de `res.locals.validated`.
6. Crea las dependencias en el router y móntalo en `app.ts`: `app.use('/api/categories', categoryRouter(database))`.
7. Copia las pruebas y ejemplos, adapta payloads, aplica `npm run db:migrate` y verifica `npm run check` contra MySQL de pruebas.

## Usar como repositorio nuevo

Copia o descomprime la carpeta, cambia `name` en `package.json`, ejecuta `npm install` para actualizar el lock y `git init`. No se incluye historial Git ni remote. Conserva `.env` fuera de Git.

Los endpoints de ejemplo son públicos. Agrega autenticación/autorización y la política CORS de tu aplicación antes de exponer datos reales. Helmet está incluido; CORS no está abierto globalmente.

Referencias: [Express 5](https://expressjs.com/en/guide/migrating-5/) · [Zod](https://zod.dev/) · [Sequelize](https://sequelize.org/docs/v6/) · [Migraciones](https://sequelize.org/docs/v6/other-topics/migrations/).
