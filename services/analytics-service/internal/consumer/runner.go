package consumer

import (
	"context"
	"errors"
	"log/slog"
	"sync"
	"time"

	"github.com/segmentio/kafka-go"

	analyticsmetrics "github.com/next-ecosystem/next/services/analytics-service/internal/metrics"
)

type Runner struct {
	brokers []string
	groupID string
	topics  []string
	process *Processor
	metrics *analyticsmetrics.Metrics
}

func NewRunner(brokers []string, groupID string, topics []string, process *Processor, metrics *analyticsmetrics.Metrics) *Runner {
	return &Runner{brokers: brokers, groupID: groupID, topics: topics, process: process, metrics: metrics}
}

func (r *Runner) Run(ctx context.Context) error {
	if len(r.topics) == 0 {
		return errors.New("at least one topic is required")
	}
	var wg sync.WaitGroup
	errCh := make(chan error, len(r.topics))
	for _, topic := range r.topics {
		topic := topic
		wg.Add(1)
		go func() {
			defer wg.Done()
			errCh <- r.runTopic(ctx, topic)
		}()
	}

	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-ctx.Done():
		<-done
		return nil
	case err := <-errCh:
		if err != nil && !errors.Is(err, context.Canceled) {
			return err
		}
		return nil
	}
}

func (r *Runner) runTopic(ctx context.Context, topic string) error {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:        r.brokers,
		GroupID:        r.groupID,
		Topic:          topic,
		MinBytes:       1,
		MaxBytes:       10e6,
		MaxWait:        500 * time.Millisecond,
		CommitInterval: time.Second,
	})
	defer func() { _ = reader.Close() }()
	slog.Info("analytics consumer subscribed", "topic", topic, "group", r.groupID)

	for {
		msg, err := reader.FetchMessage(ctx)
		if err != nil {
			if errors.Is(err, context.Canceled) {
				return nil
			}
			return err
		}
		r.metrics.KafkaConsumerLag.WithLabelValues(topic, r.groupID).Set(float64(reader.Stats().Lag))
		if err := r.process.Process(ctx, topic, string(msg.Key), msg.Value); err != nil {
			return err
		}
		if err := reader.CommitMessages(ctx, msg); err != nil {
			return err
		}
	}
}
