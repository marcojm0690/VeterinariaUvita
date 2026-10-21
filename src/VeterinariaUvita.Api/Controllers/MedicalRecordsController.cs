using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeterinariaUvita.Api.Data;
using VeterinariaUvita.Api.Dtos;
using VeterinariaUvita.Api.Models;

namespace VeterinariaUvita.Api.Controllers;

[ApiController]
[Route("api/medical-records")]
public class MedicalRecordsController(AppDbContext db) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<ActionResult<MedicalRecordResponse>> GetById(int id, CancellationToken ct)
    {
        var record = await db.MedicalRecords.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id, ct);
        return record is null ? NotFound() : ToResponse(record);
    }

    [HttpPost]
    public async Task<ActionResult<MedicalRecordResponse>> Create(MedicalRecordRequest request, CancellationToken ct)
    {
        if (!await db.Pets.AnyAsync(p => p.Id == request.PetId, ct))
            return BadRequest($"Pet {request.PetId} does not exist.");

        var record = new MedicalRecord();
        Apply(record, request);
        db.MedicalRecords.Add(record);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetById), new { id = record.Id }, ToResponse(record));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, MedicalRecordRequest request, CancellationToken ct)
    {
        var record = await db.MedicalRecords.FindAsync([id], ct);
        if (record is null) return NotFound();

        if (!await db.Pets.AnyAsync(p => p.Id == request.PetId, ct))
            return BadRequest($"Pet {request.PetId} does not exist.");

        Apply(record, request);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var record = await db.MedicalRecords.FindAsync([id], ct);
        if (record is null) return NotFound();

        db.MedicalRecords.Remove(record);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static void Apply(MedicalRecord m, MedicalRecordRequest r)
    {
        m.Date = r.Date;
        m.Diagnosis = r.Diagnosis;
        m.Treatment = r.Treatment;
        m.Notes = r.Notes;
        m.PetId = r.PetId;
    }

    internal static MedicalRecordResponse ToResponse(MedicalRecord m) =>
        new(m.Id, m.Date, m.Diagnosis, m.Treatment, m.Notes, m.PetId);
}
