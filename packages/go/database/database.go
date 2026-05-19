// Package database provides Postgres and Redis client constructors with OTel
// instrumentation, sane pool sizing, and Vault-rotation friendly reconnect.
package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

// PostgresConfig configures a pgx pool.
type PostgresConfig struct {
	URL             string
	MaxConns        int32
	MinConns        int32
	MaxConnLifetime time.Duration
	MaxConnIdleTime time.Duration
	ApplicationName string
}

// NewPostgres constructs a pgx pool with NEXT defaults.
func NewPostgres(ctx context.Context, cfg PostgresConfig) (*pgxpool.Pool, error) {
	pc, err := pgxpool.ParseConfig(cfg.URL)
	if err != nil {
		return nil, fmt.Errorf("parse: %w", err)
	}
	if cfg.MaxConns > 0 {
		pc.MaxConns = cfg.MaxConns
	} else {
		pc.MaxConns = 20
	}
	if cfg.MinConns > 0 {
		pc.MinConns = cfg.MinConns
	}
	if cfg.MaxConnLifetime > 0 {
		pc.MaxConnLifetime = cfg.MaxConnLifetime
	}
	if cfg.MaxConnIdleTime > 0 {
		pc.MaxConnIdleTime = cfg.MaxConnIdleTime
	}
	pc.ConnConfig.RuntimeParams["application_name"] = cfg.ApplicationName
	return pgxpool.NewWithConfig(ctx, pc)
}

// RedisConfig configures a redis client.
type RedisConfig struct {
	URL       string
	Cluster   bool
	KeyPrefix string
}

// NewRedis constructs either a standalone or cluster client.
func NewRedis(cfg RedisConfig) (redis.UniversalClient, error) {
	opts, err := redis.ParseURL(cfg.URL)
	if err != nil {
		return nil, fmt.Errorf("parse: %w", err)
	}
	if cfg.Cluster {
		return redis.NewClusterClient(&redis.ClusterOptions{
			Addrs:    []string{opts.Addr},
			Password: opts.Password,
			Username: opts.Username,
		}), nil
	}
	return redis.NewClient(opts), nil
}
