package metrics

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type Metrics struct {
	registry                *prometheus.Registry
	KafkaConsumerLag        *prometheus.GaugeVec
	ClickHouseInsertLatency prometheus.Histogram
	ClickHouseWriteFailures *prometheus.CounterVec
	DLQEvents               *prometheus.CounterVec
	EventsConsumed          *prometheus.CounterVec
	IngestionLatency        prometheus.Histogram
}

func New() *Metrics {
	registry := prometheus.NewRegistry()
	m := &Metrics{
		registry: registry,
		KafkaConsumerLag: prometheus.NewGaugeVec(prometheus.GaugeOpts{
			Name: "kafka_consumer_lag",
			Help: "Kafka consumer lag by topic and consumer group.",
		}, []string{"topic", "group"}),
		ClickHouseInsertLatency: prometheus.NewHistogram(prometheus.HistogramOpts{
			Name:    "clickhouse_insert_latency_ms",
			Help:    "ClickHouse insert latency in milliseconds.",
			Buckets: []float64{2.5, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000},
		}),
		ClickHouseWriteFailures: prometheus.NewCounterVec(prometheus.CounterOpts{
			Name: "clickhouse_write_failures_total",
			Help: "Total failed ClickHouse insert attempts.",
		}, []string{"table"}),
		DLQEvents: prometheus.NewCounterVec(prometheus.CounterOpts{
			Name: "dlq_events_total",
			Help: "Total events published to a dead-letter topic.",
		}, []string{"source_topic", "dlq_topic", "reason"}),
		EventsConsumed: prometheus.NewCounterVec(prometheus.CounterOpts{
			Name: "analytics_events_consumed_total",
			Help: "Total events consumed by analytics-service.",
		}, []string{"topic", "category"}),
		IngestionLatency: prometheus.NewHistogram(prometheus.HistogramOpts{
			Name:    "event_ingestion_latency_ms",
			Help:    "Elapsed time between event timestamp and analytics ingestion.",
			Buckets: []float64{10, 50, 100, 250, 500, 1000, 5000, 15000, 60000, 300000},
		}),
	}
	registry.MustRegister(
		m.KafkaConsumerLag,
		m.ClickHouseInsertLatency,
		m.ClickHouseWriteFailures,
		m.DLQEvents,
		m.EventsConsumed,
		m.IngestionLatency,
	)
	return m
}

func (m *Metrics) Handler() http.Handler {
	return promhttp.HandlerFor(m.registry, promhttp.HandlerOpts{})
}
