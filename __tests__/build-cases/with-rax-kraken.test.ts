import * as path from 'path';
import * as fs from 'fs-extra';
import * as md5 from 'md5';
import { buildFixture } from '../utils/build';

const example = 'with-rax-kraken';

buildFixture(example, true);

describe('should build kbc1: ', () => {
  test('kbc1 content', async () => {
    const fileBuffer = fs.readFileSync(path.join(process.cwd(), 'examples', example, 'build/kraken/home.kbc1'));

    expect(md5(fileBuffer)).toEqual('ad6668d21bed3ef7d9980ad4e047c325');
  });
});
