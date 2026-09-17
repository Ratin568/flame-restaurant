import {db} from '@/lib/db';

export type BranchView = {
  id: string;
  slug: string;
  phone: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
};

export async function getActiveBranches(): Promise<BranchView[]> {
  const branches = await db.branch.findMany({
    where: {isActive: true},
    orderBy: {slug: 'asc'},
  });
  return branches.map((b) => ({
    id: b.id,
    slug: b.slug,
    phone: b.phone,
    address: b.address,
    lat: b.lat,
    lng: b.lng,
  }));
}