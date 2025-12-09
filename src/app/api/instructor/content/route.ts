import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  listContentFiles,
  saveContentFile,
  deleteContentFile,
  getChangedFiles,
  getContentHistory,
} from '@/lib/git/git-sync';

/**
 * GET /api/instructor/content
 * List all content files and their status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'history') {
      const limit = parseInt(searchParams.get('limit') || '10');
      const history = await getContentHistory(limit);
      return NextResponse.json({ history });
    }

    if (action === 'changes') {
      const changes = await getChangedFiles();
      return NextResponse.json({ changes });
    }

    const files = await listContentFiles();
    const changes = await getChangedFiles();

    return NextResponse.json({
      files: files.map(f => ({
        relativePath: f.relativePath,
        hasChanges: changes.unstaged.includes(`content/courses/${f.relativePath}`) ||
                   changes.staged.includes(`content/courses/${f.relativePath}`),
        isNew: changes.untracked.includes(`content/courses/${f.relativePath}`),
      })),
      changes,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/instructor/content
 * Create or update a content file
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { relativePath, content } = body;

    if (!relativePath || content === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: relativePath, content' },
        { status: 400 }
      );
    }

    const result = await saveContentFile(relativePath, content);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/instructor/content
 * Delete a content file
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { relativePath } = body;

    if (!relativePath) {
      return NextResponse.json(
        { error: 'Missing required field: relativePath' },
        { status: 400 }
      );
    }

    const result = await deleteContentFile(relativePath);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}
