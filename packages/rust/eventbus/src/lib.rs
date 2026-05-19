//! Kafka producer with OTel trace propagation for NEXT Rust services.

use rdkafka::config::ClientConfig;
use rdkafka::producer::{FutureProducer, FutureRecord};
use rdkafka::util::Timeout;
use std::time::Duration;
use thiserror::Error;
use tracing::instrument;

#[derive(Debug, Error)]
pub enum EventError {
    #[error("kafka: {0}")]
    Kafka(#[from] rdkafka::error::KafkaError),
}

#[derive(Debug, Clone)]
pub struct Config {
    pub brokers: Vec<String>,
    pub client_id: String,
    pub use_tls: bool,
}

pub struct Producer {
    inner: FutureProducer,
}

impl Producer {
    pub fn new(cfg: Config) -> Result<Self, EventError> {
        let mut c = ClientConfig::new();
        c.set("bootstrap.servers", cfg.brokers.join(","));
        c.set("client.id", &cfg.client_id);
        c.set("enable.idempotence", "true");
        c.set("acks", "all");
        c.set("compression.type", "snappy");
        c.set("linger.ms", "5");
        if cfg.use_tls {
            c.set("security.protocol", "SSL");
        }
        let inner: FutureProducer = c.create()?;
        Ok(Self { inner })
    }

    #[instrument(skip(self, payload), fields(topic = %topic, key = %key))]
    pub async fn emit(&self, topic: &str, key: &str, payload: &[u8]) -> Result<(), EventError> {
        let record = FutureRecord::to(topic).key(key).payload(payload);
        let _ = self
            .inner
            .send(record, Timeout::After(Duration::from_secs(5)))
            .await
            .map_err(|(e, _)| e)?;
        Ok(())
    }
}
