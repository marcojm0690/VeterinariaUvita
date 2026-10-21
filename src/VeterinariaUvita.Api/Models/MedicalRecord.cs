namespace VeterinariaUvita.Api.Models;

public class MedicalRecord : BaseEntity
{
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string Diagnosis { get; set; } = string.Empty;
    public string? Treatment { get; set; }
    public string? Notes { get; set; }

    public int PetId { get; set; }
    public Pet? Pet { get; set; }
}
