# VeterinariaUvita

Proyecto de la UH — sistema de gestión para una clínica veterinaria.

| Capa | Tecnología |
| --- | --- |
| API | .NET 10, ASP.NET Core Web API (controllers), EF Core 10 (**code first**) + SQLite |
| UI | Angular 21 + Angular Material |

## Estructura

```
src/VeterinariaUvita.Api/   API REST
  Models/                   Entidades (Owner, Pet, Veterinarian, Appointment, MedicalRecord)
  Data/                     AppDbContext, DbSeeder y Migrations
  Dtos/                     Requests / responses de la API
  Controllers/              CRUD por entidad
client/                     Aplicación Angular
  src/app/core/             Modelos, servicios HTTP e interceptor de errores
  src/app/layout/           Shell (toolbar + menú lateral)
  src/app/features/         Páginas por módulo (owners, pets, veterinarians, appointments)
```

## Ejecutar

API (http://localhost:5231, documentación en `/scalar/v1`):

```bash
dotnet run --project src/VeterinariaUvita.Api
```

En `Development` la API aplica las migraciones y carga datos de ejemplo al iniciar (`veterinaria.db`).

UI (http://localhost:4200):

```bash
cd client
npm install
npm start
```

## Migraciones (code first)

```bash
dotnet tool install --global dotnet-ef   # una sola vez
dotnet ef migrations add <Nombre> --project src/VeterinariaUvita.Api -o Data/Migrations
dotnet ef database update --project src/VeterinariaUvita.Api
```

Para usar SQL Server en lugar de SQLite: cambiar el paquete a `Microsoft.EntityFrameworkCore.SqlServer`,
`UseSqlite` por `UseSqlServer` en `Program.cs`, la cadena `ConnectionStrings:Default` y regenerar la migración inicial.
