using System.ComponentModel.DataAnnotations;
using VeterinariaUvita.Api.Models;

namespace VeterinariaUvita.Api.Dtos;

public class AppointmentRequest
{
    [Required] public DateTime ScheduledAt { get; set; }
    [Required, StringLength(500)] public string Reason { get; set; } = string.Empty;
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
    [Range(1, int.MaxValue)] public int PetId { get; set; }
    [Range(1, int.MaxValue)] public int VeterinarianId { get; set; }
}

public record AppointmentResponse(
    int Id,
    DateTime ScheduledAt,
    string Reason,
    AppointmentStatus Status,
    int PetId,
    string? PetName,
    int VeterinarianId,
    string? VeterinarianName);
