using System.ComponentModel.DataAnnotations;

namespace VeterinariaUvita.Api.Dtos;

public class PetRequest
{
    [Required, StringLength(100)] public string Name { get; set; } = string.Empty;
    [Required, StringLength(50)] public string Species { get; set; } = string.Empty;
    [StringLength(100)] public string? Breed { get; set; }
    public DateOnly? BirthDate { get; set; }
    [Range(0.01, 1000)] public decimal? WeightKg { get; set; }
    [Range(1, int.MaxValue)] public int OwnerId { get; set; }
}

public record PetResponse(
    int Id,
    string Name,
    string Species,
    string? Breed,
    DateOnly? BirthDate,
    decimal? WeightKg,
    int OwnerId,
    string? OwnerName);
