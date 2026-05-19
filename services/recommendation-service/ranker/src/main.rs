//! NEXT recommendation ranker. Receives candidate sets via gRPC, scores them with a
//! cross-encoder on GPU (ONNX Runtime + CUDA), returns ordered results.

use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    next_telemetry::init(next_telemetry::Config {
        service: "recommendation-ranker".into(),
        namespace: "next-discovery".into(),
        environment: std::env::var("NEXT_ENV").unwrap_or_else(|_| "dev".into()),
        version: env!("CARGO_PKG_VERSION").into(),
        otlp_endpoint: std::env::var("OTEL_EXPORTER_OTLP_ENDPOINT")
            .unwrap_or_else(|_| "otel-collector.next-observability:4317".into()),
    })?;
    tracing::info!("recommendation-ranker started");
    tokio::signal::ctrl_c().await?;
    next_telemetry::shutdown();
    Ok(())
}
