import { getPayload } from 'payload';
import configPromise from '@payload-config';

// Singleton payload instance
let _payload = null;
async function getP() {
  if (!_payload) {
    _payload = await getPayload({ config: configPromise });
  }
  return _payload;
}

// Chuyển đổi Prisma Where -> Payload Where
function convertWhere(where) {
  if (!where) return undefined;
  const payloadWhere = {};
  for (const [key, value] of Object.entries(where)) {
    if (value === undefined) continue;
    if (typeof value === 'object' && value !== null) {
      if (value.in) {
        payloadWhere[key] = { in: value.in };
      }
      // Thêm các operator khác nếu cần (vd: not, gt, lt)
    } else {
      payloadWhere[key] = { equals: value };
    }
  }
  return Object.keys(payloadWhere).length > 0 ? payloadWhere : undefined;
}

// Chuyển đổi Prisma orderBy -> Payload sort
function convertOrderBy(orderBy) {
  if (!orderBy) return undefined;
  if (Array.isArray(orderBy)) return undefined; 
  const keys = Object.keys(orderBy);
  if (keys.length === 0) return undefined;
  const key = keys[0];
  const dir = orderBy[key] === 'desc' ? '-' : '';
  return `${dir}${key}`;
}

const createFacade = (collectionSlug, defaultWhere = {}, defaultData = {}) => ({
  findMany: async (args = {}) => {
    const p = await getP();
    const where = { ...defaultWhere, ...convertWhere(args.where) };
    const res = await p.find({
      collection: collectionSlug,
      where: Object.keys(where).length > 0 ? where : undefined,
      limit: args.take || 1000,
      sort: convertOrderBy(args.orderBy),
    });
    return res.docs;
  },
  findUnique: async (args = {}) => {
    const p = await getP();
    const where = { ...defaultWhere, ...convertWhere(args.where) };
    const res = await p.find({
      collection: collectionSlug,
      where: Object.keys(where).length > 0 ? where : undefined,
      limit: 1,
    });
    return res.docs.length > 0 ? res.docs[0] : null;
  },
  create: async (args = {}) => {
    const p = await getP();
    return await p.create({
      collection: collectionSlug,
      data: { ...defaultData, ...args.data },
    });
  },
  update: async (args = {}) => {
    const p = await getP();
    let id;
    if (args.where?.id) {
      id = args.where.id;
    } else {
      const where = { ...defaultWhere, ...convertWhere(args.where) };
      const docs = await p.find({ 
        collection: collectionSlug, 
        where: Object.keys(where).length > 0 ? where : undefined, 
        limit: 1 
      });
      if (docs.docs.length > 0) id = docs.docs[0].id;
    }
    
    if (!id) return null;

    // Payload doesn't have native atomic increment. 
    // Fetch and increment manually if we see Prisma's { increment: X }
    let dataToUpdate = { ...args.data };
    for (const key of Object.keys(dataToUpdate)) {
      if (typeof dataToUpdate[key] === 'object' && dataToUpdate[key] !== null && dataToUpdate[key].increment !== undefined) {
        const existing = await p.findByID({ collection: collectionSlug, id });
        dataToUpdate[key] = (existing[key] || 0) + dataToUpdate[key].increment;
      }
    }

    return await p.update({
      collection: collectionSlug,
      id,
      data: dataToUpdate,
    });
  },
  upsert: async (args = {}) => {
    const p = await getP();
    const where = { ...defaultWhere, ...convertWhere(args.where) };
    const existing = await p.find({
      collection: collectionSlug,
      where: Object.keys(where).length > 0 ? where : undefined,
      limit: 1,
    });
    if (existing.docs.length > 0) {
      return await p.update({
        collection: collectionSlug,
        id: existing.docs[0].id,
        data: args.update,
      });
    } else {
      return await p.create({
        collection: collectionSlug,
        data: { ...defaultData, ...args.create },
      });
    }
  },
  count: async (args = {}) => {
    const p = await getP();
    const where = { ...defaultWhere, ...convertWhere(args.where) };
    const res = await p.count({
      collection: collectionSlug,
      where: Object.keys(where).length > 0 ? where : undefined,
    });
    return res.totalDocs;
  }
});

// Prisma ORM Wrapper -> Payload CMS Local API
export const prisma = {
  systemConfig: createFacade('zalo-system-configs'),
  systemSetting: createFacade('zalo-system-configs'), 
  follower: createFacade('zalo-followers'),
  staffZaloLink: createFacade('zalo-staff-links'),
  aiKnowledge: createFacade('ai-knowledge'),
  messageLog: createFacade('zalo-message-logs'),
  zaloBroadcast: createFacade('zalo-broadcasts'),
  geminiApiKey: createFacade('api-keys', { provider: { equals: 'gemini' } }, { provider: 'gemini' }),
  groqApiKey: createFacade('api-keys', { provider: { equals: 'groq' } }, { provider: 'groq' }),
  appointment: createFacade('zalo-appointments'),
  testResult: createFacade('zalo-test-results'),
  servicePrice: createFacade('zalo-service-prices'),
};
