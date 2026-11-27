import {expect, it} from 'vitest';
import {KIT_VERSION} from '../src/index';

it('loads the kit', () => expect(KIT_VERSION).toMatch(/^\d+\.\d+\.\d+$/));
