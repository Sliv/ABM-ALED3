import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprarProductosComponent } from './comprar-productos.component';

describe('ComprarProductosComponent', () => {
  let component: ComprarProductosComponent;
  let fixture: ComponentFixture<ComprarProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComprarProductosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComprarProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
