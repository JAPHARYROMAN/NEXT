//! OpenTelemetry bootstrap for NEXT Rust services.
//!
//! Initialises a global tracer that exports to the in-cluster OTel Collector
//! and a `tracing` subscriber that emits JSON logs correlated with the active span.

use opentelemetry::{global, trace::TracerProvider as _, KeyValue};
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_sdk::{
    propagation::TraceContextPropagator,
    runtime,
    trace::{self, Sampler},
    Resource,
};
use thiserror::Error;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

#[derive(Debug, Error)]
pub enum InitError {
    #[error("OTLP exporter: {0}")]
    Otlp(#[from] opentelemetry::trace::TraceError),
}

#[derive(Debug, Clone)]
pub struct Config {
    pub service: String,
    pub namespace: String,
    pub environment: String,
    pub version: String,
    pub otlp_endpoint: String,
}

/// Initialise tracing + metrics. Call once at process start.
pub fn init(cfg: Config) -> Result<(), InitError> {
    global::set_text_map_propagator(TraceContextPropagator::new());

    let resource = Resource::new(vec![
        KeyValue::new("service.name", cfg.service.clone()),
        KeyValue::new("service.namespace", cfg.namespace.clone()),
        KeyValue::new("service.version", cfg.version.clone()),
        KeyValue::new("deployment.environment.name", cfg.environment.clone()),
    ]);

    let tracer_provider = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(
            opentelemetry_otlp::new_exporter()
                .tonic()
                .with_endpoint(&cfg.otlp_endpoint),
        )
        .with_trace_config(
            trace::Config::default()
                .with_sampler(Sampler::ParentBased(Box::new(Sampler::TraceIdRatioBased(
                    0.01,
                ))))
                .with_resource(resource),
        )
        .install_batch(runtime::Tokio)?;

    let tracer = tracer_provider.tracer(cfg.service.clone());
    let telemetry = tracing_opentelemetry::layer().with_tracer(tracer);
    let fmt = tracing_subscriber::fmt::layer().json();

    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")))
        .with(telemetry)
        .with(fmt)
        .init();

    Ok(())
}

/// Flush exporters; call on shutdown.
pub fn shutdown() {
    global::shutdown_tracer_provider();
}
