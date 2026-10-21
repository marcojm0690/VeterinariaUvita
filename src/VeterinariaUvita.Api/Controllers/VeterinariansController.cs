using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeterinariaUvita.Api.Data;
using VeterinariaUvita.Api.Dtos;
using VeterinariaUvita.Api.Models;

namespace VeterinariaUvita.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VeterinariansController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VeterinarianResponse>>> GetAll(CancellationToken ct) =>
        await db.Veterinarians.AsNoTracking()
            .OrderBy(v => v.LastName).ThenBy(v => v.FirstName)
            .Select(v => ToResponse(v))
            .ToListAsync(ct);

    [HttpGet("{id:int}")]
    public async Task<ActionResult<VeterinarianResponse>> GetById(int id, CancellationToken ct)
    {
        var vet = await db.Veterinarians.AsNoTracking().FirstOrDefaultAsync(v => v.Id == id, ct);
        return vet is null ? NotFound() : ToResponse(vet);
    }

    [HttpPost]
    public async Task<ActionResult<VeterinarianResponse>> Create(VeterinarianRequest request, CancellationToken ct)
    {
        var vet = new Veterinarian();
        Apply(vet, request);
        db.Veterinarians.Add(vet);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetById), new { id = vet.Id }, ToResponse(vet));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, VeterinarianRequest request, CancellationToken ct)
    {
        var vet = await db.Veterinarians.FindAsync([id], ct);
        if (vet is null) return NotFound();

        Apply(vet, request);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var vet = await db.Veterinarians.FindAsync([id], ct);
        if (vet is null) return NotFound();

        if (await db.Appointments.AnyAsync(a => a.VeterinarianId == id, ct))
            return Conflict("Veterinarian has appointments and cannot be deleted.");

        db.Veterinarians.Remove(vet);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static void Apply(Veterinarian vet, VeterinarianRequest r)
    {
        vet.FirstName = r.FirstName;
        vet.LastName = r.LastName;
        vet.LicenseNumber = r.LicenseNumber;
        vet.Specialty = r.Specialty;
        vet.Email = r.Email;
    }

    internal static VeterinarianResponse ToResponse(Veterinarian v) =>
        new(v.Id, v.FirstName, v.LastName, v.LicenseNumber, v.Specialty, v.Email);
}
