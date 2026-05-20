package security

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

var (
	ErrMissingProducer = errors.New("missing producer")
	ErrUnknownProducer = errors.New("unknown producer")
	ErrUnsigned        = errors.New("request signature required")
	ErrBadSignature    = errors.New("bad request signature")
	ErrStaleSignature  = errors.New("stale request signature")
)

type Authenticator struct {
	secrets       map[string][]byte
	allowUnsigned bool
	maxSkew       time.Duration
}

func NewAuthenticator(rawSecrets string, allowUnsigned bool) (*Authenticator, error) {
	secrets := map[string][]byte{}
	for _, item := range strings.Split(rawSecrets, ",") {
		item = strings.TrimSpace(item)
		if item == "" {
			continue
		}
		parts := strings.SplitN(item, "=", 2)
		if len(parts) != 2 || strings.TrimSpace(parts[0]) == "" || strings.TrimSpace(parts[1]) == "" {
			return nil, fmt.Errorf("EVENT_PRODUCER_SECRETS entries must be producer=secret")
		}
		secrets[strings.TrimSpace(parts[0])] = []byte(strings.TrimSpace(parts[1]))
	}
	return &Authenticator{secrets: secrets, allowUnsigned: allowUnsigned, maxSkew: 5 * time.Minute}, nil
}

func (a *Authenticator) Authenticate(r *http.Request, body []byte, producer string) error {
	if strings.TrimSpace(producer) == "" {
		return ErrMissingProducer
	}
	secret, ok := a.secrets[producer]
	if !ok {
		if a.allowUnsigned && len(a.secrets) == 0 {
			return nil
		}
		return ErrUnknownProducer
	}

	signature := r.Header.Get("X-NEXT-Signature")
	timestamp := r.Header.Get("X-NEXT-Timestamp")
	if signature == "" || timestamp == "" {
		if a.allowUnsigned {
			return nil
		}
		return ErrUnsigned
	}

	ts, err := strconv.ParseInt(timestamp, 10, 64)
	if err != nil {
		return ErrBadSignature
	}
	if skew := time.Since(time.Unix(ts, 0)); skew > a.maxSkew || skew < -a.maxSkew {
		return ErrStaleSignature
	}

	mac := hmac.New(sha256.New, secret)
	_, _ = mac.Write([]byte(timestamp))
	_, _ = mac.Write([]byte("."))
	_, _ = mac.Write(body)
	expected := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(expected), []byte(strings.TrimPrefix(signature, "sha256="))) {
		return ErrBadSignature
	}
	return nil
}
