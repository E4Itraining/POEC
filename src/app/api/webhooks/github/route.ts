import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { pullContent, getGitConfig } from '@/lib/git/git-sync';

/**
 * Verify GitHub webhook signature
 */
function verifyGitHubSignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * POST /api/webhooks/github
 * Handle GitHub webhook events for automatic content sync
 */
export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

    // Get the raw body for signature verification
    const payload = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const event = request.headers.get('x-github-event');

    // Verify signature if secret is configured
    if (webhookSecret && !verifyGitHubSignature(payload, signature, webhookSecret)) {
      console.error('Invalid GitHub webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(payload);

    // Only process push events
    if (event !== 'push') {
      return NextResponse.json({ message: `Event ${event} ignored` });
    }

    const gitConfig = await getGitConfig();
    if (!gitConfig) {
      return NextResponse.json({ error: 'Git not configured' }, { status: 500 });
    }

    // Check if the push is to the configured branch
    const ref = body.ref; // e.g., "refs/heads/main"
    const branch = ref?.replace('refs/heads/', '');

    if (branch !== gitConfig.branch) {
      return NextResponse.json({
        message: `Push to ${branch} ignored (configured branch: ${gitConfig.branch})`,
      });
    }

    // Check if any content files were changed
    const commits = body.commits || [];
    const contentChanges = commits.some((commit: { added?: string[]; modified?: string[]; removed?: string[] }) => {
      const allFiles = [
        ...(commit.added || []),
        ...(commit.modified || []),
        ...(commit.removed || []),
      ];
      return allFiles.some((file: string) => file.startsWith(gitConfig.contentPath));
    });

    if (!contentChanges) {
      return NextResponse.json({
        message: 'No content changes detected',
      });
    }

    // Pull the latest content
    const result = await pullContent();

    if (!result.success) {
      console.error('Failed to pull content:', result.details?.error);
      return NextResponse.json(
        { error: 'Failed to sync content', details: result.details },
        { status: 500 }
      );
    }

    console.log(`GitHub webhook: Synced ${result.details?.filesChanged?.length || 0} files`);

    return NextResponse.json({
      message: 'Content synced successfully',
      filesChanged: result.details?.filesChanged,
    });
  } catch (error) {
    console.error('GitHub webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/github
 * Health check endpoint for webhook
 */
export async function GET() {
  const gitConfig = await getGitConfig();

  return NextResponse.json({
    status: 'active',
    repository: gitConfig?.repository || 'not configured',
    branch: gitConfig?.branch || 'not configured',
  });
}
