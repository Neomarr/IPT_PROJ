import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutServicesPage } from './about-services.page';

describe('AboutServicesPage', () => {
  let component: AboutServicesPage;
  let fixture: ComponentFixture<AboutServicesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutServicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
