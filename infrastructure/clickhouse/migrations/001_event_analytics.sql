CREATE DATABASE IF NOT EXISTS next_analytics;

CREATE TABLE IF NOT EXISTS next_analytics.raw_events
(
    event_id UUID,
    event_type LowCardinality(String),
    event_version LowCardinality(String),
    event_category LowCardinality(String),
    producer LowCardinality(String),
    user_id Nullable(UUID),
    creator_id Nullable(UUID),
    media_id Nullable(String),
    session_id Nullable(UUID),
    device_id Nullable(String),
    timestamp DateTime64(3, 'UTC'),
    ingestion_timestamp DateTime64(3, 'UTC') DEFAULT now64(3),
    payload JSON,
    metadata JSON,
    kafka_topic LowCardinality(String) DEFAULT '',
    kafka_partition UInt32 DEFAULT 0,
    kafka_offset UInt64 DEFAULT 0
)
ENGINE = ReplacingMergeTree(ingestion_timestamp)
PARTITION BY toYYYYMM(timestamp)
ORDER BY (event_category, event_type, timestamp, event_id)
TTL timestamp + INTERVAL 90 DAY
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS next_analytics.playback_events
(
    event_id UUID,
    event_type LowCardinality(String),
    event_version LowCardinality(String),
    event_category LowCardinality(String) DEFAULT 'playback',
    producer LowCardinality(String),
    user_id Nullable(UUID),
    creator_id Nullable(UUID),
    media_id Nullable(String),
    session_id Nullable(UUID),
    device_id Nullable(String),
    timestamp DateTime64(3, 'UTC'),
    ingestion_timestamp DateTime64(3, 'UTC') DEFAULT now64(3),
    payload JSON,
    metadata JSON,
    position_ms Nullable(UInt64),
    watch_time_ms Nullable(UInt64),
    buffer_duration_ms Nullable(UInt64),
    completion_ratio Nullable(Float32),
    rendition LowCardinality(Nullable(String)),
    error_code Nullable(String)
)
ENGINE = ReplacingMergeTree(ingestion_timestamp)
PARTITION BY toYYYYMM(timestamp)
ORDER BY (media_id, user_id, session_id, timestamp, event_id)
TTL timestamp + INTERVAL 180 DAY;

CREATE TABLE IF NOT EXISTS next_analytics.session_events
(
    event_id UUID,
    event_type LowCardinality(String),
    event_version LowCardinality(String),
    event_category LowCardinality(String) DEFAULT 'session',
    producer LowCardinality(String),
    user_id Nullable(UUID),
    creator_id Nullable(UUID),
    media_id Nullable(String),
    session_id Nullable(UUID),
    device_id Nullable(String),
    timestamp DateTime64(3, 'UTC'),
    ingestion_timestamp DateTime64(3, 'UTC') DEFAULT now64(3),
    payload JSON,
    metadata JSON,
    duration_ms Nullable(UInt64),
    auth_method LowCardinality(Nullable(String)),
    end_reason LowCardinality(Nullable(String))
)
ENGINE = ReplacingMergeTree(ingestion_timestamp)
PARTITION BY toYYYYMM(timestamp)
ORDER BY (user_id, session_id, timestamp, event_id)
TTL timestamp + INTERVAL 180 DAY;

CREATE TABLE IF NOT EXISTS next_analytics.creator_events
(
    event_id UUID,
    event_type LowCardinality(String),
    event_version LowCardinality(String),
    event_category LowCardinality(String) DEFAULT 'creator',
    producer LowCardinality(String),
    user_id Nullable(UUID),
    creator_id Nullable(UUID),
    media_id Nullable(String),
    session_id Nullable(UUID),
    device_id Nullable(String),
    timestamp DateTime64(3, 'UTC'),
    ingestion_timestamp DateTime64(3, 'UTC') DEFAULT now64(3),
    payload JSON,
    metadata JSON,
    content_type LowCardinality(Nullable(String)),
    visibility LowCardinality(Nullable(String)),
    verification_level LowCardinality(Nullable(String))
)
ENGINE = ReplacingMergeTree(ingestion_timestamp)
PARTITION BY toYYYYMM(timestamp)
ORDER BY (creator_id, event_type, timestamp, event_id)
TTL timestamp + INTERVAL 365 DAY;

CREATE TABLE IF NOT EXISTS next_analytics.media_events
(
    event_id UUID,
    event_type LowCardinality(String),
    event_version LowCardinality(String),
    event_category LowCardinality(String) DEFAULT 'media',
    producer LowCardinality(String),
    user_id Nullable(UUID),
    creator_id Nullable(UUID),
    media_id Nullable(String),
    session_id Nullable(UUID),
    device_id Nullable(String),
    timestamp DateTime64(3, 'UTC'),
    ingestion_timestamp DateTime64(3, 'UTC') DEFAULT now64(3),
    payload JSON,
    metadata JSON,
    upload_id Nullable(String),
    file_size_bytes Nullable(UInt64),
    pipeline_id Nullable(String),
    visibility LowCardinality(Nullable(String))
)
ENGINE = ReplacingMergeTree(ingestion_timestamp)
PARTITION BY toYYYYMM(timestamp)
ORDER BY (media_id, creator_id, event_type, timestamp, event_id)
TTL timestamp + INTERVAL 365 DAY;

CREATE TABLE IF NOT EXISTS next_analytics.recommendation_events
(
    event_id UUID,
    event_type LowCardinality(String),
    event_version LowCardinality(String),
    event_category LowCardinality(String) DEFAULT 'recommendation',
    producer LowCardinality(String),
    user_id Nullable(UUID),
    creator_id Nullable(UUID),
    media_id Nullable(String),
    session_id Nullable(UUID),
    device_id Nullable(String),
    timestamp DateTime64(3, 'UTC'),
    ingestion_timestamp DateTime64(3, 'UTC') DEFAULT now64(3),
    payload JSON,
    metadata JSON,
    surface LowCardinality(Nullable(String)),
    algorithm LowCardinality(Nullable(String)),
    rank Nullable(UInt32),
    candidate_count Nullable(UInt32),
    dwell_ms Nullable(UInt64)
)
ENGINE = ReplacingMergeTree(ingestion_timestamp)
PARTITION BY toYYYYMM(timestamp)
ORDER BY (user_id, surface, timestamp, event_id)
TTL timestamp + INTERVAL 180 DAY;

CREATE TABLE IF NOT EXISTS next_analytics.daily_user_activity
(
    event_id UUID DEFAULT generateUUIDv4(),
    event_type LowCardinality(String) DEFAULT 'daily_user_activity',
    event_version LowCardinality(String) DEFAULT '1.0',
    user_id Nullable(UUID),
    creator_id Nullable(UUID),
    media_id Nullable(String),
    session_id Nullable(UUID),
    device_id Nullable(String),
    timestamp DateTime64(3, 'UTC'),
    ingestion_timestamp DateTime64(3, 'UTC') DEFAULT now64(3),
    metadata JSON,
    day Date,
    events UInt64,
    sessions UInt64,
    playback_starts UInt64,
    watch_time_ms UInt64
)
ENGINE = SummingMergeTree
PARTITION BY toYYYYMM(day)
ORDER BY (day, user_id);

CREATE TABLE IF NOT EXISTS next_analytics.daily_creator_activity
(
    event_id UUID DEFAULT generateUUIDv4(),
    event_type LowCardinality(String) DEFAULT 'daily_creator_activity',
    event_version LowCardinality(String) DEFAULT '1.0',
    user_id Nullable(UUID),
    creator_id Nullable(UUID),
    media_id Nullable(String),
    session_id Nullable(UUID),
    device_id Nullable(String),
    timestamp DateTime64(3, 'UTC'),
    ingestion_timestamp DateTime64(3, 'UTC') DEFAULT now64(3),
    metadata JSON,
    day Date,
    events UInt64,
    published_media UInt64,
    verified_events UInt64
)
ENGINE = SummingMergeTree
PARTITION BY toYYYYMM(day)
ORDER BY (day, creator_id);

CREATE TABLE IF NOT EXISTS next_analytics.video_performance_daily
(
    event_id UUID DEFAULT generateUUIDv4(),
    event_type LowCardinality(String) DEFAULT 'video_performance_daily',
    event_version LowCardinality(String) DEFAULT '1.0',
    user_id Nullable(UUID),
    creator_id Nullable(UUID),
    media_id Nullable(String),
    session_id Nullable(UUID),
    device_id Nullable(String),
    timestamp DateTime64(3, 'UTC'),
    ingestion_timestamp DateTime64(3, 'UTC') DEFAULT now64(3),
    metadata JSON,
    day Date,
    playback_starts UInt64,
    completions UInt64,
    buffers UInt64,
    errors UInt64,
    watch_time_ms UInt64
)
ENGINE = SummingMergeTree
PARTITION BY toYYYYMM(day)
ORDER BY (day, media_id, creator_id);

CREATE TABLE IF NOT EXISTS next_analytics.feed_quality_daily
(
    event_id UUID DEFAULT generateUUIDv4(),
    event_type LowCardinality(String) DEFAULT 'feed_quality_daily',
    event_version LowCardinality(String) DEFAULT '1.0',
    user_id Nullable(UUID),
    creator_id Nullable(UUID),
    media_id Nullable(String),
    session_id Nullable(UUID),
    device_id Nullable(String),
    timestamp DateTime64(3, 'UTC'),
    ingestion_timestamp DateTime64(3, 'UTC') DEFAULT now64(3),
    metadata JSON,
    day Date,
    surface LowCardinality(String),
    feed_requests UInt64,
    served UInt64,
    clicks UInt64,
    skips UInt64,
    avg_dwell_ms Float64
)
ENGINE = SummingMergeTree
PARTITION BY toYYYYMM(day)
ORDER BY (day, surface, user_id);

CREATE TABLE IF NOT EXISTS next_analytics.search_activity_daily
(
    event_id UUID DEFAULT generateUUIDv4(),
    event_type LowCardinality(String) DEFAULT 'search_activity_daily',
    event_version LowCardinality(String) DEFAULT '1.0',
    user_id Nullable(UUID),
    creator_id Nullable(UUID),
    media_id Nullable(String),
    session_id Nullable(UUID),
    device_id Nullable(String),
    timestamp DateTime64(3, 'UTC'),
    ingestion_timestamp DateTime64(3, 'UTC') DEFAULT now64(3),
    metadata JSON,
    day Date,
    searches UInt64,
    result_clicks UInt64,
    zero_result_searches UInt64
)
ENGINE = SummingMergeTree
PARTITION BY toYYYYMM(day)
ORDER BY (day, user_id);
