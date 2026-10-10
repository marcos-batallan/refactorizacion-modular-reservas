# Trabajo práctico 06

## Proyecto de partida y cambios

Este proyecto corresponde al **Trabajo práctico 06: Refactorización modular de reservas**, realizado a partir de una copia funcional del Trabajo práctico 05.

La aplicación permite consultar las reservas de salas de estudio, visualizar sus detalles y registrar nuevas reservas mediante un formulario web.

El objetivo del trabajo es reorganizar el código existente en módulos con responsabilidades específicas, conservando el comportamiento funcional de la aplicación original.

### Cambios realizados

- Separación del arranque del servidor y la configuración de Express.
- Creación de un módulo de configuración para leer y validar las variables de entorno.
- Separación de las rutas y los controladores.
- Incorporación de una capa de servicio para administrar las reservas en memoria.
- Modularización de los middleware de identificación, medición y validación.
- Conservación de las vistas EJS, el layout, los recursos estáticos y los datos iniciales.
- Configuración de Prettier y ESLint para mantener la calidad del código.
- Incorporación de scripts para ejecutar la aplicación y comprobar el formato y el análisis estático.

La refactorización conserva el uso de CommonJS y no incorpora una base de datos ni persistencia permanente.

## Instalación y ejecución

### Requisitos previos

- Node.js instalado.
- npm disponible en la terminal.

### Instalación

Clonar el repositorio o descargar el proyecto y abrir una terminal en la carpeta raíz.

Instalar las dependencias:

```bash
npm install
```

### Iniciar la aplicación

```bash
npm start
```

Por defecto, el servidor se inicia en:

```text
http://localhost:3000
```

### Comprobar el código

Ejecutar el formateador:

```bash
npm run format
```

Verificar el formato:

```bash
npm run format:check
```

Ejecutar ESLint:

```bash
npm run lint
```

Ejecutar ambas comprobaciones:

```bash
npm run check
```

El comando `npm run check` ejecuta primero la verificación de formato con Prettier y después el análisis estático con ESLint.

## Configuración del entorno

La configuración se centraliza en `src/configuracion.js`.

La aplicación admite las siguientes variables de entorno:

| Variable | Descripción | Valor predeterminado |
|---|---|---|
| `PORT` | Puerto de escucha del servidor | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` |

El puerto debe ser un número entero comprendido entre `1` y `65535`. Si se proporciona un valor inválido, la aplicación interrumpe el arranque y muestra un mensaje explicativo.

El formato de registro de Morgan depende del entorno:

- `development`: formato `dev`.
- `production`: formato `combined`.

### Archivo de ejemplo

El proyecto incluye `.env.example` con esta configuración:

```dotenv
PORT=3000
NODE_ENV=development
```

Para trabajar con variables locales, se puede copiar este archivo y guardarlo como `.env`.

El archivo `.env` y la carpeta `node_modules/` están incluidos en `.gitignore` para evitar versionar la configuración local y las dependencias instaladas.

La aplicación puede iniciarse mediante `npm start` sin disponer de un archivo `.env`, utilizando los valores predeterminados.

Si se dispone de un archivo `.env` local, también se puede utilizar:

```bash
npm run start:local
```

Este último comando utiliza `node --env-file=.env` y requiere una versión de Node.js compatible con esa opción.

**Importante:** se debe publicar `.env.example`, pero no el archivo `.env`.

## Mapa de módulos y dependencias

La estructura principal del proyecto es la siguiente:

```text
refactorizacion-modular-reservas/
├── public/
│   ├── css/
│   │   └── estilos.css
│   └── img/
│       ├── salas-estudio.svg
│       └── favicon.svg
├── src/
│   ├── index.js
│   ├── app.js
│   ├── configuracion.js
│   ├── rutas/
│   │   └── reservas.js
│   ├── controladores/
│   │   └── reservas.js
│   ├── servicios/
│   │   └── reservas.js
│   └── middleware/
│       ├── solicitudes.js
│       └── reservas.js
├── views/
│   ├── layouts/
│   └── vistas de reservas y errores
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
├── package-lock.json
└── README.md
```

La estructura de `views/` conserva las vistas EJS originales del proyecto, incluido el layout y la vista de recurso no encontrado.

### Responsabilidades de los módulos

| Módulo | Responsabilidad |
|---|---|
| `src/index.js` | Crea los datos iniciales, obtiene la configuración, crea el servicio y la aplicación, e inicia el servidor. |
| `src/configuracion.js` | Lee y valida las variables de entorno. |
| `src/app.js` | Configura Express, las vistas, los middleware, las rutas y la respuesta final para URLs inexistentes. |
| `src/rutas/reservas.js` | Define los métodos HTTP, los caminos y los middleware y controladores asociados. |
| `src/controladores/reservas.js` | Gestiona las respuestas HTTP, renderiza vistas, devuelve JSON y realiza redirecciones. |
| `src/servicios/reservas.js` | Lista, busca, cuenta y crea reservas en memoria. |
| `src/middleware/solicitudes.js` | Identifica las solicitudes y mide su duración hasta el evento `finish`. |
| `src/middleware/reservas.js` | Prepara la sección correspondiente y valida los datos del formulario. |

El servicio de reservas se comparte entre el listado, el detalle, la creación y la ruta `/estado`, de modo que todas estas operaciones consultan y modifican los mismos datos en memoria.

La capa de servicio no se encarga de renderizar vistas ni de gestionar directamente los objetos `req` y `res`.

## Pipeline y contrato de rutas

### Pipeline de middleware

La aplicación conserva el flujo general de procesamiento definido en la consigna:

```text
Morgan
  ↓
identificarSolicitud
  ↓
medirDuracion
  ↓
express-ejs-layouts
  ↓
archivos estáticos
  ↓
express.urlencoded
  ↓
express.json
  ↓
rutas de aplicación
  ↓
router de reservas
  ↓
middleware final de 404
```

Este flujo permite registrar las solicitudes, asignar un identificador, medir la duración de su procesamiento y continuar con la configuración, las rutas y las respuestas correspondientes.

Los recursos estáticos se sirven desde `public/`. El parser `express.urlencoded` se ejecuta antes de la validación del formulario para que los datos enviados mediante POST estén disponibles para el middleware correspondiente.

### Contrato de rutas

| Método | Ruta | Respuesta esperada | Descripción |
|---|---|---|---|
| `GET` | `/` | `200` | Página de inicio. |
| `GET` | `/estado` | `200` | Devuelve JSON con el estado del servicio, la cantidad de reservas y el identificador de solicitud. |
| `GET` | `/reservas` | `200` | Muestra el listado de reservas. |
| `GET` | `/reservas/nueva` | `200` | Muestra el formulario de nueva reserva. |
| `GET` | `/reservas/:id` | `200` o `404` | Muestra el detalle de una reserva o la vista de recurso no encontrado. |
| `POST` | `/reservas` | `302` o `400` | Crea una reserva válida y redirige, o devuelve el formulario con errores de validación. |
| `GET` | `/css/estilos.css` | `200` | Entrega la hoja de estilos. |
| `GET` | URL inexistente | `404` | Muestra la respuesta de recurso no encontrado. |

La ruta `/reservas/nueva` se registra antes de `/reservas/:id` para evitar que el segmento `nueva` se interprete como un identificador.

### Validación del formulario

Se conservan los campos y las reglas de validación del proyecto de partida:

- Estudiante obligatorio.
- Email que contenga `@`.
- Sala perteneciente a las salas permitidas.
- Fecha obligatoria.
- Turno perteneciente a los turnos permitidos.
- Cantidad de personas expresada como entero entre `1` y `6`.

Cuando los datos son inválidos, el middleware responde con estado `400`, muestra los errores y conserva los valores ingresados. No debe continuar hacia el controlador ni crear una reserva.

Cuando los datos son válidos, el middleware prepara `req.reservaValidada` y continúa con el controlador. La respuesta es una redirección `302` hacia el listado, que posteriormente responde con `200`.

## Matriz antes/después

La siguiente matriz resume el contrato conservado del TP05 y las comprobaciones realizadas sobre la versión modular TP06.

| Caso | TP05: referencia | TP06: resultado verificado |
|---|---|---|
| Inicio `GET /` | Comportamiento de referencia conservado | `200` |
| Estado `GET /estado` | Endpoint de estado de referencia | `200`, JSON con identificador y cantidad de reservas |
| Listado `GET /reservas` | Listado original | `200` |
| Formulario `GET /reservas/nueva` | Formulario original | `200` |
| Detalle existente | Detalle original | `200` |
| Detalle inexistente | Recurso no encontrado | `404` |
| POST válido | Creación y redirección | `302` seguido de `GET 200` |
| POST inválido | Error sin creación | `400`, errores visibles y valores conservados |
| Sala no permitida | Validación del formulario | `400`, sin alta |
| Email sin `@` | Validación del formulario | `400`, sin alta |
| Personas `0`, `7` o fraccionarias | Validación del formulario | `400`, sin alta |
| CSS estático | Recurso disponible | `200` en carga inicial; también se observaron respuestas `304` por caché |
| URL inexistente | Recurso no encontrado | `404` |
| Reinicio del servidor | Datos iniciales en memoria | Vuelve a las cuatro reservas iniciales |
| Puerto alternativo | No formaba parte de la configuración original | Inicio en `3001` y rutas principales con `200` |
| Puerto inválido `70000` | No formaba parte de la configuración original | El servidor no inicia y muestra un error explícito |
| Inicio sin `.env` | No formaba parte de la configuración original | Inicio correcto en el puerto `3000` |

Las pruebas de TP06 se realizaron mediante navegación en el navegador, la pestaña Network de las herramientas de desarrollo y los registros de la terminal.

El resultado `304` observado para algunos recursos estáticos indica que el navegador puede reutilizar una versión almacenada en caché; no representa un error de la aplicación.

## Formato y análisis estático

El proyecto utiliza las siguientes herramientas de desarrollo:

- **Prettier:** mantiene un formato consistente en los archivos de `src`.
- **ESLint:** analiza estáticamente el código para detectar problemas de calidad.

Los scripts disponibles son:

| Comando | Función |
|---|---|
| `npm run format` | Aplica el formato de Prettier. |
| `npm run format:check` | Comprueba el formato sin modificar archivos. |
| `npm run lint` | Ejecuta ESLint sobre `src`. |
| `npm run check` | Ejecuta la comprobación de formato y luego ESLint. |

La comprobación final ejecutada con `npm run check` terminó correctamente: Prettier indicó que todos los archivos coinciden con el formato configurado y ESLint no reportó errores.

Estas comprobaciones estáticas complementan las pruebas HTTP manuales, pero no las reemplazan.

## Persistencia temporal y límites

Las reservas se almacenan en memoria mediante el servicio de reservas. El proyecto no utiliza una base de datos ni guarda los cambios de forma permanente.

La aplicación comienza con cuatro reservas iniciales. Las nuevas reservas se incorporan al arreglo compartido durante la ejecución actual.

Al reiniciar el servidor, los datos creados durante la sesión se pierden y la aplicación vuelve a cargar las cuatro reservas iniciales.

Esta limitación es intencional y responde a los requisitos del TP06: el objetivo es refactorizar la aplicación y separar sus responsabilidades, no incorporar persistencia ni nuevas funcionalidades.