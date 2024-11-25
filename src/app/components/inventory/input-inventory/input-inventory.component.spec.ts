import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputInventoryComponent } from './input-inventory.component';

describe('InputInventoryComponent', () => {
  let component: InputInventoryComponent;
  let fixture: ComponentFixture<InputInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputInventoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InputInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
