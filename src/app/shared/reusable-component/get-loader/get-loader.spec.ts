import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetLoader } from './get-loader';

describe('GetLoader', () => {
  let component: GetLoader;
  let fixture: ComponentFixture<GetLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetLoader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetLoader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
