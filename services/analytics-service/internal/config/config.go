package config

import (
	"strings"
	"time"
)

type Config struct {
	Env              string        `env:"NEXT_ENV" envDefault:"dev"`
	HTTPAddr         string        `env:"HTTP_ADDR" envDefault:":8080"`
	OTLPEndpoint     string        `env:"OTEL_EXPORTER_OTLP_ENDPOINT" envDefault:""`
	KafkaBrokers     string        `env:"KAFKA_BROKERS" envDefault:"localhost:9092"`
	KafkaGroupID     string        `env:"KAFKA_GROUP_ID" envDefault:"analytics-service-v1"`
	KafkaTopics      string        `env:"KAFKA_TOPICS" envDefault:"identity.events.v1,session.events.v1,media.events.v1,playback.events.v1,creator.events.v1,community.events.v1,recommendation.events.v1,search.events.v1,moderation.events.v1,commerce.events.v1,system.events.v1"`
	ClickHouseURL    string        `env:"CLICKHOUSE_URL" envDefault:"http://localhost:8123"`
	ClickHouseDB     string        `env:"CLICKHOUSE_DATABASE" envDefault:"next_analytics"`
	ClickHouseUser   string        `env:"CLICKHOUSE_USERNAME" envDefault:"default"`
	ClickHousePass   string        `env:"CLICKHOUSE_PASSWORD" envDefault:""`
	BatchSize        int           `env:"ANALYTICS_BATCH_SIZE" envDefault:"1000"`
	BatchMaxWait     time.Duration `env:"ANALYTICS_BATCH_MAX_WAIT" envDefault:"1s"`
	BackpressureSize int           `env:"ANALYTICS_BACKPRESSURE_SIZE" envDefault:"50000"`
	ShutdownTimeout  time.Duration `env:"ANALYTICS_SHUTDOWN_TIMEOUT" envDefault:"30s"`
}

func (c Config) Brokers() []string {
	return splitCSV(c.KafkaBrokers)
}

func (c Config) Topics() []string {
	return splitCSV(c.KafkaTopics)
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			result = append(result, part)
		}
	}
	return result
}
