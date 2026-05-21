import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const command = process.argv[2] ?? 'test';

const work = JSON.parse(execFileSync('go', ['work', 'edit', '-json'], { encoding: 'utf8' }));

for (const entry of work.Use ?? []) {
  const rel = entry.DiskPath;
  const dir = path.resolve(rel);

  if (!existsSync(path.join(dir, 'go.mod'))) {
    continue;
  }

  let packages = '';
  try {
    packages = execFileSync('go', ['list', './...'], {
      cwd: dir,
      encoding: 'utf8',
      stderr: 'pipe',
    }).trim();
  } catch (error) {
    const stderr = String(error.stderr ?? '');
    if (stderr.includes('matched no packages')) {
      console.log(`==> ${rel} (skipped: no Go packages)`);
      continue;
    }
    throw error;
  }

  if (!packages) {
    console.log(`==> ${rel} (skipped: no Go packages)`);
    continue;
  }

  if (command === 'test') {
    console.log(`==> ${rel}: go test -coverprofile=coverage.out ./...`);
    execFileSync('go', ['test', '-coverprofile=coverage.out', './...'], {
      cwd: dir,
      stdio: 'inherit',
    });
    continue;
  }

  throw new Error(`Unsupported go-work-run command: ${command}`);
}
