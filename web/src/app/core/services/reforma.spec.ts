import { TestBed } from '@angular/core/testing';

import { Reforma } from './reforma';

describe('Reforma', () => {
  let service: Reforma;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Reforma);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
