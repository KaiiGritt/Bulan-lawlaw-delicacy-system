import { NextRequest, NextResponse } from 'next/server';
import philippinesData from '../../../data/philippines-addresses.json';

type RegionType = typeof philippinesData.regions[number];
type ProvinceType = RegionType['provinces'][number];
type CityType = ProvinceType['cities'][number];

// GET /api/philippines-addresses - Get Philippines address data
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // regions, provinces, cities, barangays
    const regionId = searchParams.get('regionId');
    const provinceId = searchParams.get('provinceId');
    const cityId = searchParams.get('cityId');

    // Return all regions
    if (!type || type === 'regions') {
      const regions = philippinesData.regions.map((region: RegionType) => ({
        id: region.id,
        name: region.name
      }));
      return NextResponse.json(regions);
    }

    // Return provinces for a region
    if (type === 'provinces' && regionId) {
      const region = philippinesData.regions.find((r: RegionType) => r.id === regionId);
      if (!region) {
        return NextResponse.json({ error: 'Region not found' }, { status: 404 });
      }
      const provinces = region.provinces.map((province: ProvinceType) => ({
        id: province.id,
        name: province.name
      }));
      return NextResponse.json(provinces);
    }

    // Return cities for a province
    if (type === 'cities' && regionId && provinceId) {
      const region = philippinesData.regions.find((r: RegionType) => r.id === regionId);
      if (!region) {
        return NextResponse.json({ error: 'Region not found' }, { status: 404 });
      }
      const province = region.provinces.find((p: ProvinceType) => p.id === provinceId);
      if (!province) {
        return NextResponse.json({ error: 'Province not found' }, { status: 404 });
      }
      const cities = province.cities.map((city: CityType) => ({
        id: city.id,
        name: city.name,
        postalCode: city.postalCode
      }));
      return NextResponse.json(cities);
    }

    // Return barangays for a city
    if (type === 'barangays' && regionId && provinceId && cityId) {
      const region = philippinesData.regions.find((r: RegionType) => r.id === regionId);
      if (!region) {
        return NextResponse.json({ error: 'Region not found' }, { status: 404 });
      }
      const province = region.provinces.find((p: ProvinceType) => p.id === provinceId);
      if (!province) {
        return NextResponse.json({ error: 'Province not found' }, { status: 404 });
      }
      const city = province.cities.find((c: CityType) => c.id === cityId);
      if (!city) {
        return NextResponse.json({ error: 'City not found' }, { status: 404 });
      }
      return NextResponse.json({
        barangays: city.barangays,
        postalCode: city.postalCode
      });
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching Philippines address data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address data' },
      { status: 500 }
    );
  }
}
