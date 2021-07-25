import { TestBed } from '@angular/core/testing';
import { DatacenterContextService } from './datacenter-context.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProvider } from 'src/test/mock-providers';
import { V1DatacentersService } from 'client';
import { MessageService } from './message.service';
import { AuthService } from './auth.service';

describe('DatacenterContextService', () => {
  let service: DatacenterContextService;

  beforeEach(() => {
    const authService = {
      currentUserValue: {},
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        DatacenterContextService,
        MockProvider(V1DatacentersService),
        MessageService,
        { provide: AuthService, useValue: authService },
      ],
    });
    service = TestBed.inject(DatacenterContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
