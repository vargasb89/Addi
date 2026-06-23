# ADDI SMB GTM MVP

MVP para planear la adquisicion de comercios SMB: selecciona territorio, detecta comercios, genera una ruta diaria y actualiza el estado del lead.

## Funcionalidades

- Seleccion de ciudad, categoria comercial y radio de busqueda.
- Escaneo de comercios con Google Places API si existe `GOOGLE_PLACES_API_KEY`.
- Modo demo automatico para presentar sin credenciales.
- Ruta sugerida por cercania y potencial comercial.
- Pipeline de estados: nuevo, en ruta, visitado, interesado, onboarding y perdido.
- Persistencia en Neon cuando existe `DATABASE_URL`.

## Ejecutar local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Configurar Neon

1. Crea un proyecto en Neon.
2. Ejecuta `db/schema.sql` en el SQL editor de Neon.
3. Copia `.env.example` a `.env.local`.
4. Pega el connection string en `DATABASE_URL`.

## Publicar en Vercel con cuenta personal

1. Crea un repositorio en tu GitHub personal, no en una organizacion de Rappi.
2. Antes del primer commit, configura el correo personal para este repo:

```bash
git config user.name "Tu Nombre"
git config user.email "tu-correo-personal@example.com"
```

3. Sube este proyecto a ese repositorio personal.
4. Entra a Vercel con tu cuenta personal, no con la cuenta de Rappi.
5. Importa el repositorio desde tu GitHub personal.
6. Crea el proyecto de Neon con tu correo/cuenta personal.
7. Agrega las variables `DATABASE_URL` y `GOOGLE_PLACES_API_KEY` en el proyecto personal de Vercel.
8. Despliega.

## Pitch para la entrevista

Este MVP convierte el crecimiento SMB en un sistema operativo de campo: prioriza territorios, cuantifica el universo de comercios, ordena la jornada de hunters y deja trazabilidad del avance por estado. La siguiente iteracion seria incorporar asignacion automatica por capacidad del equipo, performance por ciudad, playbooks por categoria y modelos de propension con datos historicos.
