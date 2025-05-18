# Projecto-Final-Negocio-Lab-3

## Sistema Web para la Gestión de Pedidos de Venta

Este proyecto es una aplicación web Full Stack desarrollada como proyecto final para la materia Laboratorio 3. Implementa un sistema para la gestión completa de Pedidos de Venta para un negocio. Permite registrar, visualizar, modificar y eliminar pedidos, así como gestionar información relacionada como clientes y productos.

El proyecto muestra la implementación de un backend robusto con Node.js y Express.js, utilizando TypeScript para un código más estructurado y mantenible, una base de datos relacional MySQL, y un frontend interactivo construido con HTML, CSS y JavaScript (también con TypeScript).

## Características Principales

* **Gestión Completa de Pedidos de Venta (CRUD):** Permite Crear, Leer, Actualizar y Eliminar pedidos de venta.
* **Gestión de Clientes:** Manejo de la información de los clientes asociados a los pedidos.
* **Gestión de Productos:** Manejo del catálogo de productos que se pueden incluir en los pedidos.
* **Detalle del Pedido:** Registro de los productos específicos incluidos en cada pedido de venta (detalle del pedido).
* **Búsqueda de Pedidos:** Funcionalidad para buscar pedidos por número o por rango de fechas.
* **Interfaz de Usuario:** Interfaz web para interactuar con el sistema de gestión de pedidos.

## Tecnologías Utilizadas

* **Backend:**
    * Node.js
    * Express.js
    * TypeScript
    * MySQL
* **Frontend:**
    * HTML
    * CSS
    * JavaScript
    * TypeScript
* **Gestor de Paquetes:** npm

## Estructura del Proyecto

El código está organizado en una estructura modular, facilitando la separación de responsabilidades:

* `src/controladores`: Contiene la lógica de los controladores para manejar las solicitudes HTTP (`CtrlCliente.ts`, `CtrlPedido.ts`, `CtrlDetallePedido.ts`, `CtrlProducto.ts`).
* `src/entidades`: Define las estructuras de datos principales del proyecto (`Cliente.ts`, `DetallePedido.ts`, `Pedido.ts`, `Producto.ts`).
* `src/rutas`: Define los endpoints de la API para interactuar con las diferentes entidades (`RutaClientes.ts`, `RutaPedidos.ts`, `RutaProductos.ts`).
* `src/servicios`: Contiene la lógica de negocio o servicios (ej: `ServicioPedido.ts`).
* `src/vistas`: Contiene los archivos del frontend (HTML, CSS, scripts TS del lado del cliente).
* `index.ts`: Punto de entrada principal del backend.
* `tsconfig.json`: Configuración del compilador de TypeScript.

## Prerrequisitos

Asegúrate de tener instalado en tu máquina:

* Node.js (incluye npm)
* MySQL Server
* Git

## Instalación

Sigue estos pasos para configurar y ejecutar el proyecto localmente:

1.  **Clonar el Repositorio:**
    ```bash
    git clone [https://github.com/FiammaB/Projecto-Final-Negocio-Lab-3.git](https://github.com/FiammaB/Projecto-Final-Negocio-Lab-3.git)
    cd Projecto-Final-Negocio-Lab-3
    ```

2.  **Instalar Dependencias:**
    * El proyecto utiliza npm para gestionar las dependencias tanto del backend como del frontend.
    ```bash
    npm install
    ```

3.  **Configuración de la Base de Datos MySQL:**
    * Crea una base de datos en tu servidor MySQL.   * Ejemplo:
        ```sql
        CREATE DATABASE db_pedidos_negocio;
        -- Si tienes un script SQL:
        -- USE db_pedidos_negocio;
        -- SOURCE path/to/your/database.sql;
        ```
    * **Configuración de Conexión:** Deberás configurar la conexión a tu base de datos MySQL.
4.  **Compilar TypeScript:**
    * El código fuente está en TypeScript y necesita ser compilado a JavaScript.
    ```bash
    npm run build
    ```
    (Este comando asume que tienes un script `build` definido en tu `package.json` que ejecuta el compilador de TypeScript `tsc`).

## Ejecución

Una vez completada la instalación y configuración:

1.  Inicia el servidor backend:
    ```bash
    npm start
    ```
    (Este comando asume que tienes un script `start` definido en tu `package.json`, usualmente `node dist/index.js` o similar).

2.  Accede a la aplicación:
    * Abre tu navegador web.
    * La aplicación frontend se sirve directamente desde el backend (generalmente archivos estáticos desde la carpeta `vistas` o `dist/vistas`). Accede a la URL donde tu servidor Node.js/Express está escuchando (usualmente `http://localhost:3000` u otro puerto configurado).
    * Ej: `http://localhost:[Puerto del Backend]`

## Uso

Una vez que la aplicación está corriendo, puedes empezar a interactuar con el sistema:

* Navega a la página principal de gestión de pedidos.
* Utiliza el formulario para crear nuevos pedidos, seleccionando clientes y productos.
* Visualiza la lista de pedidos existentes en la tabla.
* Utiliza las opciones de acciones en la tabla para [menciona qué acciones hay, ej: ver detalles, editar, eliminar].
* Prueba las funcionalidades de búsqueda por número de comprobante o rango de fechas.

## Contribuciones

Este proyecto es un trabajo práctico académico y no está abierto a contribuciones externas activas.

## Licencia

[Indica la licencia bajo la que se encuentra el código. Se recomienda la Licencia MIT].

## Autor

* **Fiamma Brizuela**


---




