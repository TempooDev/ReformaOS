import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReformaService } from './reforma';

describe('ReformaService', () => {
  let service: ReformaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReformaService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(ReformaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
