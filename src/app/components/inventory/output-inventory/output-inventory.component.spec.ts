import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputInventoryComponent } from './output-inventory.component';

describe('OutputInventoryComponent', () => {
  let component: OutputInventoryComponent;
  let fixture: ComponentFixture<OutputInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutputInventoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OutputInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
