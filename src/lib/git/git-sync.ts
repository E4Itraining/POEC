import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export interface GitConfig {
  repository: string;
  branch: string;
  contentPath: string;
  editUrl: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  details?: {
    filesChanged?: string[];
    commitHash?: string;
    error?: string;
  };
}

export interface ContentFile {
  path: string;
  content: string;
  relativePath: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'content/courses');
const GIT_CONFIG_PATH = path.join(process.cwd(), 'content/config.json');

/**
 * Load Git configuration from config.json
 */
export async function getGitConfig(): Promise<GitConfig | null> {
  try {
    const configContent = await fs.readFile(GIT_CONFIG_PATH, 'utf-8');
    const config = JSON.parse(configContent);
    return config.git || null;
  } catch (error) {
    console.error('Failed to load git config:', error);
    return null;
  }
}

/**
 * Check if git is available and the repo is initialized
 */
export async function checkGitStatus(): Promise<{ initialized: boolean; remote: string | null; branch: string | null }> {
  try {
    const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: process.cwd() });
    const { stdout: remote } = await execAsync('git remote get-url origin', { cwd: process.cwd() }).catch(() => ({ stdout: '' }));

    return {
      initialized: true,
      branch: branch.trim(),
      remote: remote.trim() || null,
    };
  } catch {
    return {
      initialized: false,
      branch: null,
      remote: null,
    };
  }
}

/**
 * Get the GitHub edit URL for a specific file
 */
export function getEditUrl(slug: string, gitConfig: GitConfig): string {
  const filePath = slug ? `${slug}.mdx` : 'index.mdx';
  return `${gitConfig.editUrl}/${filePath}`;
}

/**
 * Get the GitHub view URL for a specific file
 */
export function getViewUrl(slug: string, gitConfig: GitConfig): string {
  const filePath = slug ? `${slug}.mdx` : 'index.mdx';
  return `https://github.com/${gitConfig.repository}/blob/${gitConfig.branch}/${gitConfig.contentPath}/${filePath}`;
}

/**
 * Pull latest content from remote repository
 */
export async function pullContent(): Promise<SyncResult> {
  try {
    const gitConfig = await getGitConfig();
    if (!gitConfig) {
      return { success: false, message: 'Git configuration not found' };
    }

    // Fetch latest changes
    await execAsync('git fetch origin', { cwd: process.cwd() });

    // Check for changes in content directory
    const { stdout: diffOutput } = await execAsync(
      `git diff --name-only origin/${gitConfig.branch} -- content/courses/`,
      { cwd: process.cwd() }
    ).catch(() => ({ stdout: '' }));

    const filesChanged = diffOutput.trim().split('\n').filter(Boolean);

    if (filesChanged.length === 0) {
      return { success: true, message: 'Content is already up to date', details: { filesChanged: [] } };
    }

    // Pull changes for content directory only
    await execAsync(`git checkout origin/${gitConfig.branch} -- content/courses/`, { cwd: process.cwd() });

    return {
      success: true,
      message: `Successfully pulled ${filesChanged.length} file(s)`,
      details: { filesChanged },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: 'Failed to pull content',
      details: { error: errorMessage },
    };
  }
}

/**
 * Push content changes to remote repository
 */
export async function pushContent(commitMessage: string): Promise<SyncResult> {
  try {
    const gitConfig = await getGitConfig();
    if (!gitConfig) {
      return { success: false, message: 'Git configuration not found' };
    }

    // Check for changes
    const { stdout: statusOutput } = await execAsync('git status --porcelain content/courses/', { cwd: process.cwd() });

    if (!statusOutput.trim()) {
      return { success: true, message: 'No changes to push', details: { filesChanged: [] } };
    }

    const filesChanged = statusOutput.trim().split('\n').map(line => line.substring(3));

    // Stage content changes
    await execAsync('git add content/courses/', { cwd: process.cwd() });

    // Commit changes
    const { stdout: commitOutput } = await execAsync(
      `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`,
      { cwd: process.cwd() }
    );

    // Extract commit hash
    const commitHashMatch = commitOutput.match(/\[[\w-]+ ([a-f0-9]+)\]/);
    const commitHash = commitHashMatch ? commitHashMatch[1] : undefined;

    // Push to remote
    await execAsync(`git push origin ${gitConfig.branch}`, { cwd: process.cwd() });

    return {
      success: true,
      message: `Successfully pushed ${filesChanged.length} file(s)`,
      details: { filesChanged, commitHash },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: 'Failed to push content',
      details: { error: errorMessage },
    };
  }
}

/**
 * Get list of changed files (staged and unstaged)
 */
export async function getChangedFiles(): Promise<{ staged: string[]; unstaged: string[]; untracked: string[] }> {
  try {
    // Get staged files
    const { stdout: stagedOutput } = await execAsync(
      'git diff --cached --name-only -- content/courses/',
      { cwd: process.cwd() }
    ).catch(() => ({ stdout: '' }));

    // Get unstaged files
    const { stdout: unstagedOutput } = await execAsync(
      'git diff --name-only -- content/courses/',
      { cwd: process.cwd() }
    ).catch(() => ({ stdout: '' }));

    // Get untracked files
    const { stdout: untrackedOutput } = await execAsync(
      'git ls-files --others --exclude-standard -- content/courses/',
      { cwd: process.cwd() }
    ).catch(() => ({ stdout: '' }));

    return {
      staged: stagedOutput.trim().split('\n').filter(Boolean),
      unstaged: unstagedOutput.trim().split('\n').filter(Boolean),
      untracked: untrackedOutput.trim().split('\n').filter(Boolean),
    };
  } catch {
    return { staged: [], unstaged: [], untracked: [] };
  }
}

/**
 * Get commit history for content files
 */
export async function getContentHistory(limit: number = 10): Promise<Array<{
  hash: string;
  author: string;
  date: string;
  message: string;
  filesChanged: number;
}>> {
  try {
    const { stdout } = await execAsync(
      `git log --oneline --pretty=format:"%H|%an|%ad|%s" --date=short -n ${limit} -- content/courses/`,
      { cwd: process.cwd() }
    );

    const commits = stdout.trim().split('\n').filter(Boolean).map(line => {
      const [hash, author, date, message] = line.split('|');
      return { hash, author, date, message, filesChanged: 0 };
    });

    // Get files changed for each commit
    for (const commit of commits) {
      const { stdout: filesOutput } = await execAsync(
        `git diff-tree --no-commit-id --name-only -r ${commit.hash} -- content/courses/`,
        { cwd: process.cwd() }
      ).catch(() => ({ stdout: '' }));
      commit.filesChanged = filesOutput.trim().split('\n').filter(Boolean).length;
    }

    return commits;
  } catch {
    return [];
  }
}

/**
 * Create or update a content file
 */
export async function saveContentFile(relativePath: string, content: string): Promise<SyncResult> {
  try {
    const fullPath = path.join(CONTENT_DIR, relativePath);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, content, 'utf-8');

    return {
      success: true,
      message: `File saved: ${relativePath}`,
      details: { filesChanged: [relativePath] },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: 'Failed to save file',
      details: { error: errorMessage },
    };
  }
}

/**
 * Delete a content file
 */
export async function deleteContentFile(relativePath: string): Promise<SyncResult> {
  try {
    const fullPath = path.join(CONTENT_DIR, relativePath);

    await fs.unlink(fullPath);

    return {
      success: true,
      message: `File deleted: ${relativePath}`,
      details: { filesChanged: [relativePath] },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: 'Failed to delete file',
      details: { error: errorMessage },
    };
  }
}

/**
 * List all content files
 */
export async function listContentFiles(): Promise<ContentFile[]> {
  const files: ContentFile[] = [];

  async function walkDir(dir: string, basePath: string = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);

      if (entry.isDirectory()) {
        await walkDir(fullPath, relativePath);
      } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
        const content = await fs.readFile(fullPath, 'utf-8');
        files.push({
          path: fullPath,
          relativePath: relativePath.replace(/\\/g, '/'),
          content,
        });
      }
    }
  }

  try {
    await walkDir(CONTENT_DIR);
  } catch (error) {
    console.error('Error listing content files:', error);
  }

  return files;
}

/**
 * Sync content with remote (pull then push)
 */
export async function syncContent(commitMessage?: string): Promise<SyncResult> {
  // First pull
  const pullResult = await pullContent();
  if (!pullResult.success && !pullResult.message.includes('up to date')) {
    return pullResult;
  }

  // Then push if there are local changes
  if (commitMessage) {
    return await pushContent(commitMessage);
  }

  return pullResult;
}
