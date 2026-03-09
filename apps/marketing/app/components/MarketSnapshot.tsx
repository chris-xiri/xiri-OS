import { getCityMarketData, NATIONAL_MEDIAN_WAGE, DATA_SOURCES } from "../../lib/market-data";

interface MarketSnapshotProps {
    cityName: string;
    citySlug: string;
    stateCode: string;
    stateName: string;
}

export default function MarketSnapshot({
    cityName,
    citySlug,
    stateCode,
    stateName,
}: MarketSnapshotProps) {
    const data = getCityMarketData(citySlug, stateCode);

    // If no data available at all, don't render
    if (!data.state && !data.metro) return null;

    const wageDirection =
        data.wageVsNational !== undefined
            ? data.wageVsNational > 0
                ? "above"
                : data.wageVsNational < 0
                    ? "below"
                    : "at"
            : undefined;

    const wageColor =
        wageDirection === "above"
            ? "#ff6b6b"
            : wageDirection === "below"
                ? "#00d4aa"
                : "#c4c9e0";

    return (
        <section className="section" style={{ background: "#141829" }}>
            <div
                className="section-inner"
                style={{ maxWidth: "800px", margin: "0 auto" }}
            >
                <div className="section-header">
                    <span className="section-label">Market intelligence</span>
                    <h2>
                        {cityName} cleaning market{" "}
                        <span style={{ color: "#00d4aa" }}>snapshot</span>
                    </h2>
                </div>

                {/* Stats grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "1rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    {/* Population */}
                    {data.population && (
                        <StatCard
                            label="City population"
                            value={data.population.toLocaleString()}
                        />
                    )}

                    {/* Metro area */}
                    {data.metro && (
                        <StatCard
                            label="Metro area"
                            value={data.metro.name}
                            small
                        />
                    )}

                    {/* Median wage */}
                    {data.metro && (
                        <StatCard
                            label="Median janitor wage"
                            value={`$${data.metro.medianWage.toFixed(2)}/hr`}
                            subtext={
                                data.wageVsNational !== undefined
                                    ? `${Math.abs(data.wageVsNational)}% ${wageDirection} national avg ($${NATIONAL_MEDIAN_WAGE}/hr)`
                                    : undefined
                            }
                            subtextColor={wageColor}
                            sourceLabel="BLS"
                            sourceUrl={data.blsUrl}
                        />
                    )}

                    {/* State minimum wage */}
                    {data.state && (
                        <StatCard
                            label={`${stateCode} minimum wage`}
                            value={`$${data.state.minWage.toFixed(2)}/hr`}
                        />
                    )}

                    {/* Janitorial companies */}
                    {data.state && (
                        <StatCard
                            label={`Janitorial companies in ${stateName}`}
                            value={data.state.janitorialCompanies.toLocaleString()}
                            sourceLabel="Census Bureau"
                            sourceUrl={data.censusUrl}
                        />
                    )}

                    {/* Office properties — metro level */}
                    {data.metro && data.metro.officeProperties > 0 && (
                        <StatCard
                            label="Office properties"
                            value={data.metro.officeProperties.toLocaleString()}
                            subtext={`${data.metro.name} metro`}
                            subtextColor="#555d7e"
                            sourceLabel="Census Bureau"
                            sourceUrl={data.censusUrl}
                        />
                    )}

                    {/* Medical facilities — metro level */}
                    {data.metro && data.metro.medicalFacilities > 0 && (
                        <StatCard
                            label="Medical facilities"
                            value={data.metro.medicalFacilities.toLocaleString()}
                            subtext={`${data.metro.name} metro`}
                            subtextColor="#555d7e"
                            sourceLabel="Census Bureau"
                            sourceUrl={data.censusUrl}
                        />
                    )}

                    {/* Schools — metro level */}
                    {data.metro && data.metro.schools > 0 && (
                        <StatCard
                            label="Schools"
                            value={data.metro.schools.toLocaleString()}
                            subtext={`${data.metro.name} metro`}
                            subtextColor="#555d7e"
                            sourceLabel="Census Bureau"
                            sourceUrl={data.censusUrl}
                        />
                    )}

                    {/* Total potential clients */}
                    {data.totalPotentialClients && data.totalPotentialClients > 0 && (
                        <StatCard
                            label="Total potential clients"
                            value={data.totalPotentialClients.toLocaleString() + "+"}
                            subtext="Offices + medical + schools in metro"
                            subtextColor="#00d4aa"
                        />
                    )}
                </div>

                {/* Insight callout */}
                {data.metro && data.state && (
                    <div
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(0,212,170,0.08) 0%, rgba(0,212,170,0.02) 100%)",
                            border: "1px solid rgba(0,212,170,0.15)",
                            borderRadius: "12px",
                            padding: "1.25rem 1.5rem",
                            display: "flex",
                            gap: "0.75rem",
                            alignItems: "flex-start",
                        }}
                    >
                        <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>💡</span>
                        <div>
                            <p
                                style={{
                                    color: "#e8eaf0",
                                    fontSize: "0.9375rem",
                                    lineHeight: 1.7,
                                    margin: 0,
                                }}
                            >
                                {data.metro.medianWage < NATIONAL_MEDIAN_WAGE ? (
                                    <>
                                        Janitorial wages in the {data.metro.name} metro
                                        are <strong style={{ color: "#00d4aa" }}>{Math.abs(data.wageVsNational!)}% below</strong> the
                                        national average, giving {cityName}-based cleaning
                                        companies stronger margins on commercial contracts.
                                        Use our free calculator to price jobs using local wage data.
                                    </>
                                ) : (
                                    <>
                                        The {data.metro.name} metro has wages{" "}
                                        <strong style={{ color: wageColor }}>{Math.abs(data.wageVsNational!)}% above</strong> the
                                        national average — make sure your bids account for higher
                                        labor costs in {cityName}. Our calculator factors in local
                                        rates automatically.
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {/* Source attribution */}
                <p
                    style={{
                        color: "#555d7e",
                        fontSize: "0.75rem",
                        textAlign: "center",
                        marginTop: "1.25rem",
                        lineHeight: 1.6,
                    }}
                >
                    Sources:{" "}
                    <a
                        href={data.blsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#6b7394", textDecoration: "underline" }}
                    >
                        Bureau of Labor Statistics OEWS ({DATA_SOURCES.bls.dataset.match(/\((.+)\)/)?.[1]})
                    </a>
                    {" · "}
                    <a
                        href={data.censusUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#6b7394", textDecoration: "underline" }}
                    >
                        U.S. Census Bureau CBP ({DATA_SOURCES.census.dataset.match(/\((.+)\)/)?.[1]})
                    </a>
                </p>
            </div>
        </section>
    );
}

/* ── Stat card sub-component ─────────────────────────────── */

function StatCard({
    label,
    value,
    subtext,
    subtextColor,
    sourceLabel,
    sourceUrl,
    small,
}: {
    label: string;
    value: string;
    subtext?: string;
    subtextColor?: string;
    sourceLabel?: string;
    sourceUrl?: string;
    small?: boolean;
}) {
    return (
        <div
            style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "10px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
            }}
        >
            <span
                style={{
                    color: "#8b92b3",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                }}
            >
                {label}
            </span>
            <span
                style={{
                    fontFamily: "var(--font-outfit), system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: small ? "1rem" : "1.5rem",
                    color: "#e8eaf0",
                    lineHeight: 1.2,
                }}
            >
                {value}
            </span>
            {subtext && (
                <span
                    style={{
                        color: subtextColor || "#8b92b3",
                        fontSize: "0.75rem",
                        lineHeight: 1.4,
                    }}
                >
                    {subtext}
                </span>
            )}
            {sourceLabel && sourceUrl && (
                <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: "#555d7e",
                        fontSize: "0.6875rem",
                        textDecoration: "none",
                        marginTop: "0.25rem",
                    }}
                >
                    Source: {sourceLabel} ↗
                </a>
            )}
        </div>
    );
}
