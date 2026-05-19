//! NEXT live ingest. RTMP / SRT / WebRTC receivers + segmenter.

use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    next_telemetry::init(next_telemetry::Config {
        service: "live-ingest".into(),
        namespace: "next-streaming".into(),
        environment: std::env::var("NEXT_ENV").unwrap_or_else(|_| "dev".into()),
        version: env!("CARGO_PKG_VERSION").into(),
        otlp_endpoint: std::env::var("OTEL_EXPORTER_OTLP_ENDPOINT")
            .unwrap_or_else(|_| "otel-collector.next-observability:4317".into()),
    })?;
    tracing::info!("live-ingest started");
    tokio::signal::ctrl_c().await?;
    next_telemetry::shutdown();
    Ok(())
}
