import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatIconModule, RouterLink],
  template: `
    <section class="hero">
      <div class="hero-text">
        <span class="eyebrow">Inicio</span>
        <h1>Bienvenido</h1>

<p class="hero-sub">
  Conectamos a propietarios de mascotas con servicios veterinarios
  de la Zona Sur de Costa Rica.
</p>
      </div>

      <img class="whale-tail" src="/whale-tail.svg" alt="" aria-hidden="true" />

      <svg class="hero-waves" viewBox="0 0 1440 100"
           preserveAspectRatio="none" aria-hidden="true">
        <path class="wave-1"
          d="M0 55 C 240 15, 480 15, 720 50 S 1200 85, 1440 45 L1440 100 L0 100 Z" />
        <path class="wave-2"
          d="M0 78 C 260 50, 520 50, 760 74 S 1220 98, 1440 70 L1440 100 L0 100 Z" />
      </svg>
    </section>

    <div class="section-label">Secciones</div>

    <div class="cards">
      @for (item of items; track item.path) {
        <a [routerLink]="item.path" class="card-link">
          <mat-card appearance="outlined">
            <mat-card-header>
              <mat-icon mat-card-avatar>{{ item.icon }}</mat-icon>
              <mat-card-title>{{ item.label }}</mat-card-title>
              <mat-icon class="go" aria-hidden="true">arrow_forward</mat-icon>
            </mat-card-header>
          </mat-card>
        </a>
      }
    </div>
  `,
  styles: `
    :host {
  --vet-sand-light: #f8f4ea;
  --vet-sand: #ecdfc4;
  --vet-line: #d9cdb2;
  --vet-sea-light: #1a8aa8;
  --vet-sea: #0e7490;
  --vet-sea-deep: #0b5d77;
  --vet-sea-ink: #0b4f63;
  --vet-sea-pale: #c5e0e8;
  --vet-ink: #1d3b47;
  --vet-muted: #44606b;
  --vet-palm: #3f7a4a;
  --vet-layout-padding: 24px;
  --vet-header-height: 64px;

  display: flex;
  flex-direction: column;
  margin: calc(var(--vet-layout-padding) * -1);
  height: calc(100dvh - var(--vet-header-height));
  overflow: hidden;

  --mat-sys-primary: var(--vet-sea);
  --mat-sys-on-surface: var(--vet-ink);
  --mat-sys-on-surface-variant: var(--vet-muted);
}

/* ---------- Hero ---------- */
.hero {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  min-height: 0;
  max-height: 340px;
  margin: 0 0 20px;
  padding: 24px 48px 90px;
  color: #ffffff;
  background: linear-gradient(
    170deg,
    var(--vet-sea-light) 0%,
    var(--vet-sea) 55%,
    var(--vet-sea-deep) 100%
  );
}

.hero-text {
  position: relative;
  z-index: 1;
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.eyebrow {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--vet-sand);
}

h1 {
  margin: 8px 0 0;
  font-family: Georgia, 'Iowan Old Style', 'Palatino Linotype', serif;
  font-size: clamp(1.9rem, 3.6vw, 2.6rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.2px;
}

.hero-sub {
  max-width: 380px;
  margin: 14px 0 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.92);
}

.whale-tail {
  position: absolute;
  z-index: 0;
  right: 0;
  bottom: 0;
  width: 60%;
  height: 100%;
  object-fit: contain;
  object-position: right bottom;
  pointer-events: none;
}

.hero-waves {
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 2;
  width: 100%;
  height: 56px;
  pointer-events: none;
}
.wave-1 {
  fill: rgba(255, 255, 255, 0.22);
}
.wave-2 {
  fill: var(--vet-sand-light);
}

/* ---------- Secciones ---------- */
.section-label {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 var(--vet-layout-padding) 12px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--vet-muted);
}
.section-label::before {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--vet-palm);
  opacity: 0.75;
  transform: rotate(45deg);
}
.section-label::after {
  content: '';
  flex: 1;
  border-top: 1.5px dotted var(--vet-line);
}

/* ---------- Tarjetas ---------- */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 0 var(--vet-layout-padding) var(--vet-layout-padding);
}

.card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.card-link mat-card {
  background: #fcfaf4;
  border: 1px solid var(--vet-line);
  border-bottom: 3px solid var(--vet-line);
  border-radius: 0;
  outline: 1.5px dashed var(--vet-line);
  outline-offset: -6px;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.card-link:hover mat-card,
.card-link:focus-visible mat-card {
  transform: translateY(-3px);
  border-bottom-color: var(--vet-sea);
  box-shadow: 0 14px 24px -18px rgba(11, 79, 99, 0.55);
}

.card-link:focus-visible {
  outline: none;
}
.card-link:focus-visible mat-card {
  box-shadow: 0 0 0 3px var(--vet-sea-pale);
}

mat-card-header {
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}

mat-icon[mat-card-avatar] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 44px;
  height: 44px;
  margin: 0;
  border-radius: 50%;
  font-size: 24px;
  color: var(--vet-sea-deep);
  background: var(--vet-sea-pale);
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}
.card-link:hover mat-icon[mat-card-avatar] {
  color: #ffffff;
  background: var(--vet-sea);
}

mat-card-title {
  font-family: Georgia, 'Iowan Old Style', 'Palatino Linotype', serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vet-sea-ink);
}

.go {
  width: 20px;
  height: 20px;
  margin-left: auto;
  font-size: 20px;
  color: var(--vet-sea);
  transition: transform 0.18s ease;
}
.card-link:hover .go {
  transform: translateX(4px);
}

/* ---------- Responsive ---------- */
@media (max-width: 860px) {
  :host {
    height: auto;
    overflow: visible;
  }
  .hero {
    max-height: none;
    padding: 28px 24px 80px;
  }
  .hero-text {
    width: 100%;
  }
  .whale-tail {
    width: 80%;
    opacity: 0.35;
  }
}
`,
})
export class Home {
  protected readonly items = [
    { path: '/owners', label: 'Dueños', icon: 'people' },
    { path: '/pets', label: 'Mascotas', icon: 'pets' },
    { path: '/veterinarians', label: 'Veterinarios', icon: 'medical_services' },
    { path: '/appointments', label: 'Citas', icon: 'event' },
  ];
}
