import { prisma } from './db';

interface AuditParams {
  actorUserId: string;
  actorEmail: string;
  actorRole: string;
  institutionId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, any>;
}

export async function logAuditEvent(params: AuditParams) {
  try {
    // Sanitize metadata to remove any passwords, keys, or direct raw tokens
    let sanitizedMetadata: string | null = null;
    if (params.metadata) {
      const copy = { ...params.metadata };
      delete copy.password;
      delete copy.passwordHash;
      delete copy.token;
      delete copy.sessionSecret;
      sanitizedMetadata = JSON.stringify(copy);
    }

    await prisma.auditLog.create({
      data: {
        actorUserId: params.actorUserId,
        actorEmail: params.actorEmail,
        actorRole: params.actorRole,
        institutionId: params.institutionId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        metadataJson: sanitizedMetadata,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
