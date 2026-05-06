import { cp, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const extensionDir = dirname(fileURLToPath(import.meta.url));
const rootDir = dirname(extensionDir);
const outputDir = join(rootDir, 'dist-extension');

await mkdir(join(outputDir, 'icons'), { recursive: true });
await cp(join(extensionDir, 'manifest.json'), join(outputDir, 'manifest.json'));
await cp(join(extensionDir, 'icons'), join(outputDir, 'icons'), { recursive: true });
