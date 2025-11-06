import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckornotComponent } from './checkornot.component';

describe('CheckornotComponent', () => {
  let component: CheckornotComponent;
  let fixture: ComponentFixture<CheckornotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckornotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckornotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
