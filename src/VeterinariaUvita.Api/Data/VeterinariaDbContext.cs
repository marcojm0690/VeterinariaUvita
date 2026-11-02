using Microsoft.EntityFrameworkCore;
using Veterinaria.API.Models;

namespace Veterinaria.API.Data
{
    public class VeterinariaDbContext : DbContext
    {
        public VeterinariaDbContext(
            DbContextOptions<VeterinariaDbContext> options ) 
            : base( options ) 
            { 
            }

        public DbSet<Mascota> Mascotas => Set<Mascota>();
    }
}
