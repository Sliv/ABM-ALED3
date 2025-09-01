import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteriaDeVentasComponent } from './reporteria-de-ventas.component';

describe('ReporteriaDeVentasComponent', () => {
  let component: ReporteriaDeVentasComponent;
  let fixture: ComponentFixture<ReporteriaDeVentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteriaDeVentasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteriaDeVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
