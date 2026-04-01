import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockHistory } from './stock-history';

describe('StockHistory', () => {
  let component: StockHistory;
  let fixture: ComponentFixture<StockHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(StockHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
