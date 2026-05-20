package kafka

import (
	"context"
	"time"

	"github.com/segmentio/kafka-go"
)

type Message struct {
	Topic   string
	Key     string
	Value   []byte
	Headers map[string]string
}

type Publisher interface {
	Publish(context.Context, Message) error
	Close() error
}

type Producer struct {
	writer *kafka.Writer
}

func NewProducer(brokers []string, clientID string) *Producer {
	return &Producer{writer: &kafka.Writer{
		Addr:                   kafka.TCP(brokers...),
		Balancer:               &kafka.Hash{},
		RequiredAcks:           kafka.RequireAll,
		AllowAutoTopicCreation: false,
		BatchSize:              256,
		BatchTimeout:           20 * time.Millisecond,
		Transport:              &kafka.Transport{ClientID: clientID, IdleTimeout: 30 * time.Second},
		Compression:            kafka.Snappy,
	}}
}

func (p *Producer) Publish(ctx context.Context, msg Message) error {
	headers := make([]kafka.Header, 0, len(msg.Headers))
	for key, value := range msg.Headers {
		headers = append(headers, kafka.Header{Key: key, Value: []byte(value)})
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Topic:   msg.Topic,
		Key:     []byte(msg.Key),
		Value:   msg.Value,
		Headers: headers,
		Time:    time.Now().UTC(),
	})
}

func (p *Producer) Close() error {
	return p.writer.Close()
}
