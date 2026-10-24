using Microsoft.EntityFrameworkCore;
using VeterinariaUvita.Api.Models;

namespace VeterinariaUvita.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Owner> Owners => Set<Owner>();
    public DbSet<Pet> Pets => Set<Pet>();
    public DbSet<Veterinarian> Veterinarians => Set<Veterinarian>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<MedicalRecord> MedicalRecords => Set<MedicalRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Owner>(e =>
        {
            e.Property(x => x.FirstName).HasMaxLength(100).IsRequired();
            e.Property(x => x.LastName).HasMaxLength(100).IsRequired();
            e.Property(x => x.Email).HasMaxLength(200).IsRequired();
            e.Property(x => x.Phone).HasMaxLength(30).IsRequired();
            e.Property(x => x.Address).HasMaxLength(300);
            e.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<Pet>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(100).IsRequired();
            e.Property(x => x.Species).HasMaxLength(50).IsRequired();
            e.Property(x => x.Breed).HasMaxLength(100);
            e.Property(x => x.WeightKg).HasPrecision(6, 2);
            e.HasOne(x => x.Owner)
                .WithMany(o => o.Pets)
                .HasForeignKey(x => x.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Veterinarian>(e =>
        {
            e.Property(x => x.FirstName).HasMaxLength(100).IsRequired();
            e.Property(x => x.LastName).HasMaxLength(100).IsRequired();
            e.Property(x => x.LicenseNumber).HasMaxLength(50).IsRequired();
            e.Property(x => x.Specialty).HasMaxLength(100);
            e.Property(x => x.Email).HasMaxLength(200).IsRequired();
            e.HasIndex(x => x.LicenseNumber).IsUnique();
        });

        modelBuilder.Entity<Appointment>(e =>
        {
            e.Property(x => x.Reason).HasMaxLength(500).IsRequired();
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.HasOne(x => x.Pet)
                .WithMany(p => p.Appointments)
                .HasForeignKey(x => x.PetId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Veterinarian)
                .WithMany(v => v.Appointments)
                .HasForeignKey(x => x.VeterinarianId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<MedicalRecord>(e =>
        {
            e.Property(x => x.Diagnosis).HasMaxLength(500).IsRequired();
            e.Property(x => x.Treatment).HasMaxLength(1000);
            e.Property(x => x.Notes).HasMaxLength(2000);
            e.HasOne(x => x.Pet)
                .WithMany(p => p.MedicalRecords)
                .HasForeignKey(x => x.PetId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>().Where(e => e.State == EntityState.Modified))
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
