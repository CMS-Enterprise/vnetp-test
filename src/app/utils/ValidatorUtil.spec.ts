import { FormBuilder } from '@angular/forms';
import ValidatorUtil from './ValidatorUtil';

describe('ValidatorUtil', () => {
  const formBuilder = new FormBuilder();

  describe('optionallyRequired', () => {
    it('should require a form control when its empty', () => {
      const form = formBuilder.group({
        name: ['', [ValidatorUtil.optionallyRequired(() => true)]],
      });

      form.controls.name.setValue('');

      expect(form.get('name').errors.required).toBe(true);
    });

    it('should not require a form control when it is filled', () => {
      const form = formBuilder.group({
        name: ['', [ValidatorUtil.optionallyRequired(() => true)]],
      });

      form.controls.name.setValue('VALUE');

      form.updateValueAndValidity();

      expect(form.get('name').errors).toBeNull();
    });

    it('should not require a form control when it is optional', () => {
      const form = formBuilder.group({
        name: ['', [ValidatorUtil.optionallyRequired(() => false)]],
      });

      form.updateValueAndValidity();

      expect(form.get('name').errors).toBeNull();
    });
  });
});
