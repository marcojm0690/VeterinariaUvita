using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeterinariaUvita.Api.Data;
using VeterinariaUvita.Api.Dtos;
using VeterinariaUvita.Api.Models;

namespace VeterinariaUvita.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OwnersController(AppDbContext db) : ControllerBase
{
    // ─── GET /api/owners ───────────────────────────────────────────────────────
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OwnerResponse>>> GetAll(CancellationToken ct) =>
        await db.Owners.AsNoTracking()
            .OrderBy(o => o.LastName).ThenBy(o => o.FirstName)
            .Select(o => ToResponse(o))
            .ToListAsync(ct);

    // ─── GET /api/owners/{id} ──────────────────────────────────────────────────
    [HttpGet("{id:int}")]
    public async Task<ActionResult<OwnerResponse>> GetById(int id, CancellationToken ct)
    {
        var owner = await db.Owners.AsNoTracking().FirstOrDefaultAsync(o => o.Id == id, ct);
        return owner is null ? NotFound() : ToResponse(owner);
    }

    // ─── GET /api/owners/{id}/pets ─────────────────────────────────────────────
    [HttpGet("{id:int}/pets")]
    public async Task<ActionResult<IEnumerable<PetResponse>>> GetPets(int id, CancellationToken ct)
    {
        if (!await db.Owners.AnyAsync(o => o.Id == id, ct)) return NotFound();

        return await db.Pets.AsNoTracking()
            .Include(p => p.Owner)
            .Where(p => p.OwnerId == id)
            .Select(p => PetsController.ToResponse(p))
            .ToListAsync(ct);
    }

    // ─── POST /api/owners ──────────────────────────────────────────────────────
    [HttpPost]
    public async Task<ActionResult<OwnerResponse>> Create(OwnerRequest request, CancellationToken ct)
    {
        var owner = new Owner();
        Apply(owner, request);
        db.Owners.Add(owner);

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
        {
            return Conflict(BuildDuplicateMessage(ex));
        }

        return CreatedAtAction(nameof(GetById), new { id = owner.Id }, ToResponse(owner));
    }

    // ─── PUT /api/owners/{id} ──────────────────────────────────────────────────
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, OwnerRequest request, CancellationToken ct)
    {
        var owner = await db.Owners.FindAsync([id], ct);
        if (owner is null) return NotFound();

        Apply(owner, request);

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
        {
            return Conflict(BuildDuplicateMessage(ex));
        }

        return NoContent();
    }

    // ─── DELETE /api/owners/{id} ───────────────────────────────────────────────
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var owner = await db.Owners.FindAsync([id], ct);
        if (owner is null) return NotFound();

        db.Owners.Remove(owner);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ─── Helpers privados ─────────────────────────────────────────────────────

    private static void Apply(Owner owner, OwnerRequest r)
    {
        owner.FirstName = r.FirstName;
        owner.LastName  = r.LastName;
        owner.Cedula    = r.Cedula;
        owner.Email     = r.Email;
        owner.Phone     = r.Phone;
        owner.Address   = r.Address;
    }

    internal static OwnerResponse ToResponse(Owner o) =>
        new(o.Id, o.FirstName, o.LastName, o.Cedula, o.Email, o.Phone, o.Address);

    /// <summary>Detecta violaciones de restricción UNIQUE de SQLite.</summary>
    private static bool IsUniqueConstraintViolation(DbUpdateException ex) =>
        ex.InnerException?.Message.Contains("UNIQUE", StringComparison.OrdinalIgnoreCase) == true;

    /// <summary>Devuelve un mensaje descriptivo según qué campo está duplicado.</summary>
    private static string BuildDuplicateMessage(DbUpdateException ex)
    {
        var msg = ex.InnerException?.Message ?? string.Empty;
        if (msg.Contains("IX_Owners_Email", StringComparison.OrdinalIgnoreCase))
            return "Ya existe un propietario registrado con ese correo electrónico.";
        if (msg.Contains("IX_Owners_Cedula", StringComparison.OrdinalIgnoreCase))
            return "Ya existe un propietario registrado con esa cédula.";
        return "Ya existe un propietario con esos datos únicos.";
    }
}
