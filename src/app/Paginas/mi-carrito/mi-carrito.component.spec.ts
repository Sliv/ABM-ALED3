import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiCarritoComponent } from './mi-carrito.component';

describe('MiCarritoComponent', () => {
  let component: MiCarritoComponent;
  let fixture: ComponentFixture<MiCarritoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiCarritoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiCarritoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
