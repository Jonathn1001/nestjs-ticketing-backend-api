import * as fs from 'fs';
import * as path from 'path';

export interface MergeFileResult {
  link: string;
  name: string;
}

export async function mergeChunkedFile(
  chunksDir: string,
  outputPath: string,
): Promise<MergeFileResult> {
  // Check if chunks directory exists
  if (!fs.existsSync(chunksDir)) {
    throw new Error(`Chunks directory not found: ${chunksDir}`);
  }

  // Read and sort chunk files by index
  const chunkFiles = fs.readdirSync(chunksDir).sort((a, b) => {
    const indexA = parseInt(a.match(/-(\d+)$/)?.[1] ?? '0');
    const indexB = parseInt(b.match(/-(\d+)$/)?.[1] ?? '0');
    return indexA - indexB;
  });

  if (chunkFiles.length === 0) {
    throw new Error('No chunk files found');
  }

  // Merge chunks sequentially
  for (let i = 0; i < chunkFiles.length; i++) {
    const chunkPath = path.join(chunksDir, chunkFiles[i]);
    console.log(`Merging chunk ${i + 1}/${chunkFiles.length} ->>>`, chunkPath);

    await new Promise<void>((resolve, reject) => {
      const readStream = fs.createReadStream(chunkPath);
      const writeStream = fs.createWriteStream(outputPath, {
        flags: i === 0 ? 'w' : 'a',
      });

      readStream.pipe(writeStream);
      writeStream.on('finish', () => resolve());
      writeStream.on('error', (err) => reject(err));
    });
  }

  // Clean up chunks directory
  fs.rmSync(chunksDir, { recursive: true, force: true });

  const fileName = path.basename(outputPath);
  return {
    link: outputPath,
    name: fileName,
  };
}
