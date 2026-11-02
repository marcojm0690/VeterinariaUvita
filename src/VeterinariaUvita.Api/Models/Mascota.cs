using System.ComponentModel.DataAnnotations;

namespace Veterinaria.API.Models
{
    public class Mascota
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "La especie es obligatoria.")]
        [StringLength(50)]
        public string Especie { get; set; } = string.Empty;

        [StringLength(80)]
        public string Raza { get; set; }
        [Required(ErrorMessage = "La fecha de nacimiento es obligatoria.")]
        public DateOnly FechaNacimiento { get; set; }

        [StringLength(300)]
        public string? Observaciones { get; set; }

        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    }
}
