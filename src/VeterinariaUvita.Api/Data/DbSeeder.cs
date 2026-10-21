using Microsoft.EntityFrameworkCore;
using VeterinariaUvita.Api.Models;

namespace VeterinariaUvita.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Owners.AnyAsync()) return;

        var owner = new Owner
        {
            FirstName = "Ana",
            LastName = "Mora",
            Email = "ana.mora@example.com",
            Phone = "+506 8888-0000",
            Address = "Uvita, Puntarenas"
        };
        owner.Pets.Add(new Pet { Name = "Luna", Species = "Dog", Breed = "Labrador", WeightKg = 24.5m });

        var vet = new Veterinarian
        {
            FirstName = "Carlos",
            LastName = "Rojas",
            LicenseNumber = "MV-0001",
            Specialty = "General practice",
            Email = "carlos.rojas@example.com"
        };

        db.Owners.Add(owner);
        db.Veterinarians.Add(vet);
        await db.SaveChangesAsync();
    }
}
