package security

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strconv"
	"strings"
	"testing"
	"time"
)

func TestAuthenticateSignedRequest(t *testing.T) {
	auth, err := NewAuthenticator("playback-service=test-secret", false)
	if err != nil {
		t.Fatalf("auth: %v", err)
	}
	body := []byte(`{"event_id":"11111111-1111-4111-8111-111111111111"}`)
	timestamp := time.Now().Unix()
	req, err := http.NewRequest(http.MethodPost, "/v1/events", strings.NewReader(string(body)))
	if err != nil {
		t.Fatalf("request: %v", err)
	}
	req.Header.Set("X-NEXT-Timestamp", formatUnix(timestamp))
	req.Header.Set("X-NEXT-Signature", "sha256="+sign("test-secret", timestamp, body))

	if err := auth.Authenticate(req, body, "playback-service"); err != nil {
		t.Fatalf("authenticate: %v", err)
	}
}

func TestAuthenticateRejectsUnknownProducer(t *testing.T) {
	auth, err := NewAuthenticator("playback-service=test-secret", false)
	if err != nil {
		t.Fatalf("auth: %v", err)
	}
	req, err := http.NewRequest(http.MethodPost, "/v1/events", strings.NewReader("{}"))
	if err != nil {
		t.Fatalf("request: %v", err)
	}
	if err := auth.Authenticate(req, []byte("{}"), "unknown-service"); err != ErrUnknownProducer {
		t.Fatalf("expected ErrUnknownProducer, got %v", err)
	}
}

func sign(secret string, timestamp int64, body []byte) string {
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(formatUnix(timestamp)))
	_, _ = mac.Write([]byte("."))
	_, _ = mac.Write(body)
	return hex.EncodeToString(mac.Sum(nil))
}

func formatUnix(value int64) string {
	return strconv.FormatInt(value, 10)
}
