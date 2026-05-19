//! NEXT vector indexer. Streams media + community events, computes embeddings via
//! the Triton embedding endpoint, and upserts into Qdrant.

use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    next_telemetry::init(next_telemetry::Config {
        service: "vector-indexer".into(),
        namespace: "next-ml".into(),
        environment: std::env::var("NEXT_ENV").unwrap_or_else(|_| "dev".into()),
        version: env!("CARGO_PKG_VERSION").into(),
        otlp_endpoint: std::env::var("OTEL_EXPORTER_OTLP_ENDPOINT")
            .unwrap_or_else(|_| "otel-collector.next-observability:4317".into()),
    })?;
    tracing::info!("vector-indexer started");
    tokio::signal::ctrl_c().await?;
    next_telemetry::shutdown();
    Ok(())
}
