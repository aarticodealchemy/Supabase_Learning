import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationTestPageComponent } from './integration-test-page.component';

describe('IntegrationTestPageComponent', () => {
  let component: IntegrationTestPageComponent;
  let fixture: ComponentFixture<IntegrationTestPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntegrationTestPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntegrationTestPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
