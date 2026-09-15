import { NextRequest, NextResponse } from "next/server";
import { getProjectById } from "@/lib/synthetic/fixtures/dataset";
import { generateSatelliteEvidence, validateCoordinates } from "@/lib/engine/satellite";
import { SentinelSceneRecord, SentinelSceneSearchResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const projectId = searchParams.get("projectId") || "HERO-MPLADS-001";
  const project = getProjectById(projectId);

  const lat = parseFloat(searchParams.get("lat") || "") || (project ? project.latitude : 19.076);
  const lon = parseFloat(searchParams.get("lon") || "") || (project ? project.longitude : 72.8777);
  const radius = parseFloat(searchParams.get("radius") || "100");
  const maxCloud = parseFloat(searchParams.get("maxCloud") || "60");
  const forceDemo = searchParams.get("forceDemo") === "true";

  // Action: Query Sentinel-2 scenes list
  if (action === "scenes") {
    const coordCheck = validateCoordinates(lat, lon);
    if (!coordCheck.isValid) {
      return NextResponse.json({ error: coordCheck.error }, { status: 400 });
    }

    // Try backend or direct STAC catalog
    let scenes: SentinelSceneRecord[] = [];
    let mode: "REAL_SATELLITE_API" | "DEMO_SATELLITE_DATA" = "DEMO_SATELLITE_DATA";

    if (!forceDemo) {
      try {
        const delta = Math.max((radius / 111320.0) * 3, 0.02);
        const bbox = [
          Math.round((lon - delta) * 10000) / 10000,
          Math.round((lat - delta) * 10000) / 10000,
          Math.round((lon + delta) * 10000) / 10000,
          Math.round((lat + delta) * 10000) / 10000,
        ];
        const res = await fetch("https://earth-search.aws.element84.com/v1/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            collections: ["sentinel-2-l2a"],
            bbox,
            datetime: "2023-08-01T00:00:00Z/2024-06-30T23:59:59Z",
            limit: 12,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const features = data.features || [];
          if (features.length > 0) {
            mode = "REAL_SATELLITE_API";
            scenes = features.map((f: any) => {
              const props = f.properties || {};
              const acqDt = props.datetime || props.created || "2024-04-22T05:52:39Z";
              const cloud = Math.round(Number(props["eo:cloud_cover"] || 0) * 10) / 10;
              const isSuit = cloud <= maxCloud;
              const qTier = cloud <= 15 ? "OPTIMAL" : cloud <= 30 ? "USABLE" : "REJECTED_CLOUD";
              return {
                sceneId: f.id,
                productId: props["s2:product_id"] || f.id,
                acquisitionDatetime: acqDt,
                acquisitionDate: acqDt.slice(0, 10),
                cloudCoveragePct: cloud,
                resolutionMeters: 10.0,
                qualityTier: qTier,
                isSuitable: isSuit,
                rejectionReason: isSuit
                  ? null
                  : `Cloud coverage (${cloud}%) exceeds allowable quality threshold (${maxCloud}%).`,
                tileUrl: f.assets?.rendered_preview?.href || f.assets?.thumbnail?.href || null,
                thumbnailUrl: f.assets?.thumbnail?.href || null,
                sunElevationDeg: props["view:sun_elevation"] ? Math.round(props["view:sun_elevation"]) : 54,
                orbitPass: `Orbit ${props["s2:relative_orbit"] || "R076"}`,
                source: "Copernicus Sentinel-2 MSI L2A",
                isDemo: false,
              };
            });
          }
        }
      } catch {
        mode = "DEMO_SATELLITE_DATA";
      }
    }

    if (scenes.length === 0) {
      mode = "DEMO_SATELLITE_DATA";
      const demoDates = [
        { date: "2024-06-15", cloud: 76.4, orbit: "Ascending Pass 05:48 UTC" },
        { date: "2024-05-18", cloud: 9.1, orbit: "Descending Pass 05:54 UTC" },
        { date: "2024-05-10", cloud: 4.1, orbit: "Descending Pass 05:54 UTC" },
        { date: "2024-04-22", cloud: 5.8, orbit: "Descending Pass 05:52 UTC" },
        { date: "2024-04-02", cloud: 18.2, orbit: "Descending Pass 05:50 UTC" },
        { date: "2024-03-12", cloud: 22.0, orbit: "Ascending Pass 05:46 UTC" },
        { date: "2023-11-20", cloud: 3.4, orbit: "Descending Pass 05:51 UTC" },
        { date: "2023-09-10", cloud: 8.2, orbit: "Descending Pass 05:53 UTC" },
        { date: "2023-09-01", cloud: 3.2, orbit: "Descending Pass 05:52 UTC" },
        { date: "2023-08-15", cloud: 4.5, orbit: "Descending Pass 05:50 UTC" },
        { date: "2023-07-20", cloud: 18.0, orbit: "Ascending Pass 05:45 UTC" },
      ];
      scenes = demoDates.map((d) => {
        const compact = d.date.replace(/-/g, "");
        const isSuit = d.cloud <= maxCloud;
        const qTier = d.cloud <= 15 ? "OPTIMAL" : d.cloud <= 30 ? "USABLE" : "REJECTED_CLOUD";
        return {
          sceneId: `S2B_MSIL2A_${compact}T055239_N0500_R076_T43QDA_${compact}T083000`,
          productId: `S2B_${compact}_T43QDA_L2A`,
          acquisitionDatetime: `${d.date}T05:52:39Z`,
          acquisitionDate: d.date,
          cloudCoveragePct: d.cloud,
          resolutionMeters: 10.0,
          qualityTier: qTier,
          isSuitable: isSuit,
          rejectionReason: isSuit
            ? null
            : `Cloud coverage (${d.cloud}%) exceeds allowable quality threshold (${maxCloud}%).`,
          tileUrl: null,
          thumbnailUrl: null,
          sunElevationDeg: 54.2,
          orbitPass: d.orbit,
          source: "DEMO Copernicus Sentinel-2 MSI L2A",
          isDemo: true,
        };
      });
    }

    // Sort newest first
    scenes.sort((a, b) => b.acquisitionDatetime.localeCompare(a.acquisitionDatetime));
    const suitableScenes = scenes.filter((s) => s.isSuitable);
    const latestSuitable = suitableScenes[0] || null;
    const rejectedNewer = latestSuitable
      ? scenes.filter((s) => s.acquisitionDatetime > latestSuitable.acquisitionDatetime && !s.isSuitable)
      : [];

    const responsePayload: SentinelSceneSearchResponse = {
      projectId,
      latitude: lat,
      longitude: lon,
      radiusMeters: radius,
      totalScenesFound: scenes.length,
      scenes,
      latestSuitableScene: latestSuitable,
      rejectedNewerScenes: rejectedNewer,
      mode,
      providerInfo: {
        providerName: "European Space Agency (ESA) Copernicus Hub",
        constellation: "Sentinel-2A / Sentinel-2B",
        instrument: "MultiSpectral Instrument (MSI)",
        productType: "Level-2A Bottom-of-Atmosphere (BOA) Reflectance",
        nominalResolution: "10m (B2, B3, B4, B8)",
        revisitRateDays: 5,
        mode,
        isDemo: mode === "DEMO_SATELLITE_DATA",
      },
      retrievalTimestamp: new Date().toISOString(),
    };

    return NextResponse.json(responsePayload);
  }

  if (!project) {
    return NextResponse.json(
      { error: `Project '${projectId}' not found in registry.` },
      { status: 404 }
    );
  }

  const evidence =
    project.satelliteEvidence ||
    generateSatelliteEvidence({
      projectId: project.id,
      category: project.workCategory,
      latitude: project.latitude,
      longitude: project.longitude,
      sanctionDate: project.sanctionDate,
      targetCompletionDate: project.targetCompletionDate,
      physicalProgressPct: project.physicalProgressPct,
      radiusMeters: 100,
    });

  return NextResponse.json({
    projectId: project.id,
    satelliteEvidence: evidence,
    fairnessSafeguard: {
      scoreDecoupled: true,
      riskScoreImpact: 0,
      note: "Satellite evidence is an independent verification signal and does not modify the numerical Risk Score.",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, latitude, longitude, category, radiusMeters, preferredProvider } = body;

    const targetProject = projectId ? getProjectById(projectId) : null;
    const lat = typeof latitude === "number" ? latitude : targetProject?.latitude;
    const lon = typeof longitude === "number" ? longitude : targetProject?.longitude;
    const workCat = category || targetProject?.workCategory || "Roads & Bridges";

    if (typeof lat !== "number" || typeof lon !== "number") {
      return NextResponse.json(
        {
          error: "Latitude and longitude must be provided or resolvable from projectId.",
          status: "UNAVAILABLE",
        },
        { status: 400 }
      );
    }

    const coordCheck = validateCoordinates(lat, lon);
    if (!coordCheck.isValid) {
      return NextResponse.json(
        {
          error: "Invalid coordinates",
          details: coordCheck.error,
          status: "UNAVAILABLE",
        },
        { status: 400 }
      );
    }

    const evidence = generateSatelliteEvidence({
      projectId: projectId || "CUSTOM-ANALYSIS",
      category: workCat,
      latitude: lat,
      longitude: lon,
      sanctionDate: targetProject?.sanctionDate || "2023-08-01",
      targetCompletionDate: targetProject?.targetCompletionDate || "2024-06-01",
      physicalProgressPct: targetProject?.physicalProgressPct || 50,
      radiusMeters: radiusMeters || 100,
      preferredProvider,
    });

    return NextResponse.json({
      success: true,
      analysis: evidence,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Satellite analysis failed", details: message },
      { status: 500 }
    );
  }
}

