using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeterinariaUvita.Api.Data;
using VeterinariaUvita.Api.Dtos;
using VeterinariaUvita.Api.Models;

namespace VeterinariaUvita.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PetsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PetResponse>>> GetAll(CancellationToken ct) =>
        await db.Pets.AsNoTracking()
            .Include(p => p.Owner)
            .OrderBy(p => p.Name)
            .Select(p => ToResponse(p))
            .ToListAsync(ct);

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PetResponse>> GetById(int id, CancellationToken ct)
    {
        var pet = await db.Pets.AsNoTracking().Include(p => p.Owner).FirstOrDefaultAsync(p => p.Id == id, ct);
        return pet is null ? NotFound() : ToResponse(pet);
    }

    [HttpGet("{id:int}/medical-records")]
    public async Task<ActionResult<IEnumerable<MedicalRecordResponse>>> GetMedicalRecords(int id, CancellationToken ct)
    {
        if (!await db.Pets.AnyAsync(p => p.Id == id, ct)) return NotFound();

        return await db.MedicalRecords.AsNoTracking()
            .Where(m => m.PetId == id)
            .OrderByDescending(m => m.Date)
            .Select(m => MedicalRecordsController.ToResponse(m))
            .ToListAsync(ct);
    }

    [HttpPost]
    public async Task<ActionResult<PetResponse>> Create(PetRequest request, CancellationToken ct)
    {
        if (!await db.Owners.AnyAsync(o => o.Id == request.OwnerId, ct))
            return BadRequest($"Owner {request.OwnerId} does not exist.");

        var pet = new Pet();
        Apply(pet, request);
        db.Pets.Add(pet);
        await db.SaveChangesAsync(ct);
        await db.Entry(pet).Reference(p => p.Owner).LoadAsync(ct);
        return CreatedAtAction(nameof(GetById), new { id = pet.Id }, ToResponse(pet));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, PetRequest request, CancellationToken ct)
    {
        var pet = await db.Pets.FindAsync([id], ct);
        if (pet is null) return NotFound();

        if (!await db.Owners.AnyAsync(o => o.Id == request.OwnerId, ct))
            return BadRequest($"Owner {request.OwnerId} does not exist.");

        Apply(pet, request);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var pet = await db.Pets.FindAsync([id], ct);
        if (pet is null) return NotFound();

        db.Pets.Remove(pet);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static void Apply(Pet pet, PetRequest r)
    {
        pet.Name = r.Name;
        pet.Species = r.Species;
        pet.Breed = r.Breed;
        pet.BirthDate = r.BirthDate;
        pet.WeightKg = r.WeightKg;
        pet.OwnerId = r.OwnerId;
    }

    internal static PetResponse ToResponse(Pet p) =>
        new(p.Id, p.Name, p.Species, p.Breed, p.BirthDate, p.WeightKg, p.OwnerId,
            p.Owner is null ? null : $"{p.Owner.FirstName} {p.Owner.LastName}");
}
