import * as path from 'path';
import * as fs from 'fs-extra';
import { buildFixture } from '../utils/build';

const example = 'with-rax-kraken';

buildFixture(example, true);

describe('should build kbc1: ', () => {
  test('kbc1 content', async () => {
    const exist = fs.existsSync(path.join(process.cwd(), 'examples', example, 'build/kraken/home.kbc1'));

    expect(exist).toEqual(true);
  });
});
