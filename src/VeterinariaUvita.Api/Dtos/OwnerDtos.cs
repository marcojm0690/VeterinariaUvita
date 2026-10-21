using System.ComponentModel.DataAnnotations;

namespace VeterinariaUvita.Api.Dtos;

public class OwnerRequest
{
    [Required, StringLength(100)] public string FirstName { get; set; } = string.Empty;
    [Required, StringLength(100)] public string LastName { get; set; } = string.Empty;
    [Required, EmailAddress, StringLength(200)] public string Email { get; set; } = string.Empty;
    [Required, Phone, StringLength(30)] public string Phone { get; set; } = string.Empty;
    [StringLength(300)] public string? Address { get; set; }
}

public record OwnerResponse(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string? Address);
