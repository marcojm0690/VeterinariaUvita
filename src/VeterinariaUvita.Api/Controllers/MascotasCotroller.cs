using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Veterinaria.API.Data;
using Veterinaria.API.Models;

namespace Veterinaria.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MascotasController : ControllerBase
    {
        private readonly VeterinariaDbContext _context;

        public MascotasController(VeterinariaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Mascota>>>
            ObtenerMascotas()
        {
            var mascotas = await _context.Mascotas
                .AsNoTracking()
                .ToListAsync();

            return Ok(mascotas);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Mascota>>
            ObtenerMascota(int id)
        {
            var mascota = await _context.Mascotas
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);

            if (mascota == null)
            {
                return NotFound(new
                {
                    mensaje = "No se encontró la mascota."
                });
            }

            return Ok(mascota);
        }

        [HttpPost]
        public async Task<ActionResult<Mascota>>
            RegistrarMascota(Mascota mascota)
        { 
            if (mascota.FechaNacimiento >
                DateOnly.FromDateTime(DateTime.Today))
            {
                return BadRequest(new
                { 
                    mensaje =
                         "La fecha de nacimiento no puede ser futura."
                });
            }

            mascota.Id = 0;
            mascota.FechaRegistro = DateTime.UtcNow;

            _context.Mascotas.Add(mascota);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(ObtenerMascota),
                new { id = mascota.Id },
                mascota
            );
        }
    }
}
