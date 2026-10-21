using System.ComponentModel.DataAnnotations;

namespace VeterinariaUvita.Api.Dtos;

public class MedicalRecordRequest
{
    public DateTime Date { get; set; } = DateTime.UtcNow;
    [Required, StringLength(500)] public string Diagnosis { get; set; } = string.Empty;
    [StringLength(1000)] public string? Treatment { get; set; }
    [StringLength(2000)] public string? Notes { get; set; }
    [Range(1, int.MaxValue)] public int PetId { get; set; }
}

public record MedicalRecordResponse(
    int Id,
    DateTime Date,
    string Diagnosis,
    string? Treatment,
    string? Notes,
    int PetId);
