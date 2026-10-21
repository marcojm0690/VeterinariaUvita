using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeterinariaUvita.Api.Data;
using VeterinariaUvita.Api.Dtos;
using VeterinariaUvita.Api.Models;

namespace VeterinariaUvita.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppointmentResponse>>> GetAll(
        [FromQuery] int? petId, [FromQuery] int? veterinarianId, CancellationToken ct)
    {
        var query = db.Appointments.AsNoTracking()
            .Include(a => a.Pet)
            .Include(a => a.Veterinarian)
            .AsQueryable();

        if (petId is not null) query = query.Where(a => a.PetId == petId);
        if (veterinarianId is not null) query = query.Where(a => a.VeterinarianId == veterinarianId);

        return await query.OrderBy(a => a.ScheduledAt).Select(a => ToResponse(a)).ToListAsync(ct);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AppointmentResponse>> GetById(int id, CancellationToken ct)
    {
        var appointment = await db.Appointments.AsNoTracking()
            .Include(a => a.Pet)
            .Include(a => a.Veterinarian)
            .FirstOrDefaultAsync(a => a.Id == id, ct);
        return appointment is null ? NotFound() : ToResponse(appointment);
    }

    [HttpPost]
    public async Task<ActionResult<AppointmentResponse>> Create(AppointmentRequest request, CancellationToken ct)
    {
        if (await ValidateReferencesAsync(request, ct) is { } error) return error;

        var appointment = new Appointment();
        Apply(appointment, request);
        db.Appointments.Add(appointment);
        await db.SaveChangesAsync(ct);
        await db.Entry(appointment).Reference(a => a.Pet).LoadAsync(ct);
        await db.Entry(appointment).Reference(a => a.Veterinarian).LoadAsync(ct);
        return CreatedAtAction(nameof(GetById), new { id = appointment.Id }, ToResponse(appointment));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, AppointmentRequest request, CancellationToken ct)
    {
        var appointment = await db.Appointments.FindAsync([id], ct);
        if (appointment is null) return NotFound();

        if (await ValidateReferencesAsync(request, ct) is { } error) return error;

        Apply(appointment, request);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var appointment = await db.Appointments.FindAsync([id], ct);
        if (appointment is null) return NotFound();

        db.Appointments.Remove(appointment);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private async Task<BadRequestObjectResult?> ValidateReferencesAsync(AppointmentRequest r, CancellationToken ct)
    {
        if (!await db.Pets.AnyAsync(p => p.Id == r.PetId, ct))
            return BadRequest($"Pet {r.PetId} does not exist.");
        if (!await db.Veterinarians.AnyAsync(v => v.Id == r.VeterinarianId, ct))
            return BadRequest($"Veterinarian {r.VeterinarianId} does not exist.");
        return null;
    }

    private static void Apply(Appointment a, AppointmentRequest r)
    {
        a.ScheduledAt = r.ScheduledAt;
        a.Reason = r.Reason;
        a.Status = r.Status;
        a.PetId = r.PetId;
        a.VeterinarianId = r.VeterinarianId;
    }

    internal static AppointmentResponse ToResponse(Appointment a) =>
        new(a.Id, a.ScheduledAt, a.Reason, a.Status, a.PetId, a.Pet?.Name,
            a.VeterinarianId, a.Veterinarian is null ? null : $"{a.Veterinarian.FirstName} {a.Veterinarian.LastName}");
}
