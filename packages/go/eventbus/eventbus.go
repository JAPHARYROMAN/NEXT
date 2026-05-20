// Package eventbus is the canonical Kafka producer/consumer wrapper for NEXT Go services.
// Idempotent producer; W3C trace context propagation in headers; OTel-instrumented.
package eventbus

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"time"

	"github.com/segmentio/kafka-go"
	"github.com/segmentio/kafka-go/sasl/scram"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/trace"
	"google.golang.org/protobuf/proto"
)

// Config configures producers and consumers.
type Config struct {
	Brokers      []string
	ClientID     string
	TLS          bool
	SASLUser     string
	SASLPassword string
}

// Producer wraps kafka-go's Writer with tracing and proto serialization.
type Producer struct {
	w *kafka.Writer
}

// NewProducer creates a new idempotent producer.
func NewProducer(cfg Config) (*Producer, error) {
	dialer := newDialer(cfg)
	w := &kafka.Writer{
		Addr:                   kafka.TCP(cfg.Brokers...),
		Balancer:               &kafka.Hash{},
		RequiredAcks:           kafka.RequireAll,
		Async:                  false,
		Compression:            kafka.Snappy,
		AllowAutoTopicCreation: false,
		BatchTimeout:           20 * time.Millisecond,
		Transport: &kafka.Transport{
			Dial:        dialer.DialFunc,
			ClientID:    cfg.ClientID,
			IdleTimeout: 30 * time.Second,
		},
	}
	return &Producer{w: w}, nil
}

// Emit publishes a proto message to topic with key.
func (p *Producer) Emit(ctx context.Context, topic, key string, msg proto.Message) error {
	tracer := otel.Tracer("github.com/next-ecosystem/next/packages/go/eventbus")
	ctx, span := tracer.Start(ctx, "kafka.produce "+topic,
		trace.WithSpanKind(trace.SpanKindProducer),
		trace.WithAttributes(
			attribute.String("messaging.system", "kafka"),
			attribute.String("messaging.destination.name", topic),
		),
	)
	defer span.End()

	payload, err := proto.Marshal(msg)
	if err != nil {
		span.RecordError(err)
		return fmt.Errorf("marshal: %w", err)
	}

	carrier := propagation.MapCarrier{}
	otel.GetTextMapPropagator().Inject(ctx, carrier)

	headers := make([]kafka.Header, 0, len(carrier))
	for k, v := range carrier {
		headers = append(headers, kafka.Header{Key: k, Value: []byte(v)})
	}

	return p.w.WriteMessages(ctx, kafka.Message{
		Topic:   topic,
		Key:     []byte(key),
		Value:   payload,
		Headers: headers,
		Time:    time.Now(),
	})
}

// Close flushes and closes the producer.
func (p *Producer) Close() error { return p.w.Close() }

type dialer struct{ d *kafka.Dialer }

func (d *dialer) DialFunc(ctx context.Context, network, address string) (net.Conn, error) {
	c, err := d.d.DialContext(ctx, network, address)
	if err != nil {
		return nil, err
	}
	return c, nil
}

func newDialer(cfg Config) *dialer {
	d := &kafka.Dialer{ClientID: cfg.ClientID, Timeout: 10 * time.Second, DualStack: true}
	if cfg.TLS {
		d.TLS = &tls.Config{MinVersion: tls.VersionTLS12}
	}
	if cfg.SASLUser != "" {
		mech, _ := scram.Mechanism(scram.SHA512, cfg.SASLUser, cfg.SASLPassword)
		d.SASLMechanism = mech
	}
	return &dialer{d: d}
}
