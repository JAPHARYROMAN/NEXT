package metrics

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type Metrics struct {
	registry            *prometheus.Registry
	EventsReceived      *prometheus.CounterVec
	EventsPublished     *prometheus.CounterVec
	EventsRejected      *prometheus.CounterVec
	KafkaPublishLatency prometheus.Histogram
}

func New() *Metrics {
	registry := prometheus.NewRegistry()
	m := &Metrics{
		registry: registry,
		EventsReceived: prometheus.NewCounterVec(prometheus.CounterOpts{
			Name: "events_received_total",
			Help: "Total NEXT event envelopes received by the event gateway.",
		}, []string{"category", "producer"}),
		EventsPublished: prometheus.NewCounterVec(prometheus.CounterOpts{
			Name: "events_published_total",
			Help: "Total NEXT event envelopes published to Kafka.",
		}, []string{"category", "topic"}),
		EventsRejected: prometheus.NewCounterVec(prometheus.CounterOpts{
			Name: "events_rejected_total",
			Help: "Total NEXT event envelopes rejected before Kafka publish.",
		}, []string{"category", "reason"}),
		KafkaPublishLatency: prometheus.NewHistogram(prometheus.HistogramOpts{
			Name:    "kafka_publish_latency_ms",
			Help:    "Kafka publish latency in milliseconds.",
			Buckets: []float64{1, 2.5, 5, 10, 25, 50, 100, 250, 500, 1000, 2500},
		}),
	}
	registry.MustRegister(m.EventsReceived, m.EventsPublished, m.EventsRejected, m.KafkaPublishLatency)
	return m
}

func (m *Metrics) Handler() http.Handler {
	return promhttp.HandlerFor(m.registry, promhttp.HandlerOpts{})
}
