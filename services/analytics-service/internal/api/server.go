package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/next-ecosystem/next/services/analytics-service/internal/clickhouse"
	analyticsmetrics "github.com/next-ecosystem/next/services/analytics-service/internal/metrics"
)

type Server struct {
	writer         clickhouse.Writer
	metrics        *analyticsmetrics.Metrics
	serviceStarted time.Time
}

func New(writer clickhouse.Writer, metrics *analyticsmetrics.Metrics) *Server {
	return &Server{writer: writer, metrics: metrics, serviceStarted: time.Now().UTC()}
}

func (s *Server) Routes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID, middleware.RealIP, middleware.Recoverer, middleware.Compress(5))
	r.Get("/health", s.health)
	r.Get("/metrics", func(w http.ResponseWriter, r *http.Request) {
		s.metrics.Handler().ServeHTTP(w, r)
	})
	r.Get("/internal/v1/query/{table}", s.query)
	return r
}

func (s *Server) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"status":     "ok",
		"service":    "analytics-service",
		"started_at": s.serviceStarted.Format(time.RFC3339),
	})
}

func (s *Server) query(w http.ResponseWriter, r *http.Request) {
	table := chi.URLParam(r, "table")
	if !allowedTable(table) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "unsupported table"})
		return
	}
	limit := 100
	if raw := r.URL.Query().Get("limit"); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil || parsed <= 0 || parsed > 1000 {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "limit must be between 1 and 1000"})
			return
		}
		limit = parsed
	}
	query := "SELECT * FROM " + table + " ORDER BY timestamp DESC LIMIT " + strconv.Itoa(limit)
	rows, err := s.writer.Query(r.Context(), query)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"rows": rows})
}

func allowedTable(table string) bool {
	switch table {
	case "raw_events", "playback_events", "session_events", "creator_events", "media_events", "recommendation_events", "daily_user_activity", "daily_creator_activity", "video_performance_daily", "feed_quality_daily", "search_activity_daily":
		return true
	default:
		return false
	}
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
