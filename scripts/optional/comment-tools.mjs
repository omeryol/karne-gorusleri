import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commandMap = {
  analyze: 'analyze-template-quality.mjs',
  generate: 'generate-comment-candidates.mjs',
  apply: 'apply-comment-candidates.mjs',
  dedupe: 'deduplicate-short-comments.mjs',
};

function printUsage() {
  console.log('Kullanim: node scripts/optional/comment-tools.mjs <analyze|generate|apply|dedupe> [args]');
}

const [subcommand, ...forwardArgs] = process.argv.slice(2);

if (!subcommand || !Object.prototype.hasOwnProperty.call(commandMap, subcommand)) {
  printUsage();
  process.exit(1);
}

const scriptFile = path.join(__dirname, commandMap[subcommand]);
const child = spawnSync(process.execPath, [scriptFile, ...forwardArgs], {
  stdio: 'inherit',
});

if (child.error) {
  console.error(`Alt komut calistirilamadi: ${child.error.message}`);
  process.exit(1);
}

process.exit(child.status ?? 1);
