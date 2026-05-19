//! NEXT media transcoder.
//!
//! Consumes `media.transcode.requested.v1`, runs ffmpeg with SVT-AV1 / x264, writes
//! renditions to S3, and emits `media.video.transcoded.v1` per rendition.

use anyhow::Result;
use next_telemetry as telem;
use tracing::info;

#[tokio::main]
async fn main() -> Result<()> {
    telem::init(telem::Config {
        service: "media-transcoder".into(),
        namespace: "next-media".into(),
        environment: std::env::var("NEXT_ENV").unwrap_or_else(|_| "dev".into()),
        version: env!("CARGO_PKG_VERSION").into(),
        otlp_endpoint: std::env::var("OTEL_EXPORTER_OTLP_ENDPOINT")
            .unwrap_or_else(|_| "otel-collector.next-observability:4317".into()),
    })?;
    info!("media-transcoder started");
    // Real implementation pulls from rdkafka consumer, dispatches ffmpeg child processes
    // bounded by per-job GPU/CPU resource limits, streams progress, and emits Kafka events.
    tokio::signal::ctrl_c().await?;
    telem::shutdown();
    Ok(())
}
