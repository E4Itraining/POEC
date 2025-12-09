import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  pullContent,
  pushContent,
  syncContent,
  checkGitStatus,
  getGitConfig,
} from '@/lib/git/git-sync';

/**
 * GET /api/instructor/content/sync
 * Get git sync status
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gitStatus = await checkGitStatus();
    const gitConfig = await getGitConfig();

    return NextResponse.json({
      status: gitStatus,
      config: gitConfig ? {
        repository: gitConfig.repository,
        branch: gitConfig.branch,
        contentPath: gitConfig.contentPath,
      } : null,
    });
  } catch (error) {
    console.error('Error checking git status:', error);
    return NextResponse.json(
      { error: 'Failed to check git status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/instructor/content/sync
 * Perform git sync operation (pull, push, or sync)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, commitMessage } = body;

    if (!action || !['pull', 'push', 'sync'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: pull, push, or sync' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'pull':
        result = await pullContent();
        break;
      case 'push':
        if (!commitMessage) {
          return NextResponse.json(
            { error: 'Commit message is required for push' },
            { status: 400 }
          );
        }
        result = await pushContent(commitMessage);
        break;
      case 'sync':
        result = await syncContent(commitMessage);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, details: result.details },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error syncing content:', error);
    return NextResponse.json(
      { error: 'Failed to sync content' },
      { status: 500 }
    );
  }
}
