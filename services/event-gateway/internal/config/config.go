package config

import (
	"strings"
	"time"
)

type Config struct {
	Env                 string        `env:"NEXT_ENV" envDefault:"dev"`
	HTTPAddr            string        `env:"HTTP_ADDR" envDefault:":8080"`
	OTLPEndpoint        string        `env:"OTEL_EXPORTER_OTLP_ENDPOINT" envDefault:""`
	KafkaBrokers        string        `env:"KAFKA_BROKERS" envDefault:"localhost:9092"`
	KafkaClientID       string        `env:"KAFKA_CLIENT_ID" envDefault:"event-gateway"`
	ProducerSecrets     string        `env:"EVENT_PRODUCER_SECRETS" envDefault:""`
	AllowUnsignedEvents bool          `env:"EVENT_GATEWAY_ALLOW_UNSIGNED" envDefault:"false"`
	MaxBodyBytes        int64         `env:"EVENT_GATEWAY_MAX_BODY_BYTES" envDefault:"1048576"`
	RateLimitPerMinute  int           `env:"EVENT_GATEWAY_RATE_LIMIT_PER_MINUTE" envDefault:"6000"`
	RateLimitBurst      int           `env:"EVENT_GATEWAY_RATE_LIMIT_BURST" envDefault:"1000"`
	ShutdownTimeout     time.Duration `env:"EVENT_GATEWAY_SHUTDOWN_TIMEOUT" envDefault:"30s"`
}

func (c Config) Brokers() []string {
	parts := strings.Split(c.KafkaBrokers, ",")
	brokers := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			brokers = append(brokers, trimmed)
		}
	}
	return brokers
}
