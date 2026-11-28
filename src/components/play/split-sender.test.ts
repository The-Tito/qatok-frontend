import { describe, expect, it } from 'vitest';
import { splitSender } from './StepContext';

describe('splitSender', () => {
  it('separa nombre y dirección', () => {
    expect(splitSender('Mariana Torres <compras@distribuidora.com>')).toEqual({
      name: 'Mariana Torres',
      address: 'compras@distribuidora.com',
    });
  });

  it('sin <…> todo es el nombre', () => {
    expect(splitSender('Recursos Humanos')).toEqual({ name: 'Recursos Humanos' });
  });

  it('solo dirección: se usa como nombre', () => {
    expect(splitSender('<soporte@x.com>')).toEqual({ name: '<soporte@x.com>' });
  });
});
