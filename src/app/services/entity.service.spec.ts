import { TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of } from 'rxjs';
import { MockProvider } from 'src/test/mock-providers';
import SubscriptionUtil from '../utils/SubscriptionUtil';
import { DeleteEntityConfig, Entity, EntityService } from './entity.service';

describe('EntityService', () => {
  let service: EntityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntityService, MockProvider(NgxSmartModalService)],
    });

    service = TestBed.get(EntityService);

    jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((dto, ngx, confirmFn, closeFn) => {
      confirmFn();
      return of().subscribe();
    });
  });

  describe('deleteEntity', () => {
    it('should throw an error when deleting a provisioned entity', () => {
      const throwsError = () => {
        const entity: Entity = { provisionedAt: {}, name: 'Entity' };
        service.deleteEntity(entity, null);
      };

      expect(throwsError).toThrow('Cannot delete provisioned object');
    });

    it('should soft-delete an entity', () => {
      const softDelete$ = of();
      const softDeleteSpy = jest.spyOn(softDelete$, 'subscribe');
      const entity: Entity = { deletedAt: undefined, provisionedAt: undefined, name: 'Entity' };
      const config: DeleteEntityConfig = {
        softDelete$,
        entityName: 'Entity',
        delete$: of(),
        onSuccess: () => {},
      };

      service.deleteEntity(entity, config);

      expect(softDeleteSpy).toHaveBeenCalled();
    });

    it('should delete an entity', () => {
      const delete$ = of();
      const deleteSpy = jest.spyOn(delete$, 'subscribe');
      const entity: Entity = { deletedAt: {}, provisionedAt: undefined, name: 'Entity' };
      const config: DeleteEntityConfig = {
        delete$,
        entityName: 'Entity',
        softDelete$: of(),
        onSuccess: () => {},
      };

      service.deleteEntity(entity, config);

      expect(deleteSpy).toHaveBeenCalled();
    });
  });
});
