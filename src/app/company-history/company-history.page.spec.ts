import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyHistoryPage } from './company-history.page';

describe('CompanyHistoryPage', () => {
  let component: CompanyHistoryPage;
  let fixture: ComponentFixture<CompanyHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
