# Taller

En esta sección aprenderemos cómo integrar Prisma en Express desarrollado en Typescript.

## Configuraciones iniciales

Primero creamos un directorio donde irá toda nuestra aplicación, luego de ello damos

```bash
npm init --yes
```

> El argumento `--yes` es para aceptar todas las opciones que nos ofrecen al crear una nueva aplicación, si nos interesa personalizar este aspecto eliminamos este parámetro

Luego de haber creado nuestro proyecto instalaremos `express` y `dotenv`.

```bash
npm install express dotenv
```

Luego creamos el archivo `index.js` y añadimos el siguiente código.

```js
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT;
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
```

## Iniciando Prisma

Para la instalación de Prisma, ejecutamos:

```bash
npm install prisma
npx prisma init --datasource-provider sqlite
npm install @prisma/client
```

Con esto instalamos, iniciamos y añadimos tanto prisma como prisma-client.

Por otro lado haremos uso de `sqlite`.

## Instalando Typescript

Comenzaremos la instalación de Typescript como una dependencia.

Para ello, ejecutamos:

```shell
npm install typescript ts-node @types/express @types/node
```

Con esto añadimos todos los tipos necesarios para nuestros módulos, una vez instalado podemos comprobar la correcta instalación dentro del `package.json`.

### Generando el tsconfig.json

Ahora que tenemos Typescript añadido a nuestro proyecto con algunas configuraciones por defecto, con el archivo `tsconfig.json` podemos modificar las opciones de nuestro compilador.

Para generarlo, ejecutamos:

```bash
npx tsc --init
```

Este archivo tendrá las siguientes configuraciones por defecto.

```text
target: es2016
module: commonjs
strict: true
esModuleInterop: true
skipLibCheck: true
forceConsistentCasingInFileNames: true
```

Dentro de este archivo modificaremos `outDir`, el cual por defecto se aloja en la ruta base. Pero, lo modificaremos por lo siguiente:

```json
{
  "compilerOptions": {
    "outDir": "./dist"

    // ...
  }
}
```

## Migrando proyecto

Ahora que tenemos todas las configuraciones realizadas, hacemos la migración de nuestro proyecto, `index.js` pasará a ser `index.ts` y este contendrá el siguiente código.

```ts
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`El servidor se ejecuta en http://localhost:${port}`);
});
```

Dentro del archivo `.env` creado, añadimos el puerto.

```text
DATABASE_URL="file:./dev.db"
PORT=8000
```

## Actualizaciones de archivos y creación de directorio

Ahora en cambio de solo usar nodemon haremos uso de `concurrently` en conjunto, para su instalación ejecutamos.

```bash
npm install -D concurrently
```

Después de instalar la dependencia modificaremos el `package.json`:

```json
{
  // ...
  "scripts": {
    "build": "npx tsc",
    "start": "node dist/index.js",
    "dev": "concurrently \"npx tsc --watch\" \"nodemon -q dist/index.js\""
  },

  // ...
}
```

Para ejecutar el servidor de desarrollo, ejecutamos:

```bash
npm run dev
```

Si todo está correcto, deberíamos obtener lo siguiente dentro de la consola.

![Server running](https://photos.silabuz.com/uploads/big/eddd33d494c6c89af220e427fdbdfde3.PNG)

Por lo que, si realizamos modificaciones dentro del archivo `index.ts` podremos ver las actualizaciones.

## Migrando base de datos

Una vez configurado todo el servidor, necesitamos finalizar la configuración de Prisma para su correcto funcionamiento.

Dentro del archivo `schema.prisma` añadimos el siguiente modelo.

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

Este esquema sigue esta relación:

![Relación](https://www.prisma.io/docs/static/e83a6a5933258930b5e6b7bc6f1bf839/e548f/one-to-many.png)

Una vez definido nuestro `schema` ejecutamos la migración.

> Recordar salir del servidor de desarrollo con `CTRL + C`

```bash
npx prisma migrate dev --name init
```

Al hacer uso de `sqlite`, nos generará la carpeta de migraciones, el archivo de `sqlite` y un `db-journal` (más información de [db-journal](https://abrirarchivos.info/extension/db-journal))

Ahora que tenemos la migración realizada necesitamos saber como realizar las queries a nuestra base de datos con el Prisma client.

## Realizando queries

Para realizar nuestras queries a la base de datos necesitamos un archivo de Typescript que ejecute todas las queries de nuestro Prisma Client.

Dentro de nuestro archivo `index.ts` añadimos el Prisma client, por lo que el archivo quedaría de la siguiente forma.

```ts
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

// Importando Prisma Client
import { PrismaClient } from '@prisma/client'

dotenv.config();

// Iniciando el cliente
const prisma = new PrismaClient()
const app: Express = express();
const port = process.env.PORT;
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`El servidor se ejecuta en http://localhost:${port}`);
});
```

Ahora que tenemos listo el cliente, podemos añadir rutas con queries para usar en nuestro servidor.

```ts
app.post("/author", async (req, res) => {
  const { name, email } = req.body;
  const user = await prisma.user.create({
    data: {
      name: name,
      email: email,
    },
  });
  res.json(user);
});

app.post("/post", async (req, res) => {
  const { title, content, author } = req.body;
  const result = await prisma.post.create({
    data: {
      title: title,
      content: content,
      author: { connect: { id: author } },
    },
  });
  res.json(result);
});
```

Dentro de la ruta `/post` vemos un atributo interesante al momento de definir la data:

```ts
app.post("/post", async (req, res) => {
  const { title, content, author } = req.body;
  const result = await prisma.post.create({
    data: {
      title: title,
      content: content,
      author: { connect: { id: author } },
    },
  });
  res.json(result);
});
```

En la parte de `author`, contamos con `connect` el cual nos permite definir a que autor pertenece el post que estamos creando, sin esto no funcionaría nuestra ruta.

Ejecutamos de nuevo el servidor y hacemos la prueba de nuestra ruta. Si envíamos los datos solicitados, obtendremos la siguiente respuesta.

![Autor](https://photos.silabuz.com/uploads/big/a422edead35cc40be05c86892327b267.PNG)

Ahora creamos un nuevo Post para nuestro autor.

![Post Create](https://photos.silabuz.com/uploads/big/dfe6e5122e4334996a439404a2d6839c.PNG)

¡Felicidades!, implementaste Prisma con Express y Typescript.

## Tarea

-   Crear los métodos faltantes tales como `GET`, `UPDATE`, `DELETE`, tanto para usuario como para post
    
    -   Recordar hacer uso de rutas dinámicas

Utilizar de referencia la documentación de Prisma: [CRUD reference](https://www.prisma.io/docs/concepts/components/prisma-client/crud)

Si no les funciona su código pueden utilizar el repositorio con el proyecto desarrollado en el taller.

[Repositorio Prisma, Express y TS](https://github.com/silabuzinc/Prisma-Express-TS)

Solo deben de crear el `.env`, el cual debe contener lo siguiente.

```text
DATABASE_URL="file:./dev.db"
PORT=8000
```

Para instalar todas las dependencias usar:

```bash
npm install
```

### Opcional

-   Crear ruta para crear usuario con posts incluidos
    
-   Crear ruta para crear múltiples post