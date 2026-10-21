namespace VeterinariaUvita.Api.Models;

public class Owner : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Address { get; set; }

    public ICollection<Pet> Pets { get; set; } = new List<Pet>();
}
