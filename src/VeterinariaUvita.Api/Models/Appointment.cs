namespace VeterinariaUvita.Api.Models;

public class Appointment : BaseEntity
{
    public DateTime ScheduledAt { get; set; }
    public string Reason { get; set; } = string.Empty;
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;

    public int PetId { get; set; }
    public Pet? Pet { get; set; }

    public int VeterinarianId { get; set; }
    public Veterinarian? Veterinarian { get; set; }
}
