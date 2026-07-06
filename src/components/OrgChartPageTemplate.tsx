// @ts-nocheck
import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { OrgLandingPage } from '@/components/OrgLandingPage';

export async function OrgChartPageTemplate({ slug }: { slug: string }) {
  const payload = await getPayload({ config: configPromise });

  const orgUnitsRes = await payload.find({
    collection: 'org-units',
    sort: 'order',
    limit: 100,
    depth: 2,
  });

  return <OrgLandingPage units={orgUnitsRes.docs as any[]} />;
}
