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
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OwnerResponse>>> GetAll(CancellationToken ct) =>
        await db.Owners.AsNoTracking()
            .OrderBy(o => o.LastName).ThenBy(o => o.FirstName)
            .Select(o => ToResponse(o))
            .ToListAsync(ct);

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OwnerResponse>> GetById(int id, CancellationToken ct)
    {
        var owner = await db.Owners.AsNoTracking().FirstOrDefaultAsync(o => o.Id == id, ct);
        return owner is null ? NotFound() : ToResponse(owner);
    }

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

    [HttpPost]
    public async Task<ActionResult<OwnerResponse>> Create(OwnerRequest request, CancellationToken ct)
    {
        var owner = new Owner();
        Apply(owner, request);
        db.Owners.Add(owner);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetById), new { id = owner.Id }, ToResponse(owner));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, OwnerRequest request, CancellationToken ct)
    {
        var owner = await db.Owners.FindAsync([id], ct);
        if (owner is null) return NotFound();

        Apply(owner, request);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var owner = await db.Owners.FindAsync([id], ct);
        if (owner is null) return NotFound();

        db.Owners.Remove(owner);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static void Apply(Owner owner, OwnerRequest r)
    {
        owner.FirstName = r.FirstName;
        owner.LastName = r.LastName;
        owner.Email = r.Email;
        owner.Phone = r.Phone;
        owner.Address = r.Address;
    }

    internal static OwnerResponse ToResponse(Owner o) =>
        new(o.Id, o.FirstName, o.LastName, o.Email, o.Phone, o.Address);
}
