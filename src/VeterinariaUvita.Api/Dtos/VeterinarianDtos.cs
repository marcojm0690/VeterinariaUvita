using System.ComponentModel.DataAnnotations;

namespace VeterinariaUvita.Api.Dtos;

public class VeterinarianRequest
{
    [Required, StringLength(100)] public string FirstName { get; set; } = string.Empty;
    [Required, StringLength(100)] public string LastName { get; set; } = string.Empty;
    [Required, StringLength(50)] public string LicenseNumber { get; set; } = string.Empty;
    [StringLength(100)] public string? Specialty { get; set; }
    [Required, EmailAddress, StringLength(200)] public string Email { get; set; } = string.Empty;
}

public record VeterinarianResponse(
    int Id,
    string FirstName,
    string LastName,
    string LicenseNumber,
    string? Specialty,
    string Email);
