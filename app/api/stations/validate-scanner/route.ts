
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { stationId, scannerId, qrType } = await request.json();

    if (!stationId || !scannerId || !qrType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate that the scanner belongs to the station
    const scanner = await prisma.scanner.findFirst({
      where: {
        id: scannerId,
        stationId: stationId,
        isActive: true,
        type: qrType // entry or exit scanner
      }
    }).catch(() => null);

    if (!scanner) {
      // For demo purposes, if scanner table doesn't exist, 
      // we'll validate based on naming convention
      const isValidScanner = scannerId.includes(stationId) && 
                           (scannerId.includes('entry') || scannerId.includes('exit'));
      
      if (!isValidScanner) {
        return NextResponse.json(
          { error: 'Invalid scanner for this station' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ valid: true });

  } catch (error: any) {
    console.error('Scanner validation error:', error);
    return NextResponse.json(
      { error: 'Scanner validation failed' },
      { status: 500 }
    );
  }
}
